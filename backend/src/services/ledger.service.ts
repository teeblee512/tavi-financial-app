import { memoryStore, saveStoreToDisk, findUserByIdentifier } from './db.service.js';

export interface TransferInput {
  userId: string;
  recipientIdentifier: string;
  recipientName?: string;
  recipientBank?: string;
  amountMinor: number;
  currency?: string;
  narration?: string;
  idempotencyKey?: string;
}

// In-process async mutex to serialize balance modifications and prevent concurrent race conditions
class AsyncMutex {
  private queue: Promise<void> = Promise.resolve();

  async runExclusive<T>(fn: () => Promise<T> | T): Promise<T> {
    let release: () => void;
    const waitPromise = new Promise<void>((resolve) => {
      release = resolve;
    });

    const previousQueue = this.queue;
    this.queue = (async () => {
      await previousQueue;
      await waitPromise;
    })();

    await previousQueue;
    try {
      return await fn();
    } finally {
      release!();
    }
  }
}

const ledgerMutex = new AsyncMutex();

export class LedgerService {
  /**
   * Retrieves authoritative wallet balance in minor currency units (e.g. kobo)
   */
  static getWalletBalance(userId: string, currency: string = 'NGN'): { balanceMinor: number; pendingMinor: number; currency: string; label: string } {
    const key = `${userId}_${currency.toUpperCase()}`;
    const wallet = memoryStore.wallets.get(key);
    if (!wallet) {
      return { balanceMinor: 0, pendingMinor: 0, currency, label: 'Demo Funds (Simulated)' };
    }
    return {
      balanceMinor: wallet.balanceMinor,
      pendingMinor: wallet.pendingMinor,
      currency,
      label: wallet.label || 'Demo Funds (Simulated)',
    };
  }

