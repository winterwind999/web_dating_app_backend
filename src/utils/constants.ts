export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
} as const;
export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];

export const GENDERS = {
  MALE: 'Male',
  FEMALE: 'Female',
  NON_BINARY: 'Non Binary',
  OTHER: 'Other',
} as const;
export type Gender = (typeof GENDERS)[keyof typeof GENDERS];

export const ALBUM_TYPES = {
  IMAGE: 'Image',
  VIDEO: 'Video',
} as const;
export type AlbumType = (typeof ALBUM_TYPES)[keyof typeof ALBUM_TYPES];

export type Album = {
  id: number;
  public_id: string;
  secure_url: string;
  type: AlbumType;
};

export const USER_STATUSES = {
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  BANNED: 'Banned',
} as const;
export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];

export type Photo = {
  public_id: string | null;
  secure_url: string | null;
};

export type Address = {
  street: string;
  city: string;
  province: string;
  country: string;
  coordinates: number[];
};

export type Preferences = {
  genderPreference: Gender[];
  minAge: number;
  maxAge: number;
  maxDistance: number;
};

export const REPORT_REASONS = {
  HARASSMENT: 'Harassment',
  SUICIDE_OR_SELF_INJURY: 'Suicide or self-injury',
  VIOLENCE: 'Violence or dangerous organizations',
  NUDITY: 'Nudity or sexual activity',
  SELLING: 'Selling or promoting restricted items',
  SCAM_OR_FRAUD: 'Scam or fraud',
  BLACKMAIL: 'Blackmail',
  IDENTITY_THEFT: 'Identity Theft',
  OTHER: 'Other',
} as const;
export type ReportReason = (typeof REPORT_REASONS)[keyof typeof REPORT_REASONS];

export const REPORT_STATUSES = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  RESOLVED: 'Resolved',
  DISMISSED: 'Dismissed',
} as const;
export type ReportStatus =
  (typeof REPORT_STATUSES)[keyof typeof REPORT_STATUSES];

export const REPORT_ACTIONS = {
  NO_ACTION: 'No Action',
  WARNING_SENT: 'Warning Sent',
  CONTENT_REMOVED: 'Content Removed',
  ACCOUNT_SUSPENDED: 'Account Suspended',
  ACCOUNT_BANNED: 'Account Banned',
} as const;
export type ReportAction = (typeof REPORT_ACTIONS)[keyof typeof REPORT_ACTIONS];

export const CHAT_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  GIF: 'gif',
  STICKER: 'sticker',
} as const;
export type ChatType = (typeof CHAT_TYPES)[keyof typeof CHAT_TYPES];

export const CHAT_STATUSES = {
  SENDING: 'Sending',
  SENT: 'Sent',
  DELIVERED: 'Delivered',
  SEEN: 'Seen',
} as const;
export type ChatStatus = (typeof CHAT_STATUSES)[keyof typeof CHAT_STATUSES];

export type ChatPayload = {
  match: string;
  senderUser: string;
  receiverUser: string;
  content: string;
  type: ChatType;
  status: ChatStatus;
};

export type NotificationPayload = {
  user: string;
  message: string;
  isRead: boolean;
};
