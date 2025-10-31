import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EncryptionService } from '../common/encryption.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload, LoginResponse, UserProfile } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private encryptionService: EncryptionService,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload: JwtPayload = {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role
    };
    

    const accessToken = this.jwtService.sign(payload);

    // Encrypt user data for additional security
    const encryptedUserData = this.encryptionService.encryptUserData({
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
    });

    return {
      access_token: accessToken,
      user: encryptedUserData,
    } as LoginResponse;
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(oldToken: string) {
    const decoded = await this.validateToken(oldToken);
    const user = await this.usersService.findByEmail(decoded.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return this.login(user);
  }

  async getEncryptedProfile(user: UserProfile) {
    const encryptedUserData = this.encryptionService.encryptUserData({
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
    });

    return encryptedUserData;
  }
}




