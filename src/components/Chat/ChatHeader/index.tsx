import React from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Menu, MessageCirclePlus, Home } from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  conversationTitle: string;
  onNewChat: () => void;
}

export default function ChatHeader({
  onToggleSidebar,
  conversationTitle,
  onNewChat,
}: ChatHeaderProps): React.ReactElement {
  return (
    <header className="border-b p-3 md:p-4 flex justify-between items-center bg-blue-100/80 dark:bg-gray-800 border-slate-300 dark:border-gray-700 flex-shrink-0">
      <div className="flex items-center gap-2 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden dark:text-gray-400 dark:hover:bg-gray-700 flex-shrink-0 cursor-pointer"
          aria-label="Toggle chat history"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1
          className={cn(
            "text-lg md:text-xl font-semibold dark:text-white",
            "truncate",
            "flex-1",
            "min-w-0",
            "max-w-28 md:max-w-xs lg:max-w-full"
          )}
        >
          {conversationTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 py-0.5">
        <Link to="/">
          <Button
            variant="outline"
            size="sm"
            title="Back to Home"
            className="border-slate-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <Home className="h-4 w-4" />
          </Button>
        </Link>
        <ThemeSwitcher />
        <Button
          variant="outline"
          size="sm"
          onClick={onNewChat}
          className="gap-1 border-slate-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-100 cursor-pointer"
        >
          <MessageCirclePlus className="h-4 w-4" />
          <span className="hidden sm:inline">New Chat</span>
        </Button>
      </div>
    </header>
  );
}
