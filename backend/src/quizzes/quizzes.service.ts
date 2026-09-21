import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  private assertValidQuestions(dto: CreateQuizDto) {
    dto.questions.forEach((q, i) => {
      const problem = validateCorrectAnswer(q);
      if (problem) throw new BadRequestException(`questions.${i}: ${problem}`);
    });
  }

  private questionRows(dto: CreateQuizDto, quizId: number) {
    return dto.questions.map((q, position) => ({
      quizId,
      text: q.text,
      type: q.type,
      options: q.type === QuestionType.CHECKBOX ? q.options : [],
      correctAnswer: q.correctAnswer,
      position,
    }));
  }

  async create(dto: CreateQuizDto, userId: string): Promise<Quiz> {
    await this.usersService.findOne(userId);
    this.assertValidQuestions(dto);

    const quizId = await this.sequelize.transaction(async (transaction) => {
      const quiz = await this.quizModel.create({ title: dto.title, userId }, { transaction });
      await this.questionModel.bulkCreate(this.questionRows(dto, quiz.id), { transaction });
      return quiz.id;
    });
    return this.findOne(quizId);
  }

  /** Replaces the title and all questions of one of your own quizzes. */
  async update(id: number, dto: CreateQuizDto, userId: string): Promise<Quiz> {
    const quiz = await this.findOne(id);
    if (quiz.userId !== userId) throw new ForbiddenException('You can only edit your own quizzes');
    this.assertValidQuestions(dto);

    // Past attempts keep their own snapshot of the questions, so replacing them is safe.
    await this.sequelize.transaction(async (transaction) => {
      await quiz.update({ title: dto.title }, { transaction });
      await this.questionModel.destroy({ where: { quizId: id }, transaction });
      await this.questionModel.bulkCreate(this.questionRows(dto, id), { transaction });
    });
    return this.findOne(id);
  }

  /** The quiz including correct answers, for its owner only (used by the edit form). */
  async findOneForEdit(id: number, userId: string) {
    const quiz = await this.findOne(id);
    if (quiz.userId !== userId) throw new ForbiddenException('You can only edit your own quizzes');
    const questions = await this.questionModel.scope('withAnswers').findAll({
      where: { quizId: id },
      order: [['position', 'ASC']],
    });
    return {
      id: quiz.id,
      userId: quiz.userId,
      title: quiz.title,
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        position: q.position,
        correctAnswer: q.correctAnswer,
      })),
    };
  }

  async findAll(userId?: string) {
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

  countByUser(userId: string): Promise<number> {
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

  async remove(id: number, userId: string): Promise<void> {
    const quiz = await this.findOne(id);
    if (quiz.userId !== userId)
      throw new ForbiddenException('You can only delete your own quizzes');
    await quiz.destroy();
  }
}
