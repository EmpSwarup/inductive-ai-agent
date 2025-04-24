import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { generateContentStream, GeminiMessage } from "@/services/geminiService";
import type {
  ChatMessageData,
  ChatConversation,
  UseChatManagerReturn,
} from "@/types/chat";
import type { AvatarEmotion } from "@/types/avatar";

const CONVERSATIONS_STORAGE_KEY = "chatConversations";

const getRandomIdleEmotion = (): AvatarEmotion => {
  const idleEmotions: AvatarEmotion[] = ["neutral", "wink", "happy"];
  return idleEmotions[Math.floor(Math.random() * idleEmotions.length)];
};

export function useChatManager(): UseChatManagerReturn {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarEmotion, setAvatarEmotion] = useState<AvatarEmotion>("neutral");
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isStreamingStartedRef = useRef(false);
  const [newMessageId, setNewMessageId] = useState<string | null>(null);

  // Use a ref to track when we should skip auto-saving
  const skipAutoSaveRef = useRef(false);

  // Debounced save function
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Force save to localStorage immediately
  const forceSaveConversations = useCallback((convs: ChatConversation[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(convs));
        console.log("Forced save:", convs.length, "conversations");

        // Clear any pending auto-save
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
      } catch (err) {
        console.error("Force save failed:", err);
      }
    }
  }, []);

  // Debounced save function
  const debouncedSaveConversations = useCallback(
    (convs: ChatConversation[]) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        forceSaveConversations(convs);
        saveTimeoutRef.current = null;
      }, 500);
    },
    [forceSaveConversations]
  );

  // Update conversation in both state and localStorage
  const updateConversationInStorage = useCallback(
    (convId: string, msgList: ChatMessageData[]) => {
      if (!convId) return;

      // Set flag to skip auto-save since we're manually saving
      skipAutoSaveRef.current = true;

      setConversations((prevConvs) => {
        const updatedConvs = prevConvs.map((conv) =>
          conv.id === convId ? { ...conv, messages: msgList } : conv
        );

        // Force immediate save to localStorage
        forceSaveConversations(updatedConvs);

        // Reset flag after state update
        setTimeout(() => {
          skipAutoSaveRef.current = false;
        }, 0);

        return updatedConvs;
      });
    },
    [forceSaveConversations]
  );

  const handleUpdateConversationTitle = useCallback(
    (id: string | null, newTitle: string) => {
      if (!id) return;

      // Set flag to skip auto-save since we're manually saving
      skipAutoSaveRef.current = true;

      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv.id === id
            ? { ...conv, title: newTitle || "Untitled Chat" }
            : conv
        );

        // Force save after title update
        forceSaveConversations(updated);

        // Reset flag after state update
        setTimeout(() => {
          skipAutoSaveRef.current = false;
        }, 0);

        return updated;
      });
    },
    [forceSaveConversations]
  );

  const handleNewChat = useCallback(() => {
    // Generate a new ID for the conversation
    const newId = uuidv4();

    // Create the new conversation object
    const newConversation: ChatConversation = {
      id: newId,
      title: "New Conversation",
      messages: [],
      createdAt: new Date(),
    };

    // Set flag to skip auto-save since we're manually saving
    skipAutoSaveRef.current = true;

    // Update state with the new conversation
    setConversations((prev) => {
      // Create the updated conversations array with the new conversation at the beginning
      const updated = [newConversation, ...prev];

      // Force immediate save within the state updater function
      forceSaveConversations(updated);

      // Reset flag after state update (in next tick)
      setTimeout(() => {
        skipAutoSaveRef.current = false;
      }, 0);

      return updated;
    });

    // Set the new conversation as active
    setActiveConversationId(newId);
    setMessages([]);
    setNewMessageId(null);
    setError(null);
    setInput("");
    setIsLoading(false);
    setAvatarEmotion("neutral");
  }, [forceSaveConversations]);

  // Backup save effect for changes that aren't caught by direct saves
  useEffect(() => {
    if (mounted && conversations.length > 0 && !skipAutoSaveRef.current) {
      // Use debounced save to avoid excessive saves
      debouncedSaveConversations(conversations);
    }
  }, [conversations, debouncedSaveConversations, mounted]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleSendMessage = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      // Guard conditions
      const currentInput = input.trim();
      if (!currentInput || isLoading || !activeConversationId) return;

      // Reset UI states
      setError(null);
      setIsLoading(true);
      setAvatarEmotion("thinking");
      isStreamingStartedRef.current = false;
      setInput("");

      // Create user message
      const userMessage: ChatMessageData = {
        id: uuidv4(),
        role: "user",
        content: currentInput,
        createdAt: new Date(),
      };

      // Update messages with user input
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Update conversation in state and localStorage
      updateConversationInStorage(activeConversationId, updatedMessages);

      // Update conversation title if this is the first message
      if (messages.length === 0) {
        const titlePreview =
          currentInput.length > 25
            ? `${currentInput.substring(0, 25)}...`
            : currentInput;
        handleUpdateConversationTitle(activeConversationId, titlePreview);
      }

      // Format history for API
      const apiHistory: GeminiMessage[] = updatedMessages
        .filter((msg) => msg.role === "user" || msg.role === "assistant")
        .map((msg) => ({
          role: msg.role === "assistant" ? "model" : msg.role,
          parts: [{ text: msg.content }],
        }));

      // Create assistant message placeholder
      const assistantMessageId = uuidv4();
      setNewMessageId(assistantMessageId);

      const assistantPlaceholder: ChatMessageData = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };

      // Add placeholder to messages
      const messagesWithAssistant = [...updatedMessages, assistantPlaceholder];
      setMessages(messagesWithAssistant);

      // Update conversation in storage with placeholder
      updateConversationInStorage(activeConversationId, messagesWithAssistant);

      // Store accumulated response
      let accumulatedContent = "";

      // For streaming updates, save less frequently
      let lastSaveTime = Date.now();
      const SAVE_INTERVAL = 1000; // Save at most once per second during streaming

      try {
        // Get stream from API
        const stream = await generateContentStream(apiHistory);
        if (!stream) throw new Error("Failed to initialize Gemini stream.");

        // Process stream chunks
        for await (const chunk of stream) {
          if (!isStreamingStartedRef.current) {
            isStreamingStartedRef.current = true;
            setAvatarEmotion("typing");
          }

          // Accumulate response text
          accumulatedContent += chunk.text;

          // Update messages with current chunk
          const updatedWithChunk = updatedMessages.concat({
            ...assistantPlaceholder,
            content: accumulatedContent,
          });

          setMessages(updatedWithChunk);

          // Save each chunk to storage but limit frequency
          const now = Date.now();
          if (now - lastSaveTime > SAVE_INTERVAL) {
            updateConversationInStorage(activeConversationId, updatedWithChunk);
            lastSaveTime = now;
          }
        }

        // Final save of the complete message
        const finalMessages = updatedMessages.concat({
          ...assistantPlaceholder,
          content: accumulatedContent,
        });
        setMessages(finalMessages);
        updateConversationInStorage(activeConversationId, finalMessages);

        // Delay for UX
        const characters = accumulatedContent.length;
        const msPerChar = 15;
        const baseDelay = 300;
        const calculatedDelay = Math.min(
          baseDelay + characters * msPerChar,
          2000
        );
        await new Promise((resolve) => setTimeout(resolve, calculatedDelay));

        // Update avatar emotion
        setAvatarEmotion("happy");
        setTimeout(() => setAvatarEmotion(getRandomIdleEmotion()), 2000);
      } catch (err: any) {
        // Handle errors
        console.error("Error during Gemini stream:", err);
        const errorMessage = err.message || "An error occurred contacting AI.";
        setError(errorMessage);

        await new Promise((resolve) => setTimeout(resolve, 300));
        setAvatarEmotion("error");

        // Update messages with error
        const updatedWithError = updatedMessages.concat({
          ...assistantPlaceholder,
          content: `Error: ${errorMessage}`,
          role: "error",
        });

        setMessages(updatedWithError);

        // Save error to storage
        updateConversationInStorage(activeConversationId, updatedWithError);

        setTimeout(() => setAvatarEmotion(getRandomIdleEmotion()), 3000);
      } finally {
        // Reset UI states
        setIsLoading(false);
        isStreamingStartedRef.current = false;
        setTimeout(() => setNewMessageId(null), 500);
      }
    },
    [
      input,
      isLoading,
      messages,
      activeConversationId,
      handleUpdateConversationTitle,
      updateConversationInStorage,
    ]
  );

  const handleSwitchConversation = useCallback(
    (id: string) => {
      const conversation = conversations.find((c) => c.id === id);
      if (conversation && conversation.id !== activeConversationId) {
        setActiveConversationId(id);
        setMessages(conversation.messages || []);
        setNewMessageId(null);
        setError(null);
        setInput("");
        setIsLoading(false);
        setAvatarEmotion("neutral");
      }
    },
    [conversations, activeConversationId]
  );

  const handleDeleteConversation = useCallback(
    (id: string) => {
      // Set flag to skip auto-save since we're manually saving
      skipAutoSaveRef.current = true;

      setConversations((prev) => {
        const updated = prev.filter((c) => c.id !== id);

        // Force save after deletion
        forceSaveConversations(updated);

        // Reset flag after state update
        setTimeout(() => {
          skipAutoSaveRef.current = false;
        }, 0);

        return updated;
      });

      // Handle active conversation changes if deleted
      if (id === activeConversationId) {
        const remainingConversations = conversations.filter((c) => c.id !== id);

        if (remainingConversations.length > 0) {
          // Find the most recent conversation
          const sorted = [...remainingConversations].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          const nextConv = sorted[0];
          setActiveConversationId(nextConv.id);
          setMessages(nextConv.messages || []);
        } else {
          // Create new if no conversations left
          handleNewChat();
        }

        // Reset UI states
        setNewMessageId(null);
        setError(null);
        setInput("");
        setIsLoading(false);
        setAvatarEmotion("neutral");
      }
    },
    [conversations, activeConversationId, handleNewChat, forceSaveConversations]
  );

  // Load conversations on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setMounted(true);

      try {
        // Get saved conversations
        const saved = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);

        let loadedConversations: ChatConversation[] = [];

        if (saved) {
          // Parse and fix dates
          loadedConversations = JSON.parse(saved).map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            messages: (c.messages || []).map((m: any) => ({
              ...m,
              createdAt: new Date(m.createdAt),
            })),
          }));

          console.log("Loaded", loadedConversations.length, "conversations");
        }

        // Set loaded conversations or create initial
        if (loadedConversations.length > 0) {
          // Skip auto-save on initial load
          skipAutoSaveRef.current = true;
          setConversations(loadedConversations);
          setTimeout(() => {
            skipAutoSaveRef.current = false;
          }, 0);

          // Sort by most recent
          const sorted = [...loadedConversations].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          // Set most recent as active
          const mostRecent = sorted[0];
          setActiveConversationId(mostRecent.id);
          setMessages(mostRecent.messages || []);
        } else {
          // Create initial conversation
          const initialId = uuidv4();
          const initialConv: ChatConversation = {
            id: initialId,
            title: "New Conversation",
            messages: [],
            createdAt: new Date(),
          };

          // Skip auto-save since we're manually saving
          skipAutoSaveRef.current = true;
          setConversations([initialConv]);
          setTimeout(() => {
            skipAutoSaveRef.current = false;
          }, 0);

          setActiveConversationId(initialId);

          // Save initial conversation
          forceSaveConversations([initialConv]);
        }
      } catch (e) {
        console.error("Failed to load conversations:", e);

        // Fallback to new conversation
        const initialId = uuidv4();
        const initialConv: ChatConversation = {
          id: initialId,
          title: "New Conversation",
          messages: [],
          createdAt: new Date(),
        };

        // Skip auto-save since we're manually saving
        skipAutoSaveRef.current = true;
        setConversations([initialConv]);
        setTimeout(() => {
          skipAutoSaveRef.current = false;
        }, 0);

        setActiveConversationId(initialId);
        forceSaveConversations([initialConv]);
      }

      // Clean up on unmount
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
  }, [forceSaveConversations]);

  // Computed values
  const statusText = useMemo(() => {
    if (error) return "Error";
    if (isLoading) {
      return isStreamingStartedRef.current ? "Typing..." : "Thinking...";
    }
    return "";
  }, [isLoading, error]);

  const currentAvatarEmotion = useMemo(() => {
    if (isLoading) {
      return isStreamingStartedRef.current ? "typing" : "thinking";
    }
    return avatarEmotion;
  }, [isLoading, avatarEmotion]);

  return {
    messages,
    input,
    isLoading,
    currentAvatarEmotion,
    statusText,
    conversations,
    activeConversationId,
    error,
    mounted,
    newMessageId,
    handleInputChange,
    handleSendMessage,
    handleNewChat,
    handleSwitchConversation,
    handleDeleteConversation,
  };
}
