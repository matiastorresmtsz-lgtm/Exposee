"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-cyan-500/10">
        <SignUp forceRedirectUrl="/dashboard" signInUrl="/sign-in" />
      </div>
    </div>
  );
}
