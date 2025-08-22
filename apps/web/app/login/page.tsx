"use client";
import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <div className="min-h-[60vh] grid place-items-center p-8">
      <div className="max-w-sm w-full space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Sign in to continue</h1>
        <button
          onClick={() => signIn("google", { callbackUrl: "/plan" })}
          className="px-4 py-2 rounded-lg bg-black text-white w-full"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
