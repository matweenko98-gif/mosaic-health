import { Module } from '@nestjs/common';
import { ContactsAdminController } from './contacts-admin.controller';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

@Module({
  controllers: [ContactsController, ContactsAdminController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
