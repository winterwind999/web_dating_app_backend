import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ALBUM_TYPES, type AlbumType } from 'src/utils/constants';

export class AlbumDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsEnum(Object.values(ALBUM_TYPES))
  @IsNotEmpty()
  type: AlbumType;

  @IsNumber()
  @IsNotEmpty()
  sortOrder: number;
}

export class UploadAlbumsDto {
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => AlbumDto)
  albums: AlbumDto[];
}
