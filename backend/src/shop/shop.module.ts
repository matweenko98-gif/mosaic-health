import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { ShopAdminController } from './shop-admin.controller';

@Module({
  controllers: [ShopController, ShopAdminController],
  providers: [ShopService],
})
export class ShopModule {}
