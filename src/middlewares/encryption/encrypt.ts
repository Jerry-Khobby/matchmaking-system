
import { Logger } from '@nestjs/common'
import * as crypto from 'crypto'
import { promisify } from 'util'


// encryption function for the region and status , which are strings 
const iv = crypto.randomBytes(16);
const password = process.env.ENCRYPTION_KEY || 'default_password_1234';// Use a secure password from env variables
const key = crypto.scryptSync(password, 'salt', 32);



export function encrypt (data:any):any{
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
const textToEncrypt = data;
const encryptedText = Buffer.concat([cipher.update(textToEncrypt), cipher.final()]);
return encryptedText;
}
export function decrypt (data:any):any{
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decryptedText = Buffer.concat([decipher.update(Buffer.from(data, 'hex')), decipher.final()]);
  return decryptedText;
}


