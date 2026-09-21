import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcryptjs';
import { AppModule } from './app.module';
import { QuestionType } from './quizzes/models/question.model';
import { QuizzesService } from './quizzes/quizzes.service';
import { UsersService } from './users/users.service';

const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'password123';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const users = app.get(UsersService);
  const quizzes = app.get(QuizzesService);

  const user = await users.create({
    name: 'Demo User',
    email: DEMO_EMAIL,
    passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
  });

  await quizzes.create(
    {
      title: 'JavaScript Basics',
      questions: [
        {
          text: 'JavaScript is a statically typed language.',
          type: QuestionType.BOOLEAN,
          correctAnswer: false,
        },
        {
          text: 'What keyword declares a block-scoped variable?',
          type: QuestionType.INPUT,
          correctAnswer: 'let',
        },
        {
          text: 'Which of these are primitive types?',
          type: QuestionType.CHECKBOX,
          options: ['string', 'object', 'number', 'array'],
          correctAnswer: ['string', 'number'],
        },
      ],
    },
    user.id,
  );

  await app.close();
  console.log(`Seeded demo user (${DEMO_EMAIL} / ${DEMO_PASSWORD}) and a sample quiz.`);
}
seed();
