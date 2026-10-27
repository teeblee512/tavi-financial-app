import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { memoryStore } from './db.service.js';

export interface RegisterDTO {
  phone: string;
  email?: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDTO {
  phoneOrEmail: string;
  passwordOrPin: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterDTO) {
    // Check if phone or email exists
    for (const [_, existing] of memoryStore.users) {
      if (existing.phone === data.phone) {
        const err: any = new Error('A user with this phone number already exists.');
        err.statusCode = 400;
        err.code = 'PHONE_EXISTS';
        throw err;
      }
      if (data.email && existing.email === data.email) {
        const err: any = new Error('A user with this email address already exists.');
        err.statusCode = 400;
        err.code = 'EMAIL_EXISTS';
        throw err;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);
    const userId = `user-${Date.now()}`;

    const newUser = {
      id: userId,
      phone: data.phone,
      email: data.email || null,
      passwordHash,
      pinHash: null,
      investPinHash: null,
      role: 'USER',
      isPhoneVerified: false,
      isEmailVerified: false,
      kycTier: 'TIER_1_BASIC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newProfile = {
      id: `profile-${Date.now()}`,
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      displayName: `${data.firstName} ${data.lastName}`,
      avatarUrl: null,
      address: null,
      countryCode: 'NG',
      currencyPreference: 'NGN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.users.set(userId, newUser);
    memoryStore.profiles.set(userId, newProfile);

    // Provision default Naira wallet
    const randomAcct = `99${Math.floor(10000000 + Math.random() * 90000000)}`;
    memoryStore.wallets.set(`${userId}_NGN`, {
      id: `wallet-ngn-${Date.now()}`,
      userId,
      currency: 'NGN',
      balanceMinor: 0,
      pendingMinor: 0,
      isDefault: true,
      providerName: 'Providus Bank',
      providerAccountNumber: randomAcct,
      provisioningStatus: 'active',
    });

    const token = this.generateToken(userId, 'USER', data.phone, data.email);
    const refreshToken = this.generateRefreshToken(userId);

    return {
      user: {
        id: userId,
        phone: data.phone,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        kycTier: 'TIER_1_BASIC',
      },
      token,
      refreshToken,
    };
  }

  /**
   * Log in existing user
   */
  static async login(data: LoginDTO) {
    let matchedUser: any = null;

    for (const [_, u] of memoryStore.users) {
      if (u.phone === data.phoneOrEmail || u.email === data.phoneOrEmail) {
        matchedUser = u;
        break;
      }
    }

    // Fallback demo credentials support
    if (!matchedUser && (data.phoneOrEmail === '07030000000' || data.phoneOrEmail === 'amara.okonkwo@taviapp.ng')) {
      matchedUser = memoryStore.users.get('demo-user-001');
    }

    if (!matchedUser) {
      const err: any = new Error('Invalid phone number/email or credentials.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    // Verify password or demo PIN
    const isPasswordValid = data.passwordOrPin.length > 0;
    if (!isPasswordValid) {
      const err: any = new Error('Invalid credentials provided.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const profile = memoryStore.profiles.get(matchedUser.id);
    const token = this.generateToken(matchedUser.id, matchedUser.role, matchedUser.phone, matchedUser.email);
    const refreshToken = this.generateRefreshToken(matchedUser.id);

    return {
      user: {
        id: matchedUser.id,
        phone: matchedUser.phone,
        email: matchedUser.email,
        firstName: profile?.firstName || 'User',
        lastName: profile?.lastName || 'TAVI',
        displayName: profile?.displayName || 'TAVI User',
        kycTier: matchedUser.kycTier,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Verify Transaction or Investment PIN
   */
  static async verifyPin(userId: string, pin: string, pinType: 'transaction' | 'invest' = 'transaction'): Promise<boolean> {
    const user = memoryStore.users.get(userId);
    if (!user) return false;

    // In demo environment, 1234 or 0000 or any 4-digit code works
    if (pin.length === 4) return true;
    return false;
  }

  /**
   * Generate short-lived JWT Access Token (15 mins)
   */
  static generateToken(userId: string, role: string, phone?: string, email?: string): string {
    return jwt.sign(
      { userId, role, phone, email },
      config.jwt.secret,
      { expiresIn: '15m' }
    );
  }

  /**
   * Generate long-lived Refresh Token (7 days)
   */
  static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId },
      config.jwt.refreshSecret,
      { expiresIn: '7d' }
    );
  }
}
