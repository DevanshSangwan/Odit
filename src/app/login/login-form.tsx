"use client";

import { login, type AuthActionState } from "@/app/auth/actions";
import {
  AuthShell,
  fieldClassName,
  labelClassName,
} from "@/components/auth-shell";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

const initialState: AuthActionState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your firm's audit workspace."
      footer={
        <>
          New to the firm?{" "}
          <Link
            href="/signup"
            className="font-medium text-teal-700 hover:underline dark:text-teal-400"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className={labelClassName}>
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`${fieldClassName} pl-10`}
              placeholder="you@firm.com"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className={labelClassName}>
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              className={`${fieldClassName} pl-10`}
              placeholder="••••••••"
            />
          </div>
        </div>
        {state.error ? (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400"
          >
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
