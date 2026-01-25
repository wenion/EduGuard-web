"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { login as monashLogin } from "@/app/auth/login";

export default function LoginForm() {
  const { login, loading } = useAuth();
  const [username, setU] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [password, setP] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      setError("Please enter your email address.");
      return;
    }
    await monashLogin(username);
  };

  return (
    <Card className="w-full max-w-sm" id="loginArea">
      <CardHeader id="innerLogin">
        <CardTitle className="text-xl" id="loginTitle">Login</CardTitle>
      </CardHeader>

      <form onSubmit={onSubmit} className="space-y-3" id="loginForm">
        <CardContent className="space-y-3">
          <div className="grid gap-1.5">
            <Label htmlFor="loginUsername">Email</Label>
            <Input
              id="loginUsername"
              placeholder="name@monash.edu"
              value={username}
              onChange={(e) => {setU(e.target.value); setError(null);}}
              disabled={loading}
              autoComplete="username"
              aria-invalid ={error ? "true" : "false"}
            />
            <span className="text-sm pb-4 text-slate-500" id="loginHelper">Use your institutional email address.</span>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={loading}
            id="loginButton"
          >
            Continue
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
