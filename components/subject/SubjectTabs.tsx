"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Props {
  folderId: string;
}

export default function SubjectTabs({ folderId }: Props) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const tabs = [
    { name: "Syllabus", href: `/folder/${folderId}` },
    { name: "Topics", href: `/folder/${folderId}/topics` },
    { name: "Practice", href: `/practice/${folderId}` },
    // Admins go to manage page; regular users go to public subject quizzes
    { name: "Quizzes", href: isAdmin ? `/quiz/manage/${folderId}` : `/quiz/subject/${folderId}` },
  ];

  return (
    <div className="flex gap-6 border-b border-zinc-700 mb-6">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`pb-3 text-sm font-medium transition ${
              active
                ? "text-violet-400 border-b-2 border-violet-500"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
