import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateApiKey(payload: { username?: string; userId?: string } = {}) {
    const defaultPayload = {
      sub: payload.userId || 'api-user',
      username: payload.username || 'api-user',
      type: 'api-key',
      iat: Math.floor(Date.now() / 1000),
    };

    return this.jwtService.sign(defaultPayload);
  }

  validateApiKey(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}
