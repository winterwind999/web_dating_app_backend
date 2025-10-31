import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import type { Request, Response } from 'express';
import { TokensService } from 'src/helpers/tokens/tokens.service';
import { tryCatch } from 'src/utils/tryCatch';
import { Public } from '../../core/decorators/public.decorator';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UploadAlbumsDto } from './dtos/upload-albums.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page: number,
    @Query('search') search: string,
  ) {
    return this.usersService.findAll(page, search);
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Public()
  @Post()
  async create(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ) {
    const { data: user, error: errorUser } = await tryCatch(
      this.usersService.create(createUserDto),
    );

    if (errorUser) {
      throw errorUser;
    }

    const { data: tokens, error: errorTokens } = await tryCatch(
      this.tokensService.loginTokens(req, res, user),
    );

    if (errorTokens) {
      throw errorTokens;
    }

    return tokens;
  }

  @Patch(':userId')
  async update(
    @Param('userId') userId: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    const { error } = await tryCatch(
      this.usersService.update(userId, updateUserDto),
    );

    if (error) {
      throw error;
    }

    return { message: 'User updated' };
  }

  @Patch('uploadPhoto/:userId')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @Param('userId') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
        fileIsRequired: true,
      }),
    )
    photo: Express.Multer.File,
  ) {
    const { error } = await tryCatch(
      this.usersService.uploadPhoto(userId, photo),
    );

    if (error) {
      throw error;
    }

    return { message: 'Photo uploaded' };
  }

  @Patch('uploadAlbums/:userId')
  @UseInterceptors(FilesInterceptor('albums', 5))
  async uploadAlbums(
    @Param('userId') userId: string,
    @Body('metadata') metadata: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(image|video)\/.*/ }),
        ],
        fileIsRequired: true,
      }),
    )
    albums: Express.Multer.File[],
  ) {
    let uploadAlbumsDto: UploadAlbumsDto;

    const { data: parsed, error: errorParsed } = await tryCatch(
      JSON.parse(metadata),
    );

    if (errorParsed) {
      throw new BadRequestException(
        'Failed to parse metadata:',
        errorParsed.message,
      );
    }

    uploadAlbumsDto = plainToClass(UploadAlbumsDto, parsed);

    const { error: errorValidate } = await tryCatch(validate(uploadAlbumsDto));

    if (errorValidate) {
      throw new BadRequestException(
        'Failed to validate metadata:',
        errorValidate.message,
      );
    }

    const { error } = await tryCatch(
      this.usersService.uploadAlbums(userId, uploadAlbumsDto, albums),
    );

    if (error) {
      throw error;
    }

    return { message: 'Albums uploaded' };
  }
}
