import { IsNotEmpty, IsString } from "class-validator";

export class LeaveQueueDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
