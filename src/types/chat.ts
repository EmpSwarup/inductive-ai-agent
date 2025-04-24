import { AvatarEmotion } from "./avatar"; 

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  createdAt?: Date;
}

// Conversation structure
export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessageData[];
  createdAt: Date | string;
}

// Type for the return value of our custom hook
export interface UseChatManagerReturn {
    messages: ChatMessageData[];
    input: string;
    isLoading: boolean;
    currentAvatarEmotion: AvatarEmotion;
    statusText: string;
    newMessageId: string | null;
    conversations: ChatConversation[];
    activeConversationId: string | null;
    error: string | null;
    mounted: boolean;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSendMessage: (event?: React.FormEvent<HTMLFormElement>) => Promise<void>;
    handleNewChat: (preventSave?: boolean) => void;
    handleSwitchConversation: (id: string) => void;
    handleDeleteConversation: (id: string) => void;
}