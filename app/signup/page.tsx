"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // Use Supabase client directly for signup
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Signup failed");
        setLoading(false);
        return;
      }

      if (data.user) {
        // Insert profile record
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: email,
          role: "user",
        });

        if (profileError) {
          console.error("Profile insert error:", profileError);
        }

        // Redirect to login page
        router.push("/login?signup=success");
      } else {
        setError("Signup failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0e17] flex items-center justify-center relative overflow-hidden pt-20">

      {/* FLOATING GLOW EFFECTS */}
      <motion.div
        animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 10 }}
        className="absolute w-[450px] h-[450px] bg-purple-600/30 blur-[120px] rounded-full -top-10 -left-10"
      />

      <motion.div
        animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 12 }}
        className="absolute w-[450px] h-[450px] bg-fuchsia-600/20 blur-[120px] rounded-full bottom-0 right-0"
      />

      {/* SIGNUP CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="backdrop-blur-xl bg-white/10 border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 relative z-10"
      >
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Create Account
        </h1>
        <p className="text-gray-300 text-center mb-6 text-sm">
          Join PolyHub to access premium study materials
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Email */}
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl outline-none focus:border-purple-400 transition"
          />

          {/* Password */}
          <div className="relative">
            <input
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="Password (min 6 characters)"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl outline-none focus:border-purple-400 transition"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-300 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-purple-400 font-semibold hover:text-purple-300 transition">
            Login
          </a>
        </p>
      </motion.div>
    </div>
  );
}
