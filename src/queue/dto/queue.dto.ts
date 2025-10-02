import { IsNotEmpty, IsString, IsNumber, Matches } from "class-validator";

export class QueueDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

 // we’ll add a custom validator for country/region code

  @IsString()
  @Matches(/^\d+v\d+$/, { message: "Mode must be in the format '1v1', '1v2', '2v2', etc." })
  mode: string;
}
