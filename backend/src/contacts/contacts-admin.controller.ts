import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { ContactsService } from './contacts.service';
import { CreateContactBranchDto, UpdateContactBranchDto } from './dto/contacts.dto';

@Roles(Role.ADMIN)
@Controller('admin/contacts')
export class ContactsAdminController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  createBranch(@Body() dto: CreateContactBranchDto) {
    return this.contactsService.createBranch(dto);
  }

  @Patch(':id')
  updateBranch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactBranchDto,
  ) {
    return this.contactsService.updateBranch(id, dto);
  }

  @Delete(':id')
  deleteBranch(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.deleteBranch(id);
  }
}
