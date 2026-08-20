export type EncryptedContextPayload = {
  ciphertext: string;
  iv: string;
  digest: string;
};

export type ConversationTaskDto = {
  id: string;
  chatId: string;
  createdBy: string;
  assigneeId: string | null;
  status: 'open' | 'completed';
  dueAt: string | null;
  content: string | null;
  encryptedContent: EncryptedContextPayload | null;
  createdAt: string;
  updatedAt: string;
};

export type ConversationDecisionDto = {
  id: string;
  chatId: string;
  createdBy: string;
  status: 'proposed' | 'final';
  content: string | null;
  encryptedContent: EncryptedContextPayload | null;
  createdAt: string;
  updatedAt: string;
};
