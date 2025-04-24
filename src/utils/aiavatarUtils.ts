// this code is also ai generated

import { cn } from "@/lib/utils";
import type { AvatarEmotion, AvatarSize } from "@/types/avatar";

export const sizeClasses: Record<AvatarSize, string> = {
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-24 h-24",
};

export function getContainerAnimation(
  emotion: AvatarEmotion,
  animate: boolean
): string {
  if (!animate) return "";
  switch (emotion) {
    case "happy":
      return "animate-happy";
    case "thinking":
      return "animate-thinking";
    case "error":
      return "animate-error";
    case "surprised":
      return "animate-surprised";
    default:
      return "";
  }
}

export function getEyeStyle(
  emotion: AvatarEmotion,
  size: AvatarSize,
  blinking: boolean,
  animate: boolean,
  isRight = false
): string {
  const baseClasses = cn(
    "rounded-full bg-white transition-all duration-300 dark:bg-opacity-90",
    sizeClasses[size],
    size === "sm" && "w-2 h-1",
    size === "md" && "w-3 h-1.5",
    size === "lg" && "w-5 h-2",
    blinking && emotion !== "wink" ? "h-0.5" : ""
  );

  switch (emotion) {
    case "happy":
      return cn(
        baseClasses,
        "h-0.5",
        size === "sm" && "w-3",
        size === "md" && "w-4",
        size === "lg" && "w-6"
      );
    case "thinking":
      return cn(
        baseClasses,
        isRight ? "h-1 w-2" : "h-2 w-1.5",
        size === "lg" && (isRight ? "h-1.5 w-3" : "h-3 w-2")
      );
    case "error":
      return cn(
        baseClasses,
        "rotate-45 h-1 w-1",
        size === "md" && "h-1.5 w-1.5",
        size === "lg" && "h-2 w-2"
      );
    case "surprised":
      return cn(
        baseClasses,
        "rounded-full h-2 w-2",
        size === "md" && "h-3 w-3",
        size === "lg" && "h-4 w-4",
        animate && "animate-surprised-eyes"
      );
    case "wink":
      return cn(
        baseClasses,
        isRight
          ? cn(
              "h-0.5 w-2",
              animate && "animate-wink-eye",
              size === "md" && "w-3",
              size === "lg" && "w-5"
            )
          : cn(
              "rounded-full h-1 w-1",
              size === "md" && "h-1.5 w-1.5",
              size === "lg" && "h-2 w-2"
            )
      );
    case "typing":
      return cn(
        baseClasses,
        "h-1 w-2 rounded-b-none rounded-t-full",
        size === "md" && "h-1.5 w-2.5",
        size === "lg" && "h-2 w-4"
      );
    default:
      return baseClasses;
  }
}

export function getMouthStyle(
  emotion: AvatarEmotion,
  size: AvatarSize,
  animate: boolean
): string {
  const baseClasses = cn(
    "bg-white rounded-full transition-all duration-300 dark:bg-opacity-90",
    size === "sm" && "w-4 h-0.5",
    size === "md" && "w-5 h-0.5",
    size === "lg" && "w-10 h-1 mt-2"
  );

  switch (emotion) {
    case "happy":
      return cn(
        baseClasses,
        "rounded-b-full rounded-t-none h-1.5",
        size === "md" && "h-2",
        size === "lg" && "h-3 mt-3",
        animate && "animate-happy-mouth"
      );
    case "thinking":
      return cn(
        baseClasses,
        "w-2 rounded-full",
        size === "md" && "w-3",
        size === "lg" && "w-5",
        animate && "animate-thinking-mouth"
      );
    case "error":
      return cn(
        baseClasses,
        "rounded-t-full rounded-b-none h-1.5",
        size === "md" && "h-2",
        size === "lg" && "h-3 mt-3",
        animate && "animate-error-mouth"
      );
    case "surprised":
      return cn(
        baseClasses,
        "rounded-full h-2 w-2",
        size === "md" && "h-2.5 w-2.5",
        size === "lg" && "h-4 w-4 mt-2"
      );
    case "wink":
      return cn(
        baseClasses,
        "rounded-b-full rounded-t-none h-1 w-3 translate-x-1",
        size === "md" && "h-1.5 w-4",
        size === "lg" && "h-2 w-8 mt-3",
        animate && "animate-wink-mouth"
      );
    case "typing":
      return cn(
        "bg-white transition-all duration-300 animate-mouth-typing dark:bg-opacity-90",
        size === "sm" && "w-3 h-1.5 rounded-sm",
        size === "md" && "w-4 h-2 rounded-sm",
        size === "lg" && "w-8 h-3 rounded-sm mt-2"
      );
    default:
      return baseClasses;
  }
}

export function getBackgroundColor(emotion: AvatarEmotion): string {
  switch (emotion) {
    case "happy":
      return "from-violet-500 to-fuchsia-500";
    case "thinking":
      return "from-blue-500 to-cyan-500";
    case "error":
      return "from-red-500 to-orange-500";
    case "surprised":
      return "from-amber-400 to-yellow-500";
    case "wink":
      return "from-pink-500 to-rose-500";
    case "typing":
      return "from-emerald-500 to-teal-500";
    default:
      return "from-violet-500 to-fuchsia-500"; // Neutral
  }
}

export function getGlowEffect(emotion: AvatarEmotion): string {
  switch (emotion) {
    case "happy":
      return "from-violet-500/30 to-fuchsia-500/30";
    case "thinking":
      return "from-blue-500/30 to-cyan-500/30";
    case "error":
      return "from-red-500/30 to-orange-500/30";
    case "surprised":
      return "from-amber-400/30 to-yellow-500/30";
    case "wink":
      return "from-pink-500/30 to-rose-500/30";
    case "typing":
      return "from-emerald-500/30 to-teal-500/30";
    default:
      return "from-violet-500/30 to-fuchsia-500/30";
  }
}
