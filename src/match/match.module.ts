import { Module } from "@nestjs/common";
import { MatchService } from "./match.service";
import { MatchController } from "./match.controller";
import {MongooseModule} from "@nestjs/mongoose";
import { Match,MatchSchema } from "src/schema/match.schema";
import { User,UserSchema } from "src/schema/user.schema";
import { CacheModule } from "@nestjs/cache-manager";
@Module({  imports:[MongooseModule.forFeature([{name:Match.name,schema:MatchSchema},{name:User.name,schema:UserSchema}]), CacheModule.register({isGlobal:true})],
  providers:[MatchService],
  controllers:[MatchController],
})

export class MatchModule{}