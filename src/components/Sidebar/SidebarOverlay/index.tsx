import React from "react";

interface SidebarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarOverlay({
  isOpen,
  onClose,
}: SidebarOverlayProps): React.ReactElement | null {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-40 md:hidden"
      onClick={onClose}
      aria-hidden="true"
    />
  );
}
