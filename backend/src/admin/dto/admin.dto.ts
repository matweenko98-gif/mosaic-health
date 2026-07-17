import { IsIn } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateRoleDto {
  @IsIn(Object.values(Role))
  role: Role;
}
