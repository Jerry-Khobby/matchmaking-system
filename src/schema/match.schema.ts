import { Schema,Prop,SchemaFactory } from "@nestjs/mongoose";
import { Document,SchemaTypes,Types } from "mongoose";
// match.schema.ts
@Schema({ timestamps: true })
export class Match extends Document {
 @Prop({ default: 'pending' })
 status: string; // pending, active, finished
 @Prop({ required: true })
 mode: string; // 1v1, 2v2, 5v5
 @Prop([{
 userId: { type: SchemaTypes.ObjectId, ref: 'User' },
 username: String,
 rating: Number,
 team: String // for team-based games
 }])
 players: Array<{
 userId: string;
 username: string;
 rating: number;
 team?: string;
 }>;
 @Prop()
 winner: string; // userId of winner
 @Prop()
 result: {
 winnerRating: number;
 loserRating: number;
 ratingChange: number;
 };
}
export const MatchSchema = SchemaFactory.createForClass(Match);