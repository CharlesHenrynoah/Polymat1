export type ModelCategory = {
  id: string;
  name: string;
  description: string;
  models: Model[];
  icon: string;
  requiresAttachment: boolean;
};

export type Model = {
  id: string;
  name: string;
  description: string;
  category: string;
};

export type ChatMessage = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: File[];
  mediaUrl?: string;
  mediaType?: 'video' | 'image' | 'audio' | 'code';
  modelId?: string;
};

export type User = {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  description?: string;
  sector?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  birthPlace?: string;
  phoneNumber?: string;
  countryCode?: string;
  profileImage?: string;
  created_at: Date;
  updated_at?: Date;
  last_login?: Date;
  isActive: boolean;
  role: 'user' | 'admin' | 'moderator';
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: boolean;
  };
};