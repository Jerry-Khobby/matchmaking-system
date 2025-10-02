import { IsString, IsOptional, IsNotEmpty, IsNumber, IsIn } from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsString()
  @IsOptional()
  @IsIn(['idle', 'in_match', 'searching'], {
    message: "Status must be either 'idle', 'in_match', or 'searching'",
  })
  status?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;
}
