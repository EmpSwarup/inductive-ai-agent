import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SidebarHeaderProps {
  onClose: () => void;
}

export default function SidebarHeader({
  onClose,
}: SidebarHeaderProps): React.ReactElement {
  return (
    <div className="border-b p-4 flex justify-between items-center border-slate-300 dark:border-gray-700 flex-shrink-0">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
        Conversations
      </h2>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="md:hidden text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <X className="h-5 w-5" />
        <span className="sr-only">Close sidebar</span>
      </Button>
    </div>
  );
}
