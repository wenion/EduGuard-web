"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const { login, loading, error } = useAuth();
  const [username, setU] = useState("");
  const [password, setP] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign in</CardTitle>
      </CardHeader>

      <form onSubmit={onSubmit} className="space-y-3">
        <CardContent className="space-y-3">
          <div className="grid gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setU(e.target.value)}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setP(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
