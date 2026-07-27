"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 py-12 gap-6">
      <div className="flex items-center gap-3">
        <span className="font-bold text-blue-500 tracking-wide text-lg">Sliyce</span>
      </div>
      <SignIn forceRedirectUrl="/dashboard" signUpUrl="/sign-up" />
    </div>
  );
}
