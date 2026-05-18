import { Module } from '@nestjs/common';
import { SupervisionService } from './supervision.service';
import { SupervisionController } from './supervision.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [SupervisionController],
  providers: [SupervisionService],
  exports: [SupervisionService],
})
export class SupervisionModule {}
