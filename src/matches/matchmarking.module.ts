import { Module } from "@nestjs/common";
import { MatchmakingService } from "./matchmarking.service";
import { MatchmakingController } from "./matchmarking.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Match,MatchSchema } from "src/schema/match.schema";
import { User,UserSchema } from "src/schema/user.schema";
import { Queue,QueueSchema } from "src/schema/queue.schema";



import { CacheModule } from "@nestjs/cache-manager";


@Module({  imports:[MongooseModule.forFeature([{name:Match.name,schema:MatchSchema},{name:User.name,schema:UserSchema},{name:Queue.name,schema:QueueSchema}]), CacheModule.register({isGlobal:true})],  
providers:[MatchmakingService],
controllers:[MatchmakingController],
})

export class MatchmakingModule{}