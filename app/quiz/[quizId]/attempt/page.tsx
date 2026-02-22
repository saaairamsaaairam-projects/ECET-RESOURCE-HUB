import AttemptQuestionBlock from "@/components/quiz/AttemptQuestionBlock";

export default async function AttemptPage({ searchParams, params }: any) {
  const { quizId } = await params;
  const page = Number(searchParams?.page || "1");

  return <AttemptQuestionBlock quizId={quizId} page={page} />;
}

