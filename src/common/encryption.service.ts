import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";


@Injectable()
export class EncryptionService {
    private readonly algorithm = process.env.MESSAGING_ENCRYPTION_ALGORITHM || 'aes-256-cbc';
    private readonly key = process.env.MESSAGING_ENCRYPTION_KEY || 'default_key_32_bytes_long';
    private readonly iv = process.env.MESSAGING_ENCRYPTION_IV || 'default_iv_16_bytes'; 

    encrypt(text: string): string {
        console.log('Encrypting text:', text);
        console.log('Algorithm:', this.algorithm);
        console.log('Key:', this.key);
        console.log('IV:', this.iv);
        const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.key), Buffer.from(this.iv));
        console.log('Cipher:', cipher);
        let encrypted = cipher.update(text, 'utf8', 'hex');

        encrypted += cipher.final('hex');
        console.log('Encrypted text:', encrypted);
        return encrypted;
    }

    decrypt(encryptedText: string): string {
        console.log('Decrypting text:', encryptedText);
        console.log('Algorithm:', this.algorithm);
        console.log('Key:', this.key);
        console.log('IV:', this.iv);
        const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.key), Buffer.from(this.iv));
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
