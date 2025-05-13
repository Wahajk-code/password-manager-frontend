"use client";

import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface MfaInputProps {
  value: string;
  onChange: (code: string) => void;
}

export function MfaInput({ value, onChange }: MfaInputProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [mfaError, setMfaError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync with parent component's value
  useEffect(() => {
    if (value && value.length === 6) {
      const newCode = value.split("");
      setCode(newCode);
    }
  }, [value]);

  // Focus the first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(0, 1);
    setCode(newCode);
    onChange(newCode.join("")); // Notify parent of the change

    // Move to next input if current one is filled
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Move to previous input on backspace if current is empty
    if (
      e.key === "Backspace" &&
      !code[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .slice(0, 6)
      .replace(/[^\d]/g, "");

    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        if (i < 6) newCode[i] = pastedData[i];
      }
      setCode(newCode);
      onChange(newCode.join("")); // Notify parent of the change

      // Focus the next empty input or the last one
      const lastFilledIndex = Math.min(pastedData.length, 5);
      if (inputRefs.current[lastFilledIndex]) {
        inputRefs.current[lastFilledIndex]?.focus();
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="mfa-code">One-Time Password</Label>
      <div className="flex justify-between space-x-2">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className="h-12 w-12 rounded-md border border-gray-700 bg-gray-800 text-center text-xl text-gray-100 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        ))}
      </div>
      <p className="text-sm text-gray-400">
        Enter the 6-digit code sent to your email
      </p>
      {mfaError && <p className="text-red-500 text-sm">{mfaError}</p>}
    </div>
  );
}
