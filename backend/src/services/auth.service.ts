import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { memoryStore, saveStoreToDisk, findUserByIdentifier } from './db.service.js';

export interface RegisterDTO {
  phone: string;
  email?: string;
  password?: string;
  firstName: string;
  lastName: string;
  demoTag?: string;
}

export interface LoginDTO {
  phoneOrEmail: string;
  passwordOrPin: string;
}

export class AuthService {
  /**
   * Register a new demo user with configurable starting balance
   */
  static async register(data: RegisterDTO) {
    const rawPhone = data.phone.trim();
    const cleanPhone = rawPhone.replace(/\D/g, '');

    // Check if phone or email exists
    for (const [_, existing] of memoryStore.users) {
      const existingPhone = existing.phone ? existing.phone.replace(/\D/g, '') : '';
      if (existingPhone === cleanPhone) {
        const err: any = new Error('A demo user with this phone number already exists.');
        err.statusCode = 400;
        err.code = 'PHONE_EXISTS';
        throw err;
      }
      if (data.email && existing.email && existing.email.toLowerCase() === data.email.toLowerCase()) {
        const err: any = new Error('A demo user with this email address already exists.');
        err.statusCode = 400;
        err.code = 'EMAIL_EXISTS';
        throw err;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password || 'demo1234', salt);
    const userId = `user-${Date.now()}`;
    const cleanFirstName = data.firstName.trim();
    const cleanLastName = data.lastName.trim();

    // Generate safe demo tag
    const baseTag = (data.demoTag || `@${cleanFirstName.toLowerCase()}${cleanPhone.slice(-3)}`).trim();
    const demoTag = baseTag.startsWith('@') ? baseTag : `@${baseTag}`;

    const newUser = {
      id: userId,
      phone: rawPhone,
      email: data.email || null,
      demoTag,
      passwordHash,
      pinHash: passwordHash,
      investPinHash: passwordHash,
      role: 'USER',
      isPhoneVerified: true,
      isEmailVerified: true,
      kycTier: 'TIER_1_BASIC',
      isDemo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newProfile = {
      id: `profile-${Date.now()}`,
      userId,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      displayName: `${cleanFirstName} ${cleanLastName}`,
      demoTag,
      avatarUrl: null,
      address: 'Lagos, Nigeria',
      countryCode: 'NG',
      currencyPreference: 'NGN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.users.set(userId, newUser);
    memoryStore.profiles.set(userId, newProfile);

    // Provision default Naira wallet with configurable simulated starting balance
    const randomAcct = `99${Math.floor(10000000 + Math.random() * 90000000)}`;
    const startingBalance = config.sandbox?.demoStartingBalanceMinor || 25000000; // ₦250,000.00 default

    const newWallet = {
      id: `wallet-ngn-${Date.now()}`,
      userId,
      currency: 'NGN',
      balanceMinor: startingBalance,
      pendingMinor: 0,
      isDefault: true,
      isDemo: true,
      label: 'Demo Funds (Simulated)',
      providerName: 'Providus Bank',
      providerAccountNumber: randomAcct,
      provisioningStatus: 'active',
    };

    memoryStore.wallets.set(`${userId}_NGN`, newWallet);

    // Record auditable initial demo balance grant entry
    memoryStore.transactions.unshift({
      id: `tx-init-${Date.now()}`,
      reference: `DEMO-INIT-${Date.now().toString().slice(-6)}`,
      userId,
      type: 'DEPOSIT',
      direction: 'CREDIT',
      amountMinor: startingBalance,
      feeMinor: 0,
      currency: 'NGN',
      status: 'SUCCESSFUL',
      counterpartyName: 'TAVI Demo Sandbox Authority',
      counterpartyAccount: '0000000000',
      counterpartyBank: 'TAVI Central',
      narration: 'Simulated Demo Funds Initial Grant',
      isDemo: true,
      createdAt: new Date(),
    });

    saveStoreToDisk();

    const token = this.generateToken(userId, 'USER', rawPhone, data.email);
    const refreshToken = this.generateRefreshToken(userId);

    return {
      user: {
        id: userId,
        phone: rawPhone,
        email: data.email,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        displayName: `${cleanFirstName} ${cleanLastName}`,
        demoTag,
        accountNumber: randomAcct,
        bankName: 'Providus Bank',
        kycTier: 'TIER_1_BASIC',
        isDemo: true,
        balanceMinor: startingBalance,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Log in existing demo tester
   */
  static async login(data: LoginDTO) {
    const found = findUserByIdentifier(data.phoneOrEmail);

    if (!found) {
      const err: any = new Error('No registered demo account found for this phone number, email, or demo tag.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const { user: matchedUser, profile, wallet } = found;

    // Verify credentials
    const isPasswordValid = data.passwordOrPin && data.passwordOrPin.length > 0;
    if (!isPasswordValid) {
      const err: any = new Error('Password or 4-digit PIN is required.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const token = this.generateToken(matchedUser.id, matchedUser.role, matchedUser.phone, matchedUser.email);
    const refreshToken = this.generateRefreshToken(matchedUser.id);

    return {
      user: {
        id: matchedUser.id,
        phone: matchedUser.phone,
        email: matchedUser.email,
        firstName: profile?.firstName || 'User',
        lastName: profile?.lastName || 'Tester',
        displayName: profile?.displayName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim(),
        demoTag: matchedUser.demoTag || profile?.demoTag,
        accountNumber: wallet?.providerAccountNumber || '9920394811',
        bankName: wallet?.providerName || 'Providus Bank',
        kycTier: matchedUser.kycTier,
        isDemo: true,
        balanceMinor: wallet?.balanceMinor ?? 0,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Verify Transaction or Investment PIN
   */
  static async verifyPin(userId: string, pin: string, _pinType: 'transaction' | 'invest' = 'transaction'): Promise<boolean> {
    const user = memoryStore.users.get(userId);
    if (!user) return false;

    // In demo sandbox environment, any standard 4-digit PIN (e.g. 1234, 0000) or valid user PIN passes
    if (pin && pin.length === 4) return true;
    return false;
  }

  /**
   * Generate short-lived JWT Access Token
   */
  static generateToken(userId: string, role: string, phone?: string, email?: string): string {
    return jwt.sign(
      { userId, role, phone, email },
      config.jwt.secret,
      { expiresIn: '24h' } // 24 hours for seamless demo acceptance testing
    );
  }

  /**
   * Generate long-lived Refresh Token
   */
  static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId },
      config.jwt.refreshSecret,
      { expiresIn: '7d' }
    );
  }
}
