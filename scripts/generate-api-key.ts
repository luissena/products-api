import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import * as path from 'path';

dotenv.config();

interface JWTPayload {
  sub: string;
  username: string;
  type: string;
  iat: number;
}

function getJWTSecret(): string {
  const existingSecret = process.env.JWT_SECRET;
  if (existingSecret) {
    console.log('📋 Using existing JWT_SECRET from .env file');
    return existingSecret;
  }

  console.log('🔑 Generating new JWT_SECRET...');
  return crypto.randomBytes(64).toString('hex');
}

function getJWTExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || '1y';
}

function generateApiKey(secret: string, expiresIn: string): string {
  const payload: JWTPayload = {
    sub: 'api-user',
    username: 'api-user',
    type: 'api-key',
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, secret, { expiresIn });
}

function main(): void {
  console.log('🔑 Generating JWT API key...\n');

  const jwtSecret = getJWTSecret();
  const jwtExpiresIn = getJWTExpiresIn();

  const apiKey = generateApiKey(jwtSecret, jwtExpiresIn);

  console.log('📋 Configuration used:');
  console.log('=====================================');
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log(`JWT_EXPIRES_IN=${jwtExpiresIn}`);
  console.log('=====================================\n');

  console.log('🔐 Generated API key:');
  console.log('=====================================');
  console.log(apiKey);
  console.log('=====================================\n');

  console.log('📝 Instructions:');
  console.log('1. Use the API key in Authorization header: Bearer <api-key>');
  console.log('2. Usage example:');
  console.log(
    `   curl -H "Authorization: Bearer ${apiKey}" http://localhost:3000/reports/products\n`,
  );

  const outputFile = path.join(__dirname, '..', 'generated-api-key.txt');
  const content = `JWT_SECRET=${jwtSecret}\nJWT_EXPIRES_IN=${jwtExpiresIn}\n\nAPI_KEY=${apiKey}\n\nGenerated at: ${new Date().toISOString()}`;

  fs.writeFileSync(outputFile, content);
  console.log(`💾 Key saved to: ${outputFile}`);

  if (!process.env.JWT_SECRET) {
    console.log('\n⚠️  WARNING: JWT_SECRET not found in .env file');
    console.log('   Add the following line to your .env file:');
    console.log(`   JWT_SECRET=${jwtSecret}`);
  }
}

main();
