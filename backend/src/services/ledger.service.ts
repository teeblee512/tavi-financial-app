import { memoryStore } from './db.service.js';

export interface TransferInput {
  userId: string;
  recipientIdentifier: string;
  recipientName: string;
  recipientBank?: string;
  amountMinor: number;
  currency?: string;
  narration?: string;
  idempotencyKey?: string;
}

export class LedgerService {
  /**
   * Retrieves authoritative wallet balance in minor currency units (e.g. kobo)
   */
  static getWalletBalance(userId: string, currency: string = 'NGN'): { balanceMinor: number; pendingMinor: number; currency: string } {
    const key = `${userId}_${currency}`;
    const wallet = memoryStore.wallets.get(key);
    if (!wallet) {
      return { balanceMinor: 0, pendingMinor: 0, currency };
    }
    return {
      balanceMinor: wallet.balanceMinor,
      pendingMinor: wallet.pendingMinor,
      currency,
    };
  }

  /**
   * Executes an atomic transfer with double-entry debits and credits
   */
  static executeTransfer(input: TransferInput) {
    const currency = input.currency || 'NGN';
    const walletKey = `${input.userId}_${currency}`;
    const wallet = memoryStore.wallets.get(walletKey);

    if (!wallet) {
      throw new Error(`Wallet for currency ${currency} not found.`);
    }

    const feeMinor = 1000; // ₦10.00 minor fee
    const totalDebitMinor = input.amountMinor + feeMinor;

    if (wallet.balanceMinor < totalDebitMinor) {
      const err: any = new Error('Insufficient funds to complete this transfer.');
      err.statusCode = 400;
      err.code = 'INSUFFICIENT_FUNDS';
      throw err;
    }

    // Deduct sender balance
    wallet.balanceMinor -= totalDebitMinor;

    // Create unique reference
    const ref = `TAVI${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`;

    const transaction = {
      id: `tx-${Date.now()}`,
      reference: ref,
      userId: input.userId,
      type: 'TRANSFER',
      direction: 'DEBIT',
      amountMinor: input.amountMinor,
      feeMinor,
      currency,
      status: 'SUCCESSFUL',
      counterpartyName: input.recipientName,
      counterpartyAccount: input.recipientIdentifier,
      counterpartyBank: input.recipientBank || 'Commercial Bank',
      narration: input.narration || 'Funds transfer',
      createdAt: new Date(),
    };

    memoryStore.transactions.unshift(transaction);

    // If recipient is also a registered TAVI user, credit them
    for (const [_, otherUser] of memoryStore.users) {
      if (otherUser.phone === input.recipientIdentifier || otherUser.email === input.recipientIdentifier) {
        const recipientWallet = memoryStore.wallets.get(`${otherUser.id}_${currency}`);
        if (recipientWallet) {
          recipientWallet.balanceMinor += input.amountMinor;
          memoryStore.transactions.unshift({
            id: `tx-recv-${Date.now()}`,
            reference: `REC${Date.now().toString().slice(-8)}`,
            userId: otherUser.id,
            type: 'DEPOSIT',
            direction: 'CREDIT',
            amountMinor: input.amountMinor,
            feeMinor: 0,
            currency,
            status: 'SUCCESSFUL',
            counterpartyName: 'Amara Okonkwo',
            counterpartyAccount: wallet.providerAccountNumber,
            counterpartyBank: wallet.providerName,
            narration: input.narration || 'Funds received',
            createdAt: new Date(),
          });
        }
        break;
      }
    }

    return {
      success: true,
      transaction,
      newBalanceMinor: wallet.balanceMinor,
    };
  }

  /**
   * Top up wallet (Card / Bank funding simulation)
   */
  static fundWallet(userId: string, amountMinor: number, currency: string = 'NGN', method: string = 'Debit Card') {
    const walletKey = `${userId}_${currency}`;
    const wallet = memoryStore.wallets.get(walletKey);

    if (!wallet) {
      throw new Error(`Wallet for currency ${currency} not found.`);
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
      currency,
      status: 'SUCCESSFUL',
      counterpartyName: method,
      counterpartyAccount: '•••• 4021',
      counterpartyBank: 'Card Funding',
      narration: `Simulated top-up via ${method}`,
      createdAt: new Date(),
    };

    memoryStore.transactions.unshift(transaction);

    return {
      success: true,
      transaction,
      newBalanceMinor: wallet.balanceMinor,
    };
  }
}
