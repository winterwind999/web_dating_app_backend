import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsMongoId()
  conversationId!: string;

  @IsMongoId()
  sender!: string;

  @IsOptional()
  @IsString()
  content?: string;

  // 'text' | 'image' | 'gif' | 'sticker'
  @IsOptional()
  @IsString()
  type?: 'text' | 'image' | 'gif' | 'sticker';
}
