import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateApiKey', () => {
    it('should generate API key with default payload', () => {
      const mockToken = 'mock-jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service.generateApiKey();

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'api-user',
        username: 'api-user',
        type: 'api-key',
        iat: expect.any(Number),
      });
      expect(result).toBe(mockToken);
    });

    it('should generate API key with custom payload', () => {
      const mockToken = 'mock-jwt-token';
      const customPayload = {
        username: 'test-user',
        userId: 'user-123',
      };
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service.generateApiKey(customPayload);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-123',
        username: 'test-user',
        type: 'api-key',
        iat: expect.any(Number),
      });
      expect(result).toBe(mockToken);
    });

    it('should generate API key with partial payload', () => {
      const mockToken = 'mock-jwt-token';
      const partialPayload = {
        username: 'partial-user',
      };
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service.generateApiKey(partialPayload);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'api-user',
        username: 'partial-user',
        type: 'api-key',
        iat: expect.any(Number),
      });
      expect(result).toBe(mockToken);
    });

    it('should include current timestamp in iat field', () => {
      const mockToken = 'mock-jwt-token';
      const beforeCall = Math.floor(Date.now() / 1000);
      mockJwtService.sign.mockReturnValue(mockToken);

      service.generateApiKey();

      const afterCall = Math.floor(Date.now() / 1000);
      const callArgs = mockJwtService.sign.mock.calls[0][0];

      expect(callArgs.iat).toBeGreaterThanOrEqual(beforeCall);
      expect(callArgs.iat).toBeLessThanOrEqual(afterCall);
    });
  });

  describe('validateApiKey', () => {
    it('should return payload when token is valid', () => {
      const mockPayload = {
        sub: 'user-123',
        username: 'test-user',
        type: 'api-key',
        iat: Math.floor(Date.now() / 1000),
      };
      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = service.validateApiKey('valid-token');

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual(mockPayload);
    });

    it('should return null when token is invalid', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = service.validateApiKey('invalid-token');

      expect(mockJwtService.verify).toHaveBeenCalledWith('invalid-token');
      expect(result).toBeNull();
    });

    it('should return null when token verification throws any error', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      const result = service.validateApiKey('expired-token');

      expect(result).toBeNull();
    });

    it('should handle JWT verification errors gracefully', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Malformed token');
      });

      const result = service.validateApiKey('malformed-token');

      expect(result).toBeNull();
    });
  });
});
