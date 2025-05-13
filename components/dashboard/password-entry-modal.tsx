"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateSecurePassword } from "@/lib/password-utils";
import { useToast } from "@/components/ui/use-toast";

interface PasswordEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry?: any;
  onSuccess?: () => void;
}

// XSS prevention helper
const sanitizeInput = (input: string): string => {
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

export function PasswordEntryModal({
  isOpen,
  onClose,
  entry,
  onSuccess,
}: PasswordEntryModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    username: "",
    password: "",
    category: "Login",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title || "",
        url: entry.url || "",
        username: entry.username || "",
        password: "••••••••", // Placeholder for existing passwords
        category: entry.category || "Login",
        notes: entry.notes || "",
      });
    } else {
      setFormData({
        title: "",
        url: "",
        username: "",
        password: "",
        category: "Login",
        notes: "",
      });
    }
  }, [entry, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: sanitizeInput(value),
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: sanitizeInput(value),
    }));
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(16);
    setFormData((prev) => ({ ...prev, password: newPassword }));
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate password strength
      if (formData.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/passwords/`,
        {
          method: "POST", // Use POST for creating a new password
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to save password");
      }

      toast({
        title: "Success",
        description: "Password created successfully",
      });
      onClose();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate password strength
      if (formData.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/passwords/${entry._id}`, // Use the entry ID for update
        {
          method: "PUT", // Use PUT for updating an existing password
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            ...formData,
            id: entry._id, // Include the entry ID for updates
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to save password");
      }

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      onClose();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (entry) {
      await handleUpdatePassword(e);
    } else {
      await handleCreatePassword(e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-gray-800 bg-gray-900 text-gray-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {entry ? "Edit Password" : "Add New Password"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-300"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Google Account"
              required
              className="border-gray-700 bg-gray-800 text-gray-100 placeholder:text-gray-500 focus-visible:ring-blue-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com"
              className="border-gray-700 bg-gray-800 text-gray-100 placeholder:text-gray-500 focus-visible:ring-blue-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username / Email</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="username or email@example.com"
              required
              className="border-gray-700 bg-gray-800 text-gray-100 placeholder:text-gray-500 focus-visible:ring-blue-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                className="border-gray-700 bg-gray-800 pr-20 text-gray-100 placeholder:text-gray-500 focus-visible:ring-blue-600"
              />
              <div className="absolute right-1 top-1 flex">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-gray-300"
                  onClick={handleGeneratePassword}
                  title="Generate password"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Generate password</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="border-gray-700 bg-gray-800 text-gray-100 focus:ring-blue-600">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="border-gray-700 bg-gray-800 text-gray-100">
                <SelectItem value="Login">Login</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Banking">Banking</SelectItem>
                <SelectItem value="Shopping">Shopping</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes here..."
              className="min-h-24 border-gray-700 bg-gray-800 text-gray-100 placeholder:text-gray-500 focus-visible:ring-blue-600"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {entry ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
