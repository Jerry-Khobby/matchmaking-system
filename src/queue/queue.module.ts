import { Module } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { QueueController } from "./queue.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Queue,QueueSchema } from "src/schema/queue.schema";
import { User,UserSchema } from "src/schema/user.schema";
import { CacheModule } from "@nestjs/cache-manager";


@Module({  imports:[MongooseModule.forFeature([{name:Queue.name,schema:QueueSchema},{name:User.name,schema:UserSchema}]), CacheModule.register({isGlobal:true})],
  providers:[QueueService],
  controllers:[QueueController],
})

export class QueueModule{}