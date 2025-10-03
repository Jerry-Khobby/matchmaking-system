import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import {CacheModule} from '@nestjs/cache-manager';
import { UserModule } from './users/user.module';
import { QueueModule } from './queue/queue.module';

import { MatchmakingModule } from './matches/matchmarking.module';
@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    CacheModule.register({isGlobal:true}),
    UserModule,
    QueueModule,
    MatchmakingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
}
)

export class AppModule {}
