import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import {
  CHAT_STATUSES,
  CHAT_TYPES,
  type ChatStatus,
  type ChatType,
} from 'src/utils/constants';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  match: string;

  @IsString()
  @IsNotEmpty()
  senderUser: string;

  @IsString()
  @IsNotEmpty()
  receiverUser: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(Object.values(CHAT_TYPES))
  @IsNotEmpty()
  type: ChatType;

  @IsEnum(Object.values(CHAT_STATUSES))
  @IsNotEmpty()
  status: ChatStatus;
}
