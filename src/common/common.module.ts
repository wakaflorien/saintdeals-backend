import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';

@Module({
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class CommonModule {}



// src/common/common.module.ts
// import { Module } from '@nestjs/common';
// import { EncryptionService } from './services/encryption.service';
// import { EmailService } from './services/email.service';
// import { FileService } from './services/file.service';

// @Module({
//   providers: [EncryptionService, EmailService, FileService],
//   exports: [EncryptionService, EmailService, FileService],
// })
// export class CommonModule {}