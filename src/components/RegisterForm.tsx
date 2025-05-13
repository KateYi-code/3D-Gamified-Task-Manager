"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// use zodResolver to validate the form
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const { register: registerUser, loading } = useAuth();
  const [serverError, setServerError] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setServerError("");
    try {
      await registerUser(data.name, data.email, data.password);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-background rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Register</h2>

      {serverError && (
        <div className="mb-4 p-3 bg-red-100 text-destructive rounded-md">{serverError}</div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-accent-foreground mb-1">
            Name
          </label>
          <Input id="name" type="text" {...form.register("name")} className="w-full px-3 py-2" />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-accent-foreground mb-1">
            Email
          </label>
          <Input id="email" type="email" {...form.register("email")} className="w-full px-3 py-2" />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-accent-foreground mb-1"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            {...form.register("password")}
            className="w-full px-3 py-2"
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full py-2 px-4">
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>
    </div>
  );
}
