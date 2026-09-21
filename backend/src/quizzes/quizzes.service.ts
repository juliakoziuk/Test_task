import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { Question, QuestionType } from './models/question.model';
import { Quiz } from './models/quiz.model';
import { validateCorrectAnswer } from './question-answers';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz) private readonly quizModel: typeof Quiz,
    @InjectModel(Question) private readonly questionModel: typeof Question,
    private readonly sequelize: Sequelize,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateQuizDto, userId: number): Promise<Quiz> {
    await this.usersService.findOne(userId);
    dto.questions.forEach((q, i) => {
      const problem = validateCorrectAnswer(q);
      if (problem) throw new BadRequestException(`questions.${i}: ${problem}`);
    });

    const quizId = await this.sequelize.transaction(async (transaction) => {
      const quiz = await this.quizModel.create({ title: dto.title, userId }, { transaction });
      await this.questionModel.bulkCreate(
        dto.questions.map((q, position) => ({
          quizId: quiz.id,
          text: q.text,
          type: q.type,
          options: q.type === QuestionType.CHECKBOX ? q.options : [],
          correctAnswer: q.correctAnswer,
          position,
        })),
        { transaction },
      );
      return quiz.id;
    });
    return this.findOne(quizId);
  }

  async findAll(userId?: number) {
    const quizzes = await this.quizModel.findAll({
      where: userId ? { userId } : undefined,
      attributes: {
        include: [
          [
            Sequelize.literal(
              '(SELECT COUNT(*) FROM questions WHERE questions."quizId" = "Quiz"."id")',
            ),
            'questionCount',
          ],
        ],
      },
      order: [['createdAt', 'DESC']],
    });
    return quizzes.map((q) => ({
      id: q.id,
      userId: q.userId,
      title: q.title,
      questionCount: Number(q.get('questionCount')),
    }));
  }

  countByUser(userId: number): Promise<number> {
    return this.quizModel.count({ where: { userId } });
  }

  async findOne(id: number): Promise<Quiz> {
    const quiz = await this.quizModel.findByPk(id, {
      include: [Question, { model: User, attributes: ['id', 'name', 'email'] }],
      order: [[{ model: Question, as: 'questions' }, 'position', 'ASC']],
    });
    if (!quiz) throw new NotFoundException(`Quiz ${id} not found`);
    return quiz;
  }

  async remove(id: number, userId: number): Promise<void> {
    const quiz = await this.findOne(id);
    if (quiz.userId !== userId) throw new ForbiddenException('You can only delete your own quizzes');
    await quiz.destroy();
  }
}
