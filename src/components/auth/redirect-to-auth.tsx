"use client";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

export const RedirectToAuth = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  if (!loading && !user) {
    if (typeof window !== "undefined") {
      router.push("/auth");
    }
  }
  return null;
};
