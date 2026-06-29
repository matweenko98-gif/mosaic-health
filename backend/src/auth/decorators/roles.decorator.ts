import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

/**
 * Ограничивает доступ к маршруту указанными ролями.
 * Пример: @Roles(Role.SPECIALIST, Role.ADMIN)
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
