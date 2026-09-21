import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { Question } from '../quizzes/models/question.model';
import { Quiz } from '../quizzes/models/quiz.model';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';
import { Attempt } from './models/attempt.model';

@Module({
  imports: [SequelizeModule.forFeature([Attempt, Question, Quiz]), AuthModule],
  controllers: [AttemptsController],
  providers: [AttemptsService],
  exports: [AttemptsService],
})
export class AttemptsModule {}
