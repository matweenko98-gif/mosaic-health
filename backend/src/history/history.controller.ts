import { Body, Controller, Get, Post } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateWorkoutLogDto } from './dto/history.dto';

@Controller('me')
export class HistoryController {
  constructor(private readonly history: HistoryService) {}

  @Get('history')
  list(@CurrentUser('id') userId: string) {
    return this.history.list(userId);
  }

  @Post('history')
  create(@CurrentUser('id') userId: string, @Body() dto: CreateWorkoutLogDto) {
    return this.history.create(userId, dto);
  }

  @Get('achievements')
  achievements(@CurrentUser('id') userId: string) {
    return this.history.achievements(userId);
  }
}
