import React, { useState, useEffect, useRef, useMemo } from "react";
import { Loader2 } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/Chat/ChatHeader";
import ChatInputForm from "@/components/Chat/ChatInputForm";
import AvatarStatusDisplay from "@/components/Avatar/AvatarStatusDisplay";
import ChatMessage from "@/components/Chat/ChatMessage";

import { useChatManager } from "@/hooks/useChatManager";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { aiPersona } from "@/config/personaConfig";


export default function ChatPage(): React.ReactElement | null {
  const {
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
  } = useChatManager();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentBreakpoint = useBreakpoint();
  const avatarSize = currentBreakpoint === "sm" ? "md" : "lg";
  const avatarPositionClasses =
    avatarSize === "lg" ? "md:left-6 left-4" : "md:left-4 left-4";
  const chatContainerPadding =
    avatarSize === "lg" ? "pl-6 md:pl-32" : "pl-6 md:pl-20";
  const chatAreaBottomPadding =
    avatarSize === "lg" ? "md:pb-28 pb-24" : "md:pb-24 pb-24";
  const conversationTitle = useMemo(() => {
    return (
      conversations.find((c) => c.id === activeConversationId)?.title ||
      aiPersona.name
    );
  }, [conversations, activeConversationId]);

  useEffect(() => {
    // Add slight delay for smoother scroll after render
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSwitchConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main Content*/}
      <div className="flex flex-col flex-1 h-full relative">
        {/* Header Component */}
        <ChatHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          conversationTitle={conversationTitle}
          onNewChat={handleNewChat} 
        />

        {/* Chat Message List Area */}
        <div
          className={`flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-blue-950 ${chatContainerPadding}`}
        >
          <div className={chatAreaBottomPadding}>
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 px-4 pt-10">
                <h2 className="mt-4 text-xl font-semibold dark:text-white">
                  {aiPersona.greeting}
                </h2>
                <p className="max-w-md mt-2">How can I assist you today?</p>
              </div>
            )}
            {/* Message Renderer */}
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLoading={isLoading}
                // Determine if this is the message currently being typed
                isNewAssistantMessage={
                  message.role === "assistant" && message.id === newMessageId
                }
              />
            ))}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {/* Avatar and Status Display Component */}
        <AvatarStatusDisplay
          size={avatarSize}
          emotion={currentAvatarEmotion}
          statusText={statusText}
          positionClasses={avatarPositionClasses}
        />

        {/* Input Form Component */}
        <ChatInputForm
          input={input}
          onInputChange={handleInputChange}
          onSubmit={handleSendMessage}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
