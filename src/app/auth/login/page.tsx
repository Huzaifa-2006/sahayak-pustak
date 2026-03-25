import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  const session = await getServerSession(authOptions);
  if (session) redirect(searchParams.callbackUrl ?? "/dashboard");

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Sahayak Pustak"
            width={80}
            height={80}
            className="mx-auto mb-4 object-contain"
          />
          <h1 className="font-display text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 mt-2">Sign in to access your Sahayak Pustak account</p>
        </div>

        <div className="card p-8">
          <LoginForm
            callbackUrl={searchParams.callbackUrl}
            error={searchParams.error}
          />
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          By signing in, you agree to help fellow students and follow community guidelines.
        </p>
      </div>
    </div>
  );
}
