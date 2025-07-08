export interface JwtPayload {
  sub: string;
  email: string;
  type: string; // 'access' or 'refresh'
  iat?: number; // Issued at
  exp?: number; // Expiration time
  roles?: string[]; // User roles for role-based access control
  [key: string]: any; // Allow for additional properties
}
