import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatConversation } from "@/types/chat";

// for date formatting
const formatDate = (dateInput: Date | string): string => {
  const conversationDate =
    typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(conversationDate.getTime())) {
    return "Invalid Date";
  }
  const now = new Date();
  if (now.toDateString() === conversationDate.toDateString()) {
    return conversationDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.toDateString() === conversationDate.toDateString()) {
    return "Yesterday";
  }
  const lastWeek = new Date(now);
  lastWeek.setDate(now.getDate() - 7);
  if (conversationDate > lastWeek) {
    return conversationDate.toLocaleDateString([], { weekday: "short" });
  }
  return conversationDate.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

interface ConversationItemProps {
  conversation: ChatConversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDeleteClick: (id: string, title: string) => void;
}

export default function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDeleteClick,
}: ConversationItemProps): React.ReactElement {
  return (
    <div
      className={cn(
        "group flex items-center justify-between rounded-md text-sm transition-colors",
        "hover:bg-blue-200 dark:hover:bg-gray-700",
        isActive ? "bg-blue-200 dark:bg-gray-700" : "bg-transparent"
      )}
    >
      <button
        onClick={() => onSelect(conversation.id)}
        className={cn(
          "flex-1 overflow-hidden text-left px-3 py-2 rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        )}
      >
        <div className="font-medium truncate text-gray-900 dark:text-gray-200">
          {conversation.title}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(conversation.createdAt)}
        </div>
      </button>
      {/* Delete Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "flex-shrink-0 h-8 w-8 mr-1 cursor-pointer",
          "text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-red-400"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onDeleteClick(conversation.id, conversation.title);
        }}
        aria-label={`Delete conversation: ${conversation.title}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
