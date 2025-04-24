import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { AvatarEmotion, AvatarSize } from "@/types/avatar";

import {
  sizeClasses,
  getContainerAnimation,
  getEyeStyle,
  getMouthStyle,
  getBackgroundColor,
  getGlowEffect,
} from "@/utils/aiavatarUtils";

interface AiAvatarProps {
  size?: AvatarSize;
  emotion?: AvatarEmotion;
  animate?: boolean;
}


export default function AiAvatar({
  size = "sm",
  emotion: initialEmotion = "neutral",
  animate = true,
}: AiAvatarProps): React.ReactElement {
  const [blinking, setBlinking] = useState(false);
  const [currentEmotion, setCurrentEmotion] =
    useState<AvatarEmotion>(initialEmotion);

  // Effect for random blinking
  useEffect(() => {
    if (!animate || currentEmotion === "wink") return;
    let intervalId: NodeJS.Timeout | undefined;
    const startBlinking = () => {
      intervalId = setInterval(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 200);
      }, Math.random() * 3000 + 2000);
    };
    const startTimeoutId = setTimeout(
      startBlinking,
      Math.random() * 1000 + 500
    );
    return () => {
      clearTimeout(startTimeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [animate, currentEmotion]);

  // Effect to update internal emotion state when prop changes
  useEffect(() => {
    setCurrentEmotion(initialEmotion);
  }, [initialEmotion]);
 
  // for calcualting styles
  const containerAnimation = getContainerAnimation(currentEmotion, animate);
  const leftEyeStyle = getEyeStyle(
    currentEmotion,
    size,
    blinking,
    animate,
    false
  );
  const rightEyeStyle = getEyeStyle(
    currentEmotion,
    size,
    blinking,
    animate,
    true
  );
  const mouthStyle = getMouthStyle(currentEmotion, size, animate);
  const backgroundColor = getBackgroundColor(currentEmotion);
  const glowEffect = getGlowEffect(currentEmotion);
 
  return (
    <div
      className={cn(
        "relative rounded-full bg-gradient-to-br flex items-center justify-center transition-all duration-500",
        sizeClasses[size],
        backgroundColor,
        containerAnimation
      )}
    >
      {/* Face */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className={cn(
            "flex mb-1",
            size === "sm" ? "gap-2" : size === "md" ? "gap-2.5" : "gap-3"
          )}
        >
          <div className={leftEyeStyle}></div>
          <div className={rightEyeStyle}></div>
        </div>
        <div className={mouthStyle}></div>
      </div>
      {/* Glow */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-br blur-md -z-10",
          animate ? "animate-pulse" : "",
          glowEffect
        )}
      ></div>
    </div>
  );
}
