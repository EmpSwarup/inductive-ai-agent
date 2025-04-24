import React from "react";
import AiAvatar from "@/components/Avatar/AiAvatar";
import { type AvatarEmotion } from "@/types/avatar";
import type { AvatarSize } from "@/types/avatar";

interface AvatarStatusDisplayProps {
  size: AvatarSize;
  emotion: AvatarEmotion;
  statusText: string;
  positionClasses: string; 
}

export default function AvatarStatusDisplay({
  size,
  emotion,
  statusText,
  positionClasses,
}: AvatarStatusDisplayProps): React.ReactElement {
  const avatarWidth = size === "lg" ? "96px" : "48px"; // Calculate width for styling

  return (
    <div
      className={`absolute bottom-20 z-10 flex flex-col items-center ${positionClasses}`}
      style={{ width: avatarWidth }}
    >
      <div className="pointer-events-none">
        <AiAvatar
          key={emotion}
          size={size}
          emotion={emotion}
          animate={true}
        />
      </div>
      {statusText && (
        <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400 italic pointer-events-none whitespace-nowrap">
          {statusText}
        </p>
      )}
    </div>
  );
}
