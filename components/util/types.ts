

interface UserDetails {
  id?: string;
  userId?: string;
  name: string;
  email: string;
  profilePicture: string;
  about?: string;
  verified?: boolean;
  password?: string;
  contacts?: Contact[];
}

interface MessageInfo {
  id?: string;
  refrenceId?: string;
  message: string;
  receiverIndex?: number;
  userSentTime?: string;
  receivedTime?: string;
  sentTime?: string;
  seenTime?: string;
  error?: string;
  receiverId?: string;
  senderId?: string;
}

interface Contact {
  id: string;
  index: number;
  name: string;
  email: string;
  about?: string;
  profilePicture: string;
  messages?: MessageInfo[];
  status?: string;
  lastSeenTime?: string;
}

interface StatusInfo {
  status: string;
  lastSeenTime: string;
}

type EmailPayload = | { from: string; to: string[]; subject: string; react: React.ReactNode }
  | { from: string; to: string[]; subject: string; html: string; text?: string }
  | { from: string; to: string[]; subject: string; text: string };

type SameSite = 'strict' | 'lax' | 'none';

export type { Contact, UserDetails, MessageInfo, EmailPayload, StatusInfo, SameSite };