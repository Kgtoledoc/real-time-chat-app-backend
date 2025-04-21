import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';

@Module({
  providers: [EncryptionService],
  exports: [EncryptionService], // Exporta EncryptionService para que otros módulos puedan usarlo
})
export class CommonModule {}