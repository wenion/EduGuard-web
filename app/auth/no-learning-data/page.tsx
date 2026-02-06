"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const LOGOUT_DELAY_SECONDS = 10;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

function sendLogoutKeepalive(token: string) {
  if (!API_BASE) return;

  void fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: null,
    keepalive: true,
  }).catch(() => {
    // Best effort for tab close/unload.
  });
}

export default function NoLearningDataPage() {
  const router = useRouter();
  const { loading, token, logout } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState(LOGOUT_DELAY_SECONDS);
  const hasLoggedOutRef = useRef(false);

  useEffect(() => {
    if (loading) return;

    const performLogout = async () => {
      if (hasLoggedOutRef.current) return;
      hasLoggedOutRef.current = true;
      if (token) {
        await logout();
      }
      router.replace("/");
    };

    const handleUnload = () => {
      if (hasLoggedOutRef.current) return;
      hasLoggedOutRef.current = true;
      if (token) {
        sendLogoutKeepalive(token);
        void logout();
      }
    };

    const countdownInterval = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    const logoutTimer = window.setTimeout(() => {
      void performLogout();
    }, LOGOUT_DELAY_SECONDS * 1000);

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      window.clearInterval(countdownInterval);
      window.clearTimeout(logoutTimer);
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);

      if (!hasLoggedOutRef.current) {
        handleUnload();
      }
    };
  }, [loading, logout, router, token]);

  if (loading) {
    return <p>Checking your session…</p>;
  }

  return (
    <main className="mx-4 mt-10 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Logged in, but no learning data was found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle>Action needed</AlertTitle>
            <AlertDescription>
              You signed in successfully through SSO, but there is no learning data linked to your account.
              Please contact an administrator for access.
            </AlertDescription>
          </Alert>
          <p className="text-sm text-slate-600">
            You will be logged out automatically in {secondsLeft} second{secondsLeft === 1 ? "" : "s"}.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
