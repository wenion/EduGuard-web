"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useAuth } from "@/context/AuthContext";
import { login as monashLogin } from "@/app/auth/login";

type LoginMode = "sso" | "password";

export default function LoginForm() {
  const { login, loading } = useAuth();
  const [mode, setMode] = useState<LoginMode>("sso");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (mode === "sso") {
      const trimmedUsername = username.trim();
      if (!trimmedUsername) {
        setError("Please enter your username.");
        return;
      }
      try {
        await monashLogin(trimmedUsername);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to start SSO login.");
      }
      return;
    }

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      await login({ type: "password", username, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    }
  };

  const switchMode = (nextMode: LoginMode) => {
    setMode(nextMode);
    setError(null);
    setPassword("");
  };

  return (
    <Card className="w-full max-w-sm" id="loginArea">
      <CardHeader id="innerLogin">
        <CardTitle className="text-xl" id="loginTitle">Login</CardTitle>
      </CardHeader>

      <form onSubmit={onSubmit} className="space-y-3" id="loginForm">
        <CardContent className="space-y-3">
          {mode === "password" ? (
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="loginUsername">Username</Label>
                <Input
                  id="loginUsername"
                  type="text"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  disabled={loading}
                  autoComplete="username"
                  aria-invalid={error ? "true" : "false"}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="loginPassword">Password</Label>
                <Input
                  id="loginPassword"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  disabled={loading}
                  autoComplete="current-password"
                  aria-invalid={error ? "true" : "false"}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-1.5">
              <Label htmlFor="loginSsoUsername">Username</Label>
              <Input
                id="loginSsoUsername"
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                autoComplete="username"
                aria-invalid={error ? "true" : "false"}
              />
              <p className="text-sm text-slate-500" id="loginHelper">
                Use your institutional username for SSO.
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {mode === "sso" ? (
            <>
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={loading}
                id="ssoLoginButton"
              >
                Continue with SSO
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full cursor-pointer"
                onClick={() => switchMode("password")}
                disabled={loading}
                id="showPasswordLoginButton"
              >
                Use username/password instead
              </Button>
            </>
          ) : (
            <>
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={loading}
                id="passwordLoginButton"
              >
                Log In
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full cursor-pointer"
                onClick={() => switchMode("sso")}
                disabled={loading}
                id="backToSsoButton"
              >
                Back to SSO login
              </Button>
            </>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
