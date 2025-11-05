import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { CloudinaryService } from './cloudinary.service';
import { ErrorHandlerService } from './error-handler.service';

@Module({
  providers: [EncryptionService, CloudinaryService, ErrorHandlerService],
  exports: [EncryptionService, CloudinaryService, ErrorHandlerService],
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
