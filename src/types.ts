export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  url: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  attachments: Attachment[];
  ownerId: string;
  ownerUsername?: string;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
}
