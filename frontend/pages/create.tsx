import { useRouter } from 'next/router';
import QuizForm from '../components/QuizForm';
import { quizApi } from '../services/api';
import type { CreateQuizPayload } from '../types/quiz';

export default function CreateQuizPage() {
  const router = useRouter();

  const handleSubmit = async (payload: CreateQuizPayload) => {
    const quiz = await quizApi.create(payload);
    await router.push(`/quizzes/${quiz.id}`);
  };

  return (
    <>
      <h1>Create quiz</h1>
      <QuizForm onSubmit={handleSubmit} />
    </>
  );
}
