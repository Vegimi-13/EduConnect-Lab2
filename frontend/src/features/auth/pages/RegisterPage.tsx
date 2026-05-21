import { Lock, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "../api/authApi";
import { AuthLayout } from "../components/AuthLayout";
import { useAuthStore } from "../store/authStore";
import type { AuthApiError } from "../types/auth.types";

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("first_name") ?? "");
    const lastName = String(formData.get("last_name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const auth = await authApi.register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });
      setAuth(auth);
      setSuccessMessage("Your account is ready. Welcome to EduConnect.");
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
      eyebrow="Join EduConnect"
      title="Create your academic profile"
      description="Start building your student network, course circles, and learning timeline."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="first-name"
              className="text-sm font-medium text-[#1f3437]"
            >
              First name
            </label>
            <div className="relative">
              <UserRound
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="first-name"
                name="first_name"
                type="text"
                placeholder="Arta"
                className="pl-10"
                autoComplete="given-name"
                minLength={2}
                maxLength={50}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="last-name"
              className="text-sm font-medium text-[#1f3437]"
            >
              Last name
            </label>
            <Input
              id="last-name"
              name="last_name"
              type="text"
              placeholder="Krasniqi"
              autoComplete="family-name"
              minLength={2}
              maxLength={50}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="register-email"
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
              id="register-email"
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
          <label
            htmlFor="register-password"
            className="text-sm font-medium text-[#1f3437]"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="register-password"
              name="password"
              type="password"
              placeholder="Create a password"
              className="pl-10"
              autoComplete="new-password"
              minLength={8}
              maxLength={100}
              required
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>

        <p className="pt-3 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="font-semibold text-[#0b6d70]" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
