import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { tryCatch } from 'src/utils/tryCatch';
import { Public } from '../../core/decorators/public.decorator';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page: number,
    @Query('search') search: string,
  ) {
    return this.usersService.findAll(page, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Public()
  @Post()
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    const { error } = await tryCatch(this.usersService.create(createUserDto));

    if (error) {
      throw error;
    }

    return { message: 'User created' };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    const { error } = await tryCatch(
      this.usersService.update(id, updateUserDto),
    );

    if (error) {
      throw error;
    }

    return { message: 'User updated' };
  }
}
