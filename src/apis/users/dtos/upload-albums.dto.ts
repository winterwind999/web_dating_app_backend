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
import { AlbumType } from 'src/utils/enums';

export class AlbumDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsEnum(AlbumType)
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
