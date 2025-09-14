import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from './interfaces';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    mockConfigService.get.mockReturnValue('test-secret');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('constructor', () => {
    it('should throw error when JWT_SECRET is not configured', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const call = () =>
        new JwtStrategy(mockConfigService as unknown as ConfigService);
      expect(call).toThrow('JWT_SECRET is not configured');
    });

    it('should throw error when JWT_SECRET is empty string', () => {
      mockConfigService.get.mockReturnValue('');

      const call = () =>
        new JwtStrategy(mockConfigService as unknown as ConfigService);
      expect(call).toThrow('JWT_SECRET is not configured');
    });

    it('should initialize successfully when JWT_SECRET is configured', () => {
      mockConfigService.get.mockReturnValue('test-secret');

      const call = () =>
        new JwtStrategy(mockConfigService as unknown as ConfigService);
      expect(call).not.toThrow();
    });
  });

  describe('validate', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue('test-secret');
    });

    it('should return payload with userId when payload is valid', () => {
      const validPayload: JwtPayload = {
        sub: 'user-123',
        username: 'test-user',
        type: 'api-key',
        iat: Math.floor(Date.now() / 1000),
      };

      const result = strategy.validate(validPayload);

      expect(result).toEqual({
        userId: 'user-123',
        sub: 'user-123',
        username: 'test-user',
        type: 'api-key',
        iat: validPayload.iat,
      });
    });

    it('should throw UnauthorizedException when payload is null', () => {
      const call = () => strategy.validate(null as unknown as JwtPayload);
      expect(call).toThrow(UnauthorizedException);
      expect(call).toThrow('Invalid token');
    });

    it('should throw UnauthorizedException when payload is undefined', () => {
      const call = () => strategy.validate(undefined as unknown as JwtPayload);
      expect(call).toThrow(UnauthorizedException);
      expect(call).toThrow('Invalid token');
    });

    it('should throw UnauthorizedException when payload.sub is missing', () => {
      const invalidPayload = {
        username: 'test-user',
        type: 'api-key',
      } as unknown as JwtPayload;

      const call = () => strategy.validate(invalidPayload);
      expect(call).toThrow(UnauthorizedException);
      expect(call).toThrow('Invalid token');
    });

    it('should throw UnauthorizedException when payload.username is missing', () => {
      const invalidPayload = {
        sub: 'user-123',
        type: 'api-key',
      } as unknown as JwtPayload;

      const call = () => strategy.validate(invalidPayload);
      expect(call).toThrow(UnauthorizedException);
      expect(call).toThrow('Invalid token');
    });

    it('should throw UnauthorizedException when payload.sub is empty string', () => {
      const invalidPayload: JwtPayload = {
        sub: '',
        username: 'test-user',
        type: 'api-key',
      };

      const call = () => strategy.validate(invalidPayload);
      expect(call).toThrow(UnauthorizedException);
      expect(call).toThrow('Invalid token');
    });

    it('should throw UnauthorizedException when payload.username is empty string', () => {
      const invalidPayload: JwtPayload = {
        sub: 'user-123',
        username: '',
        type: 'api-key',
      };

      const call = () => strategy.validate(invalidPayload);
      expect(call).toThrow(UnauthorizedException);
      expect(call).toThrow('Invalid token');
    });

    it('should preserve additional properties in payload', () => {
      const payloadWithExtra: JwtPayload = {
        sub: 'user-123',
        username: 'test-user',
        type: 'api-key',
        role: 'admin',
        permissions: ['read', 'write'],
        iat: Math.floor(Date.now() / 1000),
      };

      const result = strategy.validate(payloadWithExtra);

      expect(result).toEqual({
        userId: 'user-123',
        sub: 'user-123',
        username: 'test-user',
        type: 'api-key',
        role: 'admin',
        permissions: ['read', 'write'],
        iat: payloadWithExtra.iat,
      });
    });

    it('should handle payload with minimal required fields', () => {
      const minimalPayload: JwtPayload = {
        sub: 'user-123',
        username: 'test-user',
      };

      const result = strategy.validate(minimalPayload);

      expect(result).toEqual({
        userId: 'user-123',
        sub: 'user-123',
        username: 'test-user',
      });
    });
  });
});
