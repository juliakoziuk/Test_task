import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnswerValue, Question } from '../quizzes/models/question.model';
import { Quiz } from '../quizzes/models/quiz.model';
import { hasValidShape, isCorrect } from '../quizzes/question-answers';
import { AttemptDetailDto, AttemptSummaryDto } from './dto/attempt-response.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { Attempt, AttemptAnswer } from './models/attempt.model';

export interface AttemptStats {
  attemptsCount: number;
  /** Mean of score/total over attempts with scored questions, in percent; null without attempts. */
  averagePercent: number | null;
}

const toSummary = (attempt: Attempt, quizTitle: string): AttemptSummaryDto => ({
  id: attempt.id,
  quizId: attempt.quizId,
  quizTitle,
  score: attempt.score,
  total: attempt.total,
  createdAt: attempt.createdAt,
});

@Injectable()
export class AttemptsService {
  constructor(
    @InjectModel(Attempt) private readonly attemptModel: typeof Attempt,
    @InjectModel(Question) private readonly questionModel: typeof Question,
    @InjectModel(Quiz) private readonly quizModel: typeof Quiz,
  ) {}

  async submit(quizId: number, userId: number, dto: SubmitAttemptDto): Promise<AttemptDetailDto> {
    const quiz = await this.quizModel.findByPk(quizId, { attributes: ['id', 'title'] });
    if (!quiz) throw new NotFoundException(`Quiz ${quizId} not found`);

    const questions = await this.questionModel
      .scope('withAnswers')
      .findAll({ where: { quizId }, order: [['position', 'ASC']] });

    const given = new Map<number, AnswerValue>();
    for (const { questionId, answer } of dto.answers) {
      const question = questions.find((q) => q.id === questionId);
      if (!question) {
        throw new BadRequestException(`Question ${questionId} does not belong to quiz ${quizId}`);
      }
      if (given.has(questionId)) {
        throw new BadRequestException(`Question ${questionId} is answered more than once`);
      }
      if (!hasValidShape(question.type, answer)) {
        throw new BadRequestException(
          `Answer to question ${questionId} has the wrong format for a "${question.type}" question`,
        );
      }
      given.set(questionId, answer);
    }

    const answers: AttemptAnswer[] = questions.map((q) => {
      const answer = given.get(q.id) ?? null;
      const scored = q.correctAnswer !== null && q.correctAnswer !== undefined;
      return {
        questionId: q.id,
        text: q.text,
        type: q.type,
        answer,
        correctAnswer: q.correctAnswer ?? null,
        isCorrect: scored
          ? answer !== null && isCorrect({ type: q.type, correctAnswer: q.correctAnswer! }, answer)
          : null,
      };
    });
    const scored = answers.filter((a) => a.isCorrect !== null);

    const attempt = await this.attemptModel.create({
      userId,
      quizId,
      score: scored.filter((a) => a.isCorrect).length,
      total: scored.length,
      answers,
    });
    return { ...toSummary(attempt, quiz.title), answers };
  }

  async findAllForUser(userId: number): Promise<AttemptSummaryDto[]> {
    const attempts = await this.attemptModel.findAll({
      where: { userId },
      attributes: { exclude: ['answers'] },
      include: [{ model: Quiz, attributes: ['id', 'title'] }],
      order: [['createdAt', 'DESC']],
    });
    return attempts.map((a) => toSummary(a, a.quiz.title));
  }

  async findOneForUser(id: number, userId: number): Promise<AttemptDetailDto> {
    const attempt = await this.attemptModel.findOne({
      where: { id, userId },
      include: [{ model: Quiz, attributes: ['id', 'title'] }],
    });
    if (!attempt) throw new NotFoundException(`Attempt ${id} not found`);
    return { ...toSummary(attempt, attempt.quiz.title), answers: attempt.answers };
  }

  async statsForUser(userId: number): Promise<AttemptStats> {
    const attempts = await this.attemptModel.findAll({
      where: { userId },
      attributes: ['score', 'total'],
    });
    const percents = attempts.filter((a) => a.total > 0).map((a) => (a.score / a.total) * 100);
    return {
      attemptsCount: attempts.length,
      averagePercent: percents.length
        ? Math.round((percents.reduce((sum, p) => sum + p, 0) / percents.length) * 10) / 10
        : null,
    };
  }
}
