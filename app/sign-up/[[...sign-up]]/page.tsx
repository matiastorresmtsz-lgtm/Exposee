"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 py-12 gap-6">
      <div className="flex items-center gap-3">
        <span className="font-bold text-blue-500 tracking-wide text-lg">Exposee</span>
      </div>
      <SignUp forceRedirectUrl="/" signInUrl="/sign-in" />
    </div>
  );
}
