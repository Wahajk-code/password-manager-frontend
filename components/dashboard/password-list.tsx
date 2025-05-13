"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Copy, Edit, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PasswordEntryModal } from "@/components/dashboard/password-entry-modal";
import { useToast } from "@/components/ui/use-toast";
import { log } from "console";

interface PasswordEntry {
  _id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  category?: string;
  notes?: string;
  favicon?: string;
}

export function PasswordList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(
    null
  );
  const [passwordEntries, setPasswordEntries] = useState<PasswordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPasswords = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/passwords/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch passwords: ${response.status}`);
        }

        const data = await response.json();

        // Ensure the passwords have a valid ID
        setPasswordEntries(
          data.map((entry: any) => ({
            ...entry,
            id: entry._id || entry.id, // Correctly assign _id to id
            // Correctly assign _id to id
          }))
        );
      } catch (error) {
        console.error("Failed to fetch passwords:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to load passwords",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPasswords();
  }, []);

  const handleEdit = (entry: PasswordEntry) => {
    console.log(entry);
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        duration: 2000,
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        title: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (entry: PasswordEntry) => {
    const id = entry._id;
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/passwords/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete password: ${response.status}`);
      }

      setPasswordEntries((prev) => prev.filter((entry) => entry._id !== id));
      toast({
        title: "Success",
        description: "Password deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete password:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete password",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    setSelectedEntry(null);
    setIsModalOpen(true);
  };

  const handlePasswordUpdated = () => {
    // Refresh the password list after modal closes
    const fetchPasswords = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/passwords/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPasswordEntries(data);
        }
      } catch (error) {
        console.error("Failed to refresh passwords:", error);
      }
    };

    fetchPasswords();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Your Passwords</h2>
        <Button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add New Password
        </Button>
      </div>

      {passwordEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-gray-400">No passwords saved yet</p>
          <Button
            onClick={handleAddNew}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Add Your First Password
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {passwordEntries.map((entry) => (
            <Card key={entry._id} className="border-gray-800 bg-gray-900 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800">
                    <Image
                      src={entry.favicon || "/placeholder.svg"}
                      alt={entry.title}
                      width={16}
                      height={16}
                      className="h-4 w-4"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{entry.title}</h3>
                    <p className="text-sm text-gray-400">{entry.username}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="rounded-md bg-gray-800 px-3 py-1 text-sm text-gray-300">
                    ••••••••
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(entry.username)}
                    className="h-8 w-8 text-gray-400 hover:text-blue-400"
                    title="Copy username"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy username</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(entry.password)}
                    className="h-8 w-8 text-gray-400 hover:text-blue-400"
                    title="Copy password"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy password</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-300"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40 border-gray-800 bg-gray-900 text-gray-100"
                    >
                      <DropdownMenuItem
                        className="flex cursor-pointer items-center focus:bg-gray-800 focus:text-gray-100"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex cursor-pointer items-center text-red-500 focus:bg-red-900/20 focus:text-red-500"
                        onClick={() => handleDelete(entry)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <PasswordEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entry={selectedEntry}
        onSuccess={handlePasswordUpdated}
      />
    </div>
  );
}
