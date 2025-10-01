import {IsString,IsOptional,IsNotEmpty,IsNumber} from 'class-validator';

export class UserDto{
  @IsString()
  @IsNotEmpty()
  username:string;

  @IsString()
  @IsNotEmpty()
  region:string;

  @IsString()
  @IsOptional()
  status?:string;

  @IsOptional()
  @IsNumber()
  rating?:number;


  @IsNotEmpty()
  @IsString()
  matchHistory:string[];
}


