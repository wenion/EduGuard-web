"use client";

import LoginForm from "./LoginForm";

export default function LoginView() {
  return (
    <section
      className="flex flex-col items-center justify-center mt-10 space-y-6"
      id="authMessage"
      role="status"
      aria-live="polite"
    >
      <p>Welcome to Edvance! Please sign in to unlock personalised insights.</p>
      <LoginForm />
      <p id="signUp" attr-class="text-dark mt-3">Don't have an account yet or forget your password? Contact <a href="mailto:guanliang.chen@example.com" className="text-blue-600 underline">an administrator</a></p>
    </section>
  );
}
