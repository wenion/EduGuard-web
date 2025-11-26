"use client";

import LoginForm from "./LoginForm";

export default function LoginView() {
  return (
    <div className="flex flex-col items-center justify-center mt-10 space-y-6">
      <p>Welcome to Edvance! We are glad to see you here! Please log in first!</p>
      <LoginForm />
      <div>Don't have an account yet or forget your password? Contact <a href="mailto:guanliang.chen@example.com" className="text-blue-600 underline">an administrator</a></div>
    </div>
  );
}
