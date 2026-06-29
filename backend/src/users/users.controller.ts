import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  UpdateProfileDto,
  UpdateSettingsDto,
  AvatarUploadDto,
  SetAvatarDto,
} from './dto/users.dto';

@Controller('me')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  getProfile(@CurrentUser('id') userId: string) {
    return this.users.getProfile(userId);
  }

  @Patch()
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(userId, dto);
  }

  @Post('avatar/upload-url')
  requestAvatarUpload(@CurrentUser('id') userId: string, @Body() dto: AvatarUploadDto) {
    return this.users.requestAvatarUpload(userId, dto.contentType, dto.ext);
  }

  @Patch('avatar')
  setAvatar(@CurrentUser('id') userId: string, @Body() dto: SetAvatarDto) {
    return this.users.setAvatar(userId, dto.key);
  }

  @Get('settings')
  getSettings(@CurrentUser('id') userId: string) {
    return this.users.getSettings(userId);
  }

  @Patch('settings')
  updateSettings(@CurrentUser('id') userId: string, @Body() dto: UpdateSettingsDto) {
    return this.users.updateSettings(userId, dto);
  }
}
