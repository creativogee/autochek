import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
