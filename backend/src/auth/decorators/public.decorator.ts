import { SetMetadata } from '@nestjs/common';

/**
 * Помечает маршрут как публичный — без проверки токена входа.
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
