import React, { useState, useEffect, useRef, memo } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import type { ChatMessageData } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageData;
  isNewAssistantMessage: boolean;
  isLoading: boolean;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({
  message,
  isNewAssistantMessage,
  isLoading,
}) => {
  // State only for the text visually displayed
  const [displayedText, setDisplayedText] = useState<string>("");
  // Refs to manage typing state without causing re-renders directly
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentContentRef = useRef<string>(""); // Tracks the full target content
  const displayedIndexRef = useRef<number>(0); // Tracks how much is currently shown

  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isError = message.role === "error";

  // Determine if Thinking indicator should be shown
  const showThinkingIndicator =
    isNewAssistantMessage && isAssistant && isLoading && !message.content;

  useEffect(() => {
    // Clear any interval from previous message render
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    // Reset refs for the new message
    currentContentRef.current = message.content;
    displayedIndexRef.current = 0;

    // Set initial display text
    if (isUser || isError || (isAssistant && !isNewAssistantMessage)) {
      // Static display
      setDisplayedText(message.content);
      displayedIndexRef.current = message.content?.length || 0; // Mark as fully displayed
    } else {
      // New assistant message
      setDisplayedText(""); // Start empty
    }
  }, [message.id]); // Rerun ONLY when message ID changes

  useEffect(() => {
    // Update the target content whenever the prop changes
    currentContentRef.current = message.content;

    // Conditions to START typing interval:
    // 1. It's the new assistant message.
    // 2. It's NOT showing the thinking indicator (content has started arriving).
    // 3. An interval is NOT already running.
    if (
      isAssistant &&
      isNewAssistantMessage &&
      !showThinkingIndicator &&
      message.content &&
      !typingIntervalRef.current
    ) {
      // Ensure we start from where we left off
      const startIndex = displayedIndexRef.current;
      // If somehow already fully displayed don't start interval
      if (startIndex >= message.content.length) {
        setDisplayedText(message.content); // Ensure full text is shown
        return;
      }

      const typingSpeed = 15; // typing speed

      setDisplayedText(message.content.substring(0, startIndex)); // Display text up to current index initially

      typingIntervalRef.current = setInterval(() => {
        // Check if we've reached the *current* target content length
        if (displayedIndexRef.current < currentContentRef.current.length) {
          displayedIndexRef.current += 1;
          setDisplayedText(
            currentContentRef.current.substring(0, displayedIndexRef.current)
          );
        } else {
          // clear interval
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
        }
      }, typingSpeed);
    } else if (!isNewAssistantMessage && typingIntervalRef.current) {
      // If it stops being the new message clear interval
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
      // Ensure final text is displayed
      if (displayedText !== message.content) {
        setDisplayedText(message.content);
      }
    }

    // Cleanup function for the interval
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, [
    message.content,
    isAssistant,
    isNewAssistantMessage,
    showThinkingIndicator,
  ]);

  return (
    <div
      className={cn(
        "flex items-end gap-2 animate-fadeIn w-full my-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "rounded-lg px-3 py-2 max-w-[80%] break-words shadow-sm",
          "block whitespace-pre-wrap",
          !isUser ? "ml-2" : "",
          isUser
            ? "bg-blue-600 text-white dark:bg-blue-500"
            : isError
            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-300 dark:border-red-700"
            : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-200",
          "min-h-[2.5rem]"
        )}
      >
        {showThinkingIndicator ? (
          <div className="px-1 flex items-center min-h-[1.5em]">
            <span>Thinking ...</span>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{displayedText}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ChatMessageComponent);
