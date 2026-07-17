import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateRoleDto } from './dto/admin.dto';

/**
 * Управление пользователями — только для администратора.
 */
@Controller('admin/users')
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  list() {
    return this.admin.listUsers();
  }

  @Patch(':id/role')
  changeRole(
    @CurrentUser('id') adminId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.admin.changeRole(adminId, id, dto.role);
  }
}
