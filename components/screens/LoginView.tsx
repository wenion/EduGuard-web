"use client";

import LoginForm from "./LoginForm";

type LoginViewProps = {
  authError?: string | null;
};

export default function LoginView({ authError }: LoginViewProps) {
  const initialError =
    authError === "sso_failed"
      ? "Something went wrong during SSO login. Please contact an administrator."
      : undefined;

  return (
    <section
      className="flex flex-col items-center justify-center mt-10 space-y-6"
      id="authMessage"
      role="status"
      aria-live="polite"
    >
      <p>Welcome to Edvance! Please sign in to unlock personalised insights.</p>
      <LoginForm initialError={initialError} />
      <p id="signUp" attr-class="text-dark mt-3">Don&apos;t have an account yet or forget your password? Contact <a href="mailto:guanliang.chen@example.com" className="text-blue-600 underline">an administrator</a></p>
    </section>
  );
}