  /**
   * Executes an atomic transfer with double-entry debits and credits,
   * full idempotency validation, self-transfer prevention, and concurrency lock.
   */
  static async executeTransfer(input: TransferInput) {
    return ledgerMutex.runExclusive(async () => {
      const currency = (input.currency || 'NGN').toUpperCase();

      // 1. Idempotency Check
      if (input.idempotencyKey) {
        const cached = memoryStore.idempotencyKeys.get(input.idempotencyKey);
        if (cached) {
          console.log(`[Ledger] Idempotent request detected for key: ${input.idempotencyKey}. Returning cached response.`);
          return cached;
        }
      }

      // 2. Validate Amount
      if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0) {
        const err: any = new Error('Transfer amount must be a positive integer in minor units (kobo).');
        err.statusCode = 400;
        err.code = 'INVALID_AMOUNT';
        throw err;
      }

      const MAX_TRANSFER_LIMIT_MINOR = 100_000_000; // ₦1,000,000.00
      if (input.amountMinor > MAX_TRANSFER_LIMIT_MINOR) {
        const err: any = new Error('Transfer amount exceeds single demo transaction limit of ₦1,000,000.');
        err.statusCode = 400;
        err.code = 'LIMIT_EXCEEDED';
        throw err;
      }

      // 3. Sender Verification
      const sender = memoryStore.users.get(input.userId);
      const senderProfile = memoryStore.profiles.get(input.userId);
      const senderWalletKey = `${input.userId}_${currency}`;
      const senderWallet = memoryStore.wallets.get(senderWalletKey);

      if (!sender || !senderWallet) {
        const err: any = new Error(`Active ${currency} wallet not found for sender.`);
        err.statusCode = 404;
        err.code = 'WALLET_NOT_FOUND';
        throw err;
      }

      // 4. Recipient Resolution & Validation
      const recipientMatch = findUserByIdentifier(input.recipientIdentifier);

      if (!recipientMatch) {
        const err: any = new Error(`Recipient identifier '${input.recipientIdentifier}' not found in registered TAVI demo users.`);
        err.statusCode = 404;
        err.code = 'RECIPIENT_NOT_FOUND';
        throw err;
      }

      const { user: recipientUser, profile: recipientProfile, wallet: recipientWallet } = recipientMatch;

      // 5. Prevent Self-Transfer
      if (recipientUser.id === sender.id) {
        const err: any = new Error('Self-transfer is disallowed. Please select an eligible external demo recipient.');
        err.statusCode = 400;
        err.code = 'SELF_TRANSFER_DISALLOWED';
        throw err;
      }

      if (!recipientWallet) {
        const err: any = new Error(`Recipient ${recipientProfile.displayName} does not have an active ${currency} wallet.`);
        err.statusCode = 400;
        err.code = 'RECIPIENT_WALLET_INACTIVE';
        throw err;
      }

      // 6. Balance & Overspending Validation
      const feeMinor = 1000; // ₦10.00 standard demo NIP fee
      const totalDebitMinor = input.amountMinor + feeMinor;

      if (senderWallet.balanceMinor < totalDebitMinor) {
        const err: any = new Error(`Insufficient funds. Required: ₦${(totalDebitMinor / 100).toFixed(2)}, Available: ₦${(senderWallet.balanceMinor / 100).toFixed(2)}.`);
        err.statusCode = 400;
        err.code = 'INSUFFICIENT_FUNDS';
        throw err;
      }

      // 7. Atomic Balance Mutation (ACID consistency)
      const senderPrevBalance = senderWallet.balanceMinor;
      const recipientPrevBalance = recipientWallet.balanceMinor;

      try {
        senderWallet.balanceMinor -= totalDebitMinor;
        recipientWallet.balanceMinor += input.amountMinor;

        // Shared unique reference linking both entries in audit log
        const uniqueRef = `TAVI-TRF-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const timestamp = new Date();
        const narration = (input.narration || 'Demo funds transfer').trim();

        // 8. Auditable Debit Record for Sender
        const senderTx = {
          id: `tx-dr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          reference: uniqueRef,
          userId: sender.id,
          type: 'TRANSFER',
          direction: 'DEBIT',
          amountMinor: input.amountMinor,
          feeMinor,
          currency,
          status: 'SUCCESSFUL',
          counterpartyName: recipientProfile.displayName,
          counterpartyAccount: recipientWallet.providerAccountNumber,
          counterpartyBank: recipientWallet.providerName,
          counterpartyTag: recipientUser.demoTag || recipientProfile.demoTag,
          narration,
          isDemo: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        // 9. Auditable Credit Record for Recipient
        const recipientTx = {
          id: `tx-cr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          reference: uniqueRef,
          userId: recipientUser.id,
          type: 'DEPOSIT',
          direction: 'CREDIT',
          amountMinor: input.amountMinor,
          feeMinor: 0,
          currency,
          status: 'SUCCESSFUL',
          counterpartyName: senderProfile?.displayName || 'TAVI User',
          counterpartyAccount: senderWallet.providerAccountNumber,
          counterpartyBank: senderWallet.providerName,
          counterpartyTag: sender.demoTag || senderProfile?.demoTag,
          narration,
          isDemo: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        memoryStore.transactions.unshift(senderTx);
        memoryStore.transactions.unshift(recipientTx);

        // 10. Audit Log & Real-time Notifications
        memoryStore.notifications.unshift({
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          userId: recipientUser.id,
          category: 'TRANSACTIONS',
          title: 'Demo Funds Received',
          message: `₦${(input.amountMinor / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })} received from ${senderProfile?.displayName || 'TAVI User'} (${uniqueRef})`,
          isRead: false,
          createdAt: timestamp,
        });

        const result = {
          success: true,
          reference: uniqueRef,
          transaction: senderTx,
          recipientTransaction: recipientTx,
          newBalanceMinor: senderWallet.balanceMinor,
          recipientNewBalanceMinor: recipientWallet.balanceMinor,
          message: `Successfully transferred ₦${(input.amountMinor / 100).toFixed(2)} demo funds to ${recipientProfile.displayName}.`,
        };

        // Cache result if idempotency key was supplied
        if (input.idempotencyKey) {
          memoryStore.idempotencyKeys.set(input.idempotencyKey, result);
        }

        saveStoreToDisk();
        return result;
      } catch (rollbackErr: any) {
        // Rollback on any failure to guarantee no partial debit/credit
        senderWallet.balanceMinor = senderPrevBalance;
        recipientWallet.balanceMinor = recipientPrevBalance;
        throw rollbackErr;
      }
    });
  }

  /**
   * Top up wallet (Card / Bank funding simulation)
   */
  static fundWallet(userId: string, amountMinor: number, currency: string = 'NGN', method: string = 'Debit Card') {
    const cur = currency.toUpperCase();
    const walletKey = `${userId}_${cur}`;
    const wallet = memoryStore.wallets.get(walletKey);

    if (!wallet) {
      throw new Error(`Wallet for currency ${cur} not found.`);
    }

    if (amountMinor <= 0) {
      throw new Error('Top up amount must be positive.');
    }

    wallet.balanceMinor += amountMinor;

    const transaction = {
      id: `tx-fund-${Date.now()}`,
      reference: `DEP${Date.now().toString().slice(-8)}`,
      userId,
      type: 'CARD_FUNDING',
      direction: 'CREDIT',
      amountMinor,
      feeMinor: 0,
      currency: cur,
      status: 'SUCCESSFUL',
      counterpartyName: method,
      counterpartyAccount: '•••• 4021',
      counterpartyBank: 'Card Funding (Demo)',
      narration: `Simulated top-up via ${method}`,
      isDemo: true,
      createdAt: new Date(),
    };

    memoryStore.transactions.unshift(transaction);
    saveStoreToDisk();

    return {
      success: true,
      transaction,
      newBalanceMinor: wallet.balanceMinor,
    };
  }
}
