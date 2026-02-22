"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function StartCreateAttempt() {
  const router = useRouter();
  const { quizId } = useParams();

  useEffect(() => {
    let mounted = true;

    const createAttempt = async () => {
      try {
        const session = await supabase.auth.getSession();
        const user = (session as any)?.data?.session?.user;
        if (!user) {
          // not logged in
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("quiz_attempts")
          .insert([{ quiz_id: quizId, user_id: user.id, status: "in_progress" }])
          .select()
          .single();

        if (error) {
          console.error("Error creating attempt", error);
          alert("Failed to start quiz");
          return;
        }

        if (!mounted) return;
        router.replace(`/quiz/${quizId}/attempt?attemptId=${data.id}`);
      } catch (err) {
        console.error("Create attempt failed", err);
        alert("Failed to start quiz");
      }
    };

    createAttempt();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  return <div className="p-6 text-center">Starting quiz...</div>;
}

