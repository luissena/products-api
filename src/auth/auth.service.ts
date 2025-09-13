import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Authentication Service
 *
 * This service handles JWT token generation and validation for API authentication.
 * It provides methods to generate API keys and validate JWT tokens.
 *
 * @class AuthService
 */
@Injectable()
export class AuthService {
  /**
   * Creates an instance of AuthService
   *
   * @param {JwtService} jwtService - NestJS JWT service for token operations
   */
  constructor(private jwtService: JwtService) {}

  /**
   * Generates a JWT API key with the provided payload
   *
   * Creates a signed JWT token that can be used for API authentication.
   * The token includes standard JWT claims and custom user information.
   *
   * @param {Object} payload - Optional payload containing user information
   * @param {string} [payload.username] - Username for the API key
   * @param {string} [payload.userId] - User ID for the API key
   * @returns {string} Signed JWT token string
   *
   * @example
   * ```typescript
   * const apiKey = authService.generateApiKey({ username: 'admin', userId: '123' });
   * console.log(apiKey); // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   * ```
   */
  generateApiKey(payload: { username?: string; userId?: string } = {}): string {
    const defaultPayload = {
      sub: payload.userId || 'api-user',
      username: payload.username || 'api-user',
      type: 'api-key',
      iat: Math.floor(Date.now() / 1000),
    };

    return this.jwtService.sign(defaultPayload);
  }

  /**
   * Validates a JWT API key token
   *
   * Verifies the signature and expiration of a JWT token.
   * Returns the decoded payload if valid, null if invalid or expired.
   *
   * @param {string} token - The JWT token to validate
   * @returns {any|null} Decoded payload if valid, null if invalid
   *
   * @example
   * ```typescript
   * const payload = authService.validateApiKey('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
   * if (payload) {
   *   console.log('Valid token:', payload.username);
   * } else {
   *   console.log('Invalid token');
   * }
   * ```
   */
  validateApiKey(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}
