import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PointModule } from './point/point.module';

@Module({
  imports: [ ConfigModule.forRoot({
      isGlobal:true,
    }),ProductsModule, PrismaModule, CategoryModule, AuthModule, UsersModule, PointModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
