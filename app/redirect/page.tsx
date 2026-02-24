"use client";

<<<<<<< HEAD
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function RedirectLogic() {
=======
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { AlertCircle, Loader } from "lucide-react";

function RedirectContent() {
  const searchParams = useSearchParams();
>>>>>>> 81fb2bce13c91d44fad6de34be7fd3977d067745
  const router = useRouter();
  const params = useSearchParams();
  const key = params.get("key");

  useEffect(() => {
    async function run() {
      if (!key) {
        router.replace("/404");
        "use client";

        import { useRouter, useSearchParams } from "next/navigation";
        import { useEffect, Suspense } from "react";

        function RedirectContent() {
          const router = useRouter();
          const params = useSearchParams();
          const key = params.get("key");

          useEffect(() => {
            async function run() {
              if (!key) {
                router.replace("/404");
                return;
              }

              const res = await fetch(`/api/folder-map?key=${encodeURIComponent(key)}`);
              const data = await res.json();

              if (!data?.folderId) {
                router.replace("/404");
                return;
              }

              router.replace(`/folder/${data.folderId}`);
            }

            run();
          }, [key, router]);

          return <div className="text-white p-10">Loading...</div>;
        }

        export default function RedirectPage() {
          return (
            <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
              <RedirectContent />
            </Suspense>
          );
        }
    <Suspense fallback={<LoadingFallback />}>
