"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Mail, Chrome, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Error occurred during sign in. Please try again.",
  OAuthCallback: "Error occurred during callback. Please try again.",
  OAuthCreateAccount: "Could not create account. Please try again.",
  EmailSignin: "Could not send email. Please try again.",
  CredentialsSignin: "Invalid credentials.",
  default: "An error occurred. Please try again.",
};

export function LoginForm({
  callbackUrl,
  error,
}: {
  callbackUrl?: string;
  error?: string;
}) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading("google");
    await signIn("google", { callbackUrl: callbackUrl ?? "/dashboard" });
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading("email");
    const res = await signIn("email", {
      email,
      callbackUrl: callbackUrl ?? "/dashboard",
      redirect: false,
    });
    setLoading(null);
    if (res?.ok) {
      setEmailSent(true);
      toast.success("Magic link sent! Check your email.");
    } else {
      toast.error("Failed to send magic link. Please try again.");
    }
  };

  const errorMessage = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.default) : null;

  if (emailSent) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 mb-4">
          <Mail className="h-7 w-7 text-green-600" />
        </div>
        <h2 className="font-display text-xl font-semibold text-slate-900 mb-2">Check your email</h2>
        <p className="text-slate-500 text-sm">
          We sent a magic link to <strong>{email}</strong>. Click it to sign in.
        </p>
        <button
          onClick={() => setEmailSent(false)}
          className="mt-4 text-sm text-brand-600 hover:underline"
        >
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={!!loading}
        className="btn-secondary w-full text-sm py-3 gap-3"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {loading === "google" ? "Signing in..." : "Continue with Google"}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-400">or</span>
        </div>
      </div>

      {/* Email */}
      <form onSubmit={handleEmail} className="space-y-3">
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            required
            className="input"
          />
        </div>
        <button
          type="submit"
          disabled={!!loading || !email}
          className="btn-primary w-full py-3"
        >
          <Mail className="h-4 w-4" />
          {loading === "email" ? "Sending..." : "Send Magic Link"}
        </button>
      </form>
    </div>
  );
}
