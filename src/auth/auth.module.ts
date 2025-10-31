import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../common/common.module';

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'qwertyuiopoiuytrewq',
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};

@Module({
  imports: [
    PassportModule,
    CommonModule,
    UsersModule,
    JwtModule.register(jwtConfig as any),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}