import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { ContactsService } from './contacts.service';

@Public()
@Controller()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get('contacts')
  listBranches() {
    return this.contactsService.listBranches();
  }

  @Get('contacts/:id')
  getBranch(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.getBranch(id);
  }
}
