import { Eye, Lock, Mail } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "../api/authApi";
import { AuthLayout } from "../components/AuthLayout";
import { useAuthStore } from "../store/authStore";
import type { AuthApiError } from "../types/auth.types";

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const auth = await authApi.login({ email, password });
      setAuth(auth);
      setSuccessMessage("You are signed in. Your session is ready.");
      navigate("/feed");
    } catch (caughtError) {
      const authError = caughtError as AuthApiError;
      setError(authError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your learning network"
      description="Access your feed, study groups, messages, and course communities."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-[#1f3437]"
          >
            Email
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="student@university.edu"
              className="pl-10"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[#1f3437]"
            >
              Password
            </label>
            <a href="#" className="text-xs font-medium text-[#0b6d70]">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              className="pl-10 pr-10"
              autoComplete="current-password"
              minLength={8}
              required
            />
            <Eye
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          className="mt-2 h-11 w-full bg-[#0b4f53] text-white hover:bg-[#0a4649]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>

        <p className="pt-3 text-center text-sm text-muted-foreground">
          New to EduConnect?{" "}
          <Link className="font-semibold text-[#0b6d70]" to="/register">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
