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
    <div className="self-center w-full lg:w-[500px] mt-10">
      <div className="flex mb-6 border-b">
        <button
          className={`flex-1 py-2 text-center font-medium transition-colors ${
            mode === "login"
              ? "text-primary border-b-2 border-primary"
              : "text-foreground hover:bg-accent"
          }`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          className={`flex-1 py-2 text-center font-medium transition-colors ${
            mode === "register"
              ? "text-primary border-b-2 border-primary"
              : "text-foreground hover:bg-accent"
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
