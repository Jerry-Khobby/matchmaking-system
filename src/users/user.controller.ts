import { Controller,Get,Post,Param,Body,HttpCode,HttpStatus } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserDto } from "./dto/user.dto";
import { ApiTags,ApiOperation,ApiResponse } from "@nestjs/swagger";


@ApiTags('User')
@Controller('user')
export class UserController{
  constructor(private readonly userService:UserService){}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({summary:'Create a new user'})
  @ApiResponse({status:201,description:'The user has been successfully created.'})
  @ApiResponse({status:400,description:'Bad Request. Username already exists.'})
  async create(@Body() UserDto:UserDto):Promise<{User:string}>{
    return this.userService.createUser(
      UserDto.username,
      UserDto.region,
      UserDto.status || 'idle',
      UserDto.rating || 1200,
    );
  }

@Get(':id')
@HttpCode(HttpStatus.OK)
@ApiOperation({summary:'Get user by ID'})
@ApiResponse({status:200,description:'The user has been successfully retrieved.'})
@ApiResponse({status:404,description:'User not found.'})
async getUserbyId(@Param('id')id:string){
  return this.userService.getUserById(id);
}
  }
