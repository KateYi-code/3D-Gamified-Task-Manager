"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";
import { redirect } from "next/navigation";

export default function AuthPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

  // Redirect if already authenticated
  if (user) {
    redirect("/");
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <div className="flex mb-6 border-b">
        <button
          className={`flex-1 py-2 text-center font-medium transition-colors ${
            mode === "login" 
              ? "text-blue-600 border-b-2 border-blue-600" 
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          className={`flex-1 py-2 text-center font-medium transition-colors ${
            mode === "register" 
              ? "text-blue-600 border-b-2 border-blue-600" 
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      {mode === "login" ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
