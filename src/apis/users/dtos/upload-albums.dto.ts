import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ALBUM_TYPES, type AlbumType } from 'src/utils/constants';

export class AlbumDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsEnum(Object.values(ALBUM_TYPES))
  @IsNotEmpty()
  type: AlbumType;
}

export class UploadAlbumsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlbumDto)
  albums: AlbumDto[];
}
