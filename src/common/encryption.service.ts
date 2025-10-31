import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionService {
  private readonly key: string;

  constructor() {
    const envKey = process.env.ENCRYPTION_KEY;
    if (!envKey) {
      throw new Error('ENCRYPTION_KEY is not defined in environment variables');
    }
    this.key = envKey;
  }

  encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.key).toString();
  }

  decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, this.key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  encryptUserData(data: any): string {
    return this.encrypt(JSON.stringify(data));
  }

  decryptUserData(encryptedData: string): any {
    const decrypted = this.decrypt(encryptedData);
    return JSON.parse(decrypted);
  }
}
