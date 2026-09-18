"use client";

import { signup, type AuthActionState } from "@/app/auth/actions";
import {
  AuthShell,
  fieldClassName,
  labelClassName,
} from "@/components/auth-shell";
import { Building2, Lock, Mail, User, UserCog } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

const initialState: AuthActionState = { error: null };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <AuthShell
      title="Create an account"
      subtitle="Join your firm as staff or a reviewer."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-teal-700 hover:underline dark:text-teal-400"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="name" className={labelClassName}>
            Name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className={`${fieldClassName} pl-10`}
              placeholder="Priya Sharma"
            />
          </div>
        </div>
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
              autoComplete="new-password"
              required
              minLength={6}
              className={`${fieldClassName} pl-10`}
              placeholder="At least 6 characters"
            />
          </div>
        </div>
        <div>
          <label htmlFor="role" className={labelClassName}>
            Role
          </label>
          <div className="relative">
            <UserCog className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <select
              id="role"
              name="role"
              required
              defaultValue=""
              className={`${fieldClassName} appearance-none pl-10`}
            >
              <option value="" disabled>
                Select a role
              </option>
              <option value="STAFF">STAFF</option>
              <option value="REVIEWER">REVIEWER</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="firm_id" className={labelClassName}>
            Firm ID
          </label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="firm_id"
              name="firm_id"
              type="text"
              required
              className={`${fieldClassName} pl-10`}
              placeholder="1, 2, or 3"
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
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
