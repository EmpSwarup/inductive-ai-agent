import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import SidebarOverlay from "./SidebarOverlay";
import SidebarHeader from "./SidebarHeader";
import ConversationItem from "./ConversationItem";
import { ChatConversation } from "@/types/chat";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ChatConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
}: SidebarProps): React.ReactElement {
  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);
  const [conversationTitleToDelete, setConversationTitleToDelete] =
    useState<string>("");

  // handler opens the dialog
  const handleDeleteClick = (id: string, title: string) => {
    setConversationToDelete(id);
    setConversationTitleToDelete(title);
    setIsDeleteDialogOpen(true);
  };

  // handler confirms the deletion via the prop
  const handleConfirmDelete = () => {
    if (conversationToDelete) {
      onDeleteConversation(conversationToDelete);
    }
    setIsDeleteDialogOpen(false);
    setConversationToDelete(null);
    setConversationTitleToDelete("");
  };

  return (
    <>
      {/* Mobile overlay */}
      <SidebarOverlay isOpen={isOpen} onClose={onClose} />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "w-64 md:w-72 border-r",
          "bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-blue-950",
          "border-slate-300 dark:border-gray-700",
          "transition-colors duration-300",
          "transition-transform duration-300 ease-in-out",
          "md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Chat History"
      >
        {/* Header */}
        <SidebarHeader onClose={onClose} />

        {/* Conversation List */}
        <ScrollArea className="flex-1 px-2">
          <nav className="space-y-1 py-2" aria-label="Conversation list">
            {conversations.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No conversations yet.
              </p>
            )}
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={activeConversationId === conversation.id}
                onSelect={onSelectConversation}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </nav>
        </ScrollArea>
      </aside>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 text-gray-900 dark:text-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete "{conversationTitleToDelete}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
