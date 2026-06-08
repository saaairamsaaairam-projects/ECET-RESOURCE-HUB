import AttemptQuestionBlock from "@/components/quiz/AttemptQuestionBlock";

export default async function AttemptPage({ searchParams, params }: any) {
  const { quizId } = await params;
  // searchParams is a Promise in Next.js server components
  const sp: any = await searchParams;
  const page = Number(sp?.page || "1");
  const attempt = sp?.attempt || sp?.attemptId || null;

  return <AttemptQuestionBlock quizId={quizId} page={page} initialAttemptId={attempt} />;
}

