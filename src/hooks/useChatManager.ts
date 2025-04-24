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

  const handleUpdateConversationTitle = useCallback(
    (id: string | null, newTitle: string) => {
      if (!id) return;
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === id
            ? { ...conv, title: newTitle || "Untitled Chat" }
            : conv
        )
      );
    },
    []
  );

  const handleNewChat = useCallback((preventSave = false) => {
    const newId = uuidv4();
    const newConversation: ChatConversation = {
      id: newId,
      title: "New Conversation",
      messages: [],
      createdAt: new Date(),
    };
    setConversations((prev) => {
      if (
        prev.length > 0 &&
        prev[0].messages.length === 0 &&
        prev[0].title === "New Conversation"
      ) {
        setActiveConversationId(prev[0].id);
        setMessages([]);
        setNewMessageId(null);
        setError(null);
        setInput("");
        setIsLoading(false);
        setAvatarEmotion("neutral");
        return prev;
      }
      // Add the new conversation if it's truly new or if list is empty
      if (!preventSave) {
        return [newConversation, ...prev];
      }
      return prev;
    });
    setActiveConversationId(newId);
    setMessages([]);
    setNewMessageId(null);
    setError(null);
    setInput("");
    setIsLoading(false);
    setAvatarEmotion("neutral");
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleSendMessage = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const currentInput = input.trim();
      if (!currentInput || isLoading || !activeConversationId) return;

      setError(null);
      setIsLoading(true);
      setAvatarEmotion("thinking");
      isStreamingStartedRef.current = false;
      setInput("");

      const userMessage: ChatMessageData = {
        id: uuidv4(),
        role: "user",
        content: currentInput,
        createdAt: new Date(),
      };
      const currentMessagesState = [...messages, userMessage];
      setMessages(currentMessagesState);

      const apiHistory: GeminiMessage[] = currentMessagesState
        .filter((msg) => msg.role === "user" || msg.role === "assistant")
        .map((msg) => ({
          role: msg.role === "assistant" ? "model" : msg.role,
          parts: [{ text: msg.content }],
        }));

      const assistantMessageId = uuidv4();
      setNewMessageId(assistantMessageId);

      const assistantPlaceholder: ChatMessageData = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantPlaceholder]);

      let accumulatedContent = "";
      try {
        const stream = await generateContentStream(apiHistory);
        if (!stream) throw new Error("Failed to initialize Gemini stream.");

        for await (const chunk of stream) {
          if (!isStreamingStartedRef.current) {
            isStreamingStartedRef.current = true;
            setAvatarEmotion("typing");
          }
          accumulatedContent += chunk.text;
          setMessages((currentMsgState) =>
            currentMsgState.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulatedContent }
                : msg
            )
          );
        }

        const characters = accumulatedContent.length;
        const msPerChar = 15;
        const baseDelay = 300;
        const calculatedDelay = Math.min(baseDelay + characters * msPerChar);
        console.log(
          `Response length: ${characters}, Calculated delay: ${calculatedDelay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, calculatedDelay));

        if (currentMessagesState.length === 1) {
          handleUpdateConversationTitle(
            activeConversationId,
            currentInput.substring(0, 25) +
              (currentInput.length > 25 ? "..." : "")
          );
        }
        setAvatarEmotion("happy");
        setTimeout(() => setAvatarEmotion(getRandomIdleEmotion()), 2000);
      } catch (err: any) {
        console.error("Error during Gemini stream:", err);
        const errorMessage = err.message || "An error occurred contacting AI.";
        setError(errorMessage);
        await new Promise((resolve) => setTimeout(resolve, 300));
        setAvatarEmotion("error");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: `Error: ${errorMessage}`, role: "error" }
              : msg
          )
        );
        setTimeout(() => setAvatarEmotion(getRandomIdleEmotion()), 3000);
      } finally {
        setIsLoading(false);
        isStreamingStartedRef.current = false;
        setTimeout(() => setNewMessageId(null), 500);
      }
    },
    [
      input,
      isLoading,
      activeConversationId,
      messages,
      conversations,
      handleUpdateConversationTitle,
    ] // conversations needed for title update
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
      const updatedConversations = conversations.filter((c) => c.id !== id);
      setConversations(updatedConversations);
      if (id === activeConversationId) {
        if (updatedConversations.length > 0) {
          const sorted = [...updatedConversations].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          const nextConv = sorted[0];
          setActiveConversationId(nextConv.id);
          setMessages(nextConv.messages || []);
          setNewMessageId(null);
          setError(null);
          setInput("");
          setIsLoading(false);
          setAvatarEmotion("neutral");
        } else {
          handleNewChat();
        }
      }
    },
    [conversations, activeConversationId, handleNewChat]
  );

  // Load conversations
  useEffect(() => {
    if (typeof window !== "undefined") {
      setMounted(true);
      try {
        const saved = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
        const loaded = saved
          ? JSON.parse(saved).map((c: any) => ({
              ...c,
              createdAt: new Date(c.createdAt),
              messages: c.messages || [],
            }))
          : [];
        setConversations(loaded);
        if (loaded.length > 0) {
          const sorted = [...loaded].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setActiveConversationId(sorted[0].id);
          setMessages(sorted[0].messages || []);
        } else {
          handleNewChat(true);
        } // Prevent save on initial load
      } catch (e) {
        console.error("Load failed:", e);
        handleNewChat(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once

  // Save conversations
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(
        CONVERSATIONS_STORAGE_KEY,
        JSON.stringify(conversations)
      );
    }
  }, [conversations, mounted]);

  // Update conversation object
  useEffect(() => {
    if (mounted && activeConversationId) {
      setConversations((p) =>
        p.map((c) => (c.id === activeConversationId ? { ...c, messages } : c))
      );
    }
  }, [messages, mounted, activeConversationId]);

  const statusText = useMemo(() => {
    if (error) return "Error";
    if (isLoading)
      return isStreamingStartedRef.current ? "Typing..." : "Thinking...";
    return "";
  }, [isLoading, isStreamingStartedRef.current, error]);
  const currentAvatarEmotion = useMemo(
    () =>
      isLoading
        ? isStreamingStartedRef.current
          ? "typing"
          : "thinking"
        : avatarEmotion,
    [isLoading, isStreamingStartedRef.current, avatarEmotion]
  );

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
