"use client";

import LoginForm from "./LoginForm";

export default function LoginView() {
  return (
    <>
      <p>Welcome to Edvance! We are glad to see you here! Please log in first!</p>
      <LoginForm />
      <div>Don't have an account yet or forget your password? Contact <a href="mailto:guanliang.chen@example.com">Guanliang Chen</a></div>
    </>
  );
}
