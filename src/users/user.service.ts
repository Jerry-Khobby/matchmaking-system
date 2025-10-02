import { Injectable,Logger,UnauthorizedException,BadRequestException,Inject } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/schema/user.schema";
import { UserDto } from "./dto/user.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { encrypt,decrypt } from "src/middlewares/encryption/encrypt";
import { isValidCountryCode } from "src/middlewares/regions/region.validation";



interface CacheUser{
  id:number;
  username:string;
  region:string;
}

@Injectable()
export class UserService{
  constructor(@InjectModel(User.name) private userModel:Model<User>,
  @Inject(CACHE_MANAGER) private cacheManager:Cache
  ){}

  private logger=new Logger('UserService');

async createUser(
  username: string,
  region: string,
  status: string,
  rating?: number,
): Promise<{ User: string }> {
  // Check the cache
  const userCache = await this.cacheManager.get<CacheUser>(`user:${username}`);
  if (userCache) {
    throw new BadRequestException('Username already exists');
  }

  const existingUser = await this.userModel.findOne({ username });
  if (existingUser) {
    throw new BadRequestException('Username already exists');
  }

  // I want to check if the region is valid 
  if (!isValidCountryCode(region)) {
    throw new BadRequestException('Invalid region code');
  }

  // Encrypt sensitive fields
  const encryptedRegion = encrypt(region);
  const encryptedStatus = encrypt(status);

  // Create the user with correct schema fields
  const newUser = new this.userModel({
    username,
    region: encryptedRegion,
    status: encryptedStatus,
    rating: rating || 1200,
  });

  const savedUser = await newUser.save();

  // Store in cache (better to store raw values here, not encrypted)
  await this.cacheManager.set(
    `user:${username}`,
    {
      id: savedUser.id.toString(),
      username: savedUser.username,
      region: region, // keep region human-readable in cache
    },
    3600,
  );

  this.logger.log(`User created: ${username}`);
  return { User: `User ${username} created successfully` };
}



//I want to grab a user by ID 
async getUserById(id: string): Promise<any> {
  // 1. Try to get user from DB
  const user = await this.userModel.findById(id);
  if (!user) {
    throw new BadRequestException('User not found');
  }

  // 2. Check cache (cached by username, not id!)
  const cachedUser = await this.cacheManager.get<CacheUser>(`user:${user.username}`);
  if (!cachedUser) {
    // If not cached, re-set it
    await this.cacheManager.set(
      `user:${user.username}`,
      {
        id: user.id,
        username: user.username,
        region: decrypt(user.region), // store readable region in cache
      },
      3600,
    );
  }

  // 3. Decrypt sensitive fields
  const decryptedRegion = decrypt(user.region);
  const decryptedStatus = decrypt(user.status);

  return {
    ...user.toObject(),
    region: decryptedRegion,
    status: decryptedStatus,
  };
}


}