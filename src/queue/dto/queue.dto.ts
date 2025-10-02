import { IsEmpty,IsString,IsNumber } from "class-validator";


export class QueueDto{
    @IsEmpty()
    userId:string;
    @IsString()
    @IsEmpty()
    username:string;
    @IsNumber()
    @IsEmpty()
    rating:number;
    @IsString()
    @IsEmpty()
    region:string
    @IsString()
    mode:string;
}