import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowUp, AlertTriangle } from "lucide-react";

interface ChatInputFormProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  error: string | null;
}

export default function ChatInputForm({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  error,
}: ChatInputFormProps): React.ReactElement {
  return (
    <div className="absolute bottom-0 left-0 right-0 border-t p-4 bg-blue-100 dark:bg-gray-800 border-slate-300 dark:border-gray-700 flex-shrink-0 z-20">
      <form
        onSubmit={onSubmit}
        className="flex gap-2 items-center max-w-3xl mx-auto"
      >
        <Input
          value={input}
          onChange={onInputChange}
          placeholder="Type your message..."
          className="flex-1 dark:bg-gray-700 border-slate-300 dark:border-gray-600 text-black placeholder-gray-800 dark:text-white dark:placeholder-gray-400 disabled:opacity-70"
          disabled={isLoading}
          aria-label="Chat input"
        />
        <Button
          type="submit"
          disabled={isLoading || input.trim() === ""}
          size="icon"
          aria-label="Send message"
          className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white border border-slate-300 dark:border-gray-600 bg-blue-200 disabled:opacity-50 flex-shrink-0 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </Button>
      </form>
      {/* Error Display */}
      {error && !isLoading && (
        <div className="flex items-center justify-center pt-2 text-center">
          <p className="text-xs text-red-600 dark:text-red-400">
            <AlertTriangle className="inline h-3 w-3 mr-1" /> {error}
          </p>
        </div>
      )}
    </div>
  );
}
