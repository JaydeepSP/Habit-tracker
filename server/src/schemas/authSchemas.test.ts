import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from './authSchemas.js';

describe('Auth Validation Schemas', () => {
  it('should validate correct registration payload', () => {
    const valid = {
      body: {
        name: 'Jaydeep',
        email: 'jaydeep@example.com',
        password: 'SecurePassword123',
      },
    };

    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email format', () => {
    const invalid = {
      body: {
        name: 'Jaydeep',
        email: 'not-an-email',
        password: 'SecurePassword123',
      },
    };

    const result = registerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject short password on registration', () => {
    const invalid = {
      body: {
        name: 'Jaydeep',
        email: 'jaydeep@example.com',
        password: '123',
      },
    };

    const result = registerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should validate login payload correctly', () => {
    const valid = {
      body: {
        email: 'user@example.com',
        password: 'Password123!',
      },
    };

    const result = loginSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
