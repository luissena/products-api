import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './interfaces';

/**
 * JWT Strategy for Passport authentication
 *
 * This strategy handles JWT token validation and extraction from the Authorization header.
 * It extends Passport's JWT Strategy to provide authentication for protected routes.
 *
 * @class JwtStrategy
 * @extends PassportStrategy
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Creates an instance of JwtStrategy
   *
   * @param {ConfigService} configService - NestJS configuration service for accessing environment variables
   * @throws {Error} When JWT_SECRET is not configured in environment variables
   */
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Validates the JWT payload and extracts user information
   *
   * This method is called by Passport after JWT token verification.
   * It validates the payload structure and returns user information for the request.
   *
   * @param {JwtPayload} payload - The decoded JWT payload containing user information
   * @returns {JwtPayload} Enhanced payload with userId field
   * @throws {UnauthorizedException} When payload is invalid or missing required fields
   */
  validate(payload: JwtPayload): JwtPayload {
    if (!payload || !payload.sub || !payload.username) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      userId: payload.sub,
      ...payload,
    };
  }
}
