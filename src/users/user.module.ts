import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User,UserSchema } from "src/schema/user.schema";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { CacheModule } from "@nestjs/cache-manager";



@Module({
  imports:[MongooseModule.forFeature([{name:User.name,schema:UserSchema}]), CacheModule.register({isGlobal:true})],
  providers:[UserService],
  controllers:[UserController],
})


export class UserModule{}