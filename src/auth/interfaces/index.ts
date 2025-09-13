export interface JwtPayload {
  sub: string;
  username: string;
  [key: string]: unknown;
}
