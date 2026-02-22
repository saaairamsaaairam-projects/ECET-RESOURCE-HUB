"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function RedirectLogic() {
  const router = useRouter();
  const params = useSearchParams();
  const key = params.get("key");

  useEffect(() => {
    async function run() {
      if (!key) {
        router.replace("/404");
        return;
      }

      const res = await fetch(`/api/folder-map?key=${key}`);
      const data = await res.json();

      if (!data.folderId) {
        router.replace("/404");
        return;
      }

      router.replace(`/folder/${data.folderId}`);
    }

    run();
  }, [key]);

  return <div className="text-white p-10">Loading...</div>;
}

export default function RedirectPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
      <RedirectLogic />
    </Suspense>
  );
}
