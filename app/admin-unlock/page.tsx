"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useRouter } from "next/navigation";

export default function AdminUnlock() {
  const { enableAdmin } = useAdmin();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const SECRET = "mysecret123"; // later we move this to env

  function submit() {
    if (password === SECRET) {
      enableAdmin();
      router.push("/");
    } else {
      alert("Wrong password!");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-80">
        
        <h1 className="text-xl font-bold mb-4 text-center">Admin Login</h1>

        <input
          type="password"
          placeholder="Enter admin password"
          className="w-full border p-2 rounded mb-3"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={submit}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Unlock Admin Mode
        </button>
      </div>
    </div>
  );
}
