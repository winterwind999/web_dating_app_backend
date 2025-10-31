export enum Environment {
  Development = 'development',
  Production = 'production',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  NON_BINARY = 'Non Binary',
  OTHER = 'Other',
}

export enum AlbumType {
  IMAGE = 'Image',
  VIDEO = 'Video',
}

export enum UserStatus {
  ACTIVE = 'Active',
  PAUSED = 'Paused',
  BANNED = 'Banned',
  DELETED = 'Deleted',
}

export enum Role {
  User = 'User',
  Admin = 'Admin',
}

export enum ReportStatus {
  PENDING = 'Pending',
  UNDER_REVIEW = 'Under Review',
  RESOLVED = 'Resolved',
  DISMISSED = 'Dismissed',
}

export enum ReportAction {
  NO_ACTION = 'No Action',
  WARNING_SENT = 'Warning Sent',
  CONTENT_REMOVED = 'Content Removed',
  ACCOUNT_SUSPENDED = 'Account Suspended',
  ACCOUNT_BANNED = 'Account Banned',
}

export enum Reason {
  HARASSMENT = 'Harassment',
  SUICIDE_OR_SELF_INJURY = 'Suicide or self-injury',
  VIOLENCE = 'Violence or dangerous organizations',
  NUDITY = 'Nudity or sexual activity',
  SELLING = 'Selling or promoting restricted items',
  SCAM_OR_FRAUD = 'Scam or fraud',
  BLACKMAIL = 'Blackmail',
  IDENTITY_THEFT = 'Identity Theft',
  OTHER = 'Other',
}

export enum ChatStatus {
  SENDING = 'Sending',
  SENT = 'Sent',
  DELIVERED = 'Delivered',
  SEEN = 'Seen',
}
