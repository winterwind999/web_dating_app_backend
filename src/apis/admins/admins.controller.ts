import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page: number,
    @Query('search') search: string,
  ) {
    return this.adminsService.findAll(page, search);
  }

  @Get(':adminId')
  findOne(@Param('adminId') adminId: string) {
    return this.adminsService.findOne(adminId);
  }

  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @Patch(':adminId')
  update(
    @Param('adminId') adminId: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return this.adminsService.update(adminId, updateAdminDto);
  }
}
