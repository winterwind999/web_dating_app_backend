import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from 'src/schemas/admin.schema';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Admin.name,
        schema: AdminSchema,
      },
    ]),
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
})
export class AdminsModule {}
