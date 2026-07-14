"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 py-12">
      <SignIn forceRedirectUrl="/dashboard" signUpUrl="/sign-up" />
    </div>
  );
}
