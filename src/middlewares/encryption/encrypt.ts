
import { Logger } from '@nestjs/common'
import * as crypto from 'crypto'
import { promisify } from 'util'


// encryption function for the region and status , which are strings 
const iv = crypto.randomBytes(16);
const password = process.env.ENCRYPTION_KEY || 'default_password_1234';// Use a secure password from env variables
const key = crypto.scryptSync(password, 'salt', 32);



export function encrypt(data: any): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encryptedText = Buffer.concat([cipher.update(String(data), 'utf8'), cipher.final()]);
  // Store iv + encrypted value in hex
  return iv.toString('hex') + ':' + encryptedText.toString('hex');
}

export function decrypt(data: string): string {
  const [ivHex, encryptedHex] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decryptedText = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decryptedText.toString('utf8');
}



