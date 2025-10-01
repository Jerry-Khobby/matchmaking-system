// user.schema.ts 
import { Schema,Prop,SchemaFactory } from "@nestjs/mongoose";
import { Document,SchemaTypes,Types } from "mongoose";


@Schema({timestamps:true})
export class User extends Document{
@Prop({required:true,unique:true})
username:string;
@Prop({ default: 1200 })
 rating: number;
 @Prop({ required: true })
 region: string; // "NA", "EU", "ASIA"
 @Prop({ default: 'idle' })
 status: string; // idle, searching, in_match
 @Prop([{ type: SchemaTypes.ObjectId, ref: 'Match' }])
 matchHistory: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);