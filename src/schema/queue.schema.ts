// queue.schema.ts
import { Schema,Prop,SchemaFactory } from "@nestjs/mongoose";
import { Document,SchemaTypes,Types } from "mongoose";


@Schema({timestamps:true})
export class Queue extends Document{
@Prop({type:SchemaTypes.ObjectId,ref:'User',required:true})
userId:string;
@Prop({ required: true })
 username: string; // Denormalized for faster queries
 @Prop({ required: true })
 rating: number;
 @Prop({ required: true })
 region: string;
 @Prop({required:true})
 status: string; // idle, searching, in_match
 @Prop({ required: true })
 mode: string; // 1v1, 2v2, 5v5
 @Prop({ default: Date.now })
 joinedAt: Date;
}

export const QueueSchema = SchemaFactory.createForClass(Queue);