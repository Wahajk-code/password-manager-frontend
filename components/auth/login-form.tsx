"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MfaInput } from "@/components/auth/mfa-input";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!showMfa) {
      try {
        // First, authenticate the user
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              username: email,
              password: password,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Login failed");
        }

        const data = await response.json();
        localStorage.setItem("access_token", data.access_token);

        // Generate OTP (no request body needed)
        const otpResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/generate-otp`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${data.access_token}`,
            },
            // No body needed since email comes from token
          }
        );

        if (!otpResponse.ok) {
          throw new Error("Failed to generate OTP");
        }

        setShowMfa(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Rest of your MFA verification code remains the same...
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-mfa`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mfa_code: mfaCode, // Must be exactly 6 characters
            email: email, // Must match the email from login
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access_token);
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Invalid MFA code");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-gray-800 bg-gray-900 text-gray-100">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          {showMfa ? "Verify OTP Code" : "Sign in"}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {showMfa
            ? "Enter the 6-digit OTP sent to your email"
            : "Enter your credentials to access your vault"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {!showMfa ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-gray-700 bg-gray-800 pl-10 text-gray-100 placeholder:text-gray-500 focus-visible:ring-blue-600"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-500 hover:text-blue-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-gray-700 bg-gray-800 pl-10 pr-10 text-gray-100 placeholder:text-gray-500 focus-visible:ring-blue-600"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10 text-gray-500 hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                />
                <Label htmlFor="remember" className="text-sm text-gray-300">
                  Remember me for 30 days
                </Label>
              </div>
            </>
          ) : (
            <MfaInput value={mfaCode} onChange={(code) => setMfaCode(code)} />
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? (
              <span>Processing...</span>
            ) : showMfa ? (
              "Verify & Sign in"
            ) : (
              "Continue"
            )}
          </Button>
        </CardFooter>
      </form>
      {showMfa ? (
        <CardFooter className="flex justify-center border-t border-gray-800 pt-4">
          <Button
            variant="link"
            className="text-blue-500 hover:text-blue-400"
            onClick={() => setShowMfa(false)}
          >
            Back to login
          </Button>
        </CardFooter>
      ) : (
        <CardFooter className="flex justify-center border-t border-gray-800 pt-4">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-500 hover:text-blue-400"
            >
              Create account
            </Link>
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
