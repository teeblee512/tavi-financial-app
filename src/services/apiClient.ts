/**
 * TAVI API Client Service
 * Connects the web frontend to the authoritative TAVI Backend API
 * Supports seamless fallback to in-memory demo fixtures when offline.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://tavi-backend-api.onrender.com/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load persisted token if available in sessionStorage
    if (typeof window !== 'undefined') {
      this.token = sessionStorage.getItem('tavi_auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        sessionStorage.setItem('tavi_auth_token', token);
      } else {
        sessionStorage.removeItem('tavi_auth_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      return data;
    } catch (err: any) {
      console.warn(`[TAVI API Client] Network request to ${endpoint} failed:`, err.message);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Could not connect to TAVI Backend API. Operating in local demo mode.',
        },
      };
    }
  }

  // Health Check
  async checkHealth() {
    return this.request('/health');
  }

  // Authentication
  async login(phoneOrEmail: string, passwordOrPin: string) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneOrEmail, passwordOrPin }),
    });
    if (res.success && res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async register(data: { phone: string; email?: string; password: string; firstName: string; lastName: string }) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.success && res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async verifyPin(pin: string, type: 'transaction' | 'invest' = 'transaction') {
    return this.request('/auth/pin/verify', {
      method: 'POST',
      body: JSON.stringify({ pin, type }),
    });
  }

  // Wallets
  async getWallets() {
    return this.request('/wallets');
  }

  async topUpWallet(amountMinor: number, currency: string = 'NGN', method: string = 'Debit Card') {
    return this.request('/wallets/topup', {
      method: 'POST',
      body: JSON.stringify({ amountMinor, currency, method }),
    });
  }

  // Transactions & Transfers
  async getTransactions(params?: { counterparty?: string; type?: string; status?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/transactions?${query}`);
  }

  async getPeerSummary(counterparty: string) {
    return this.request(`/transactions/peer-summary?counterparty=${encodeURIComponent(counterparty)}`);
  }

  async transfer(data: {
    recipientIdentifier: string;
    recipientName: string;
    recipientBank?: string;
    amountMinor: number;
    currency?: string;
    narration?: string;
    pin: string;
  }) {
    return this.request('/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Investments
  async getStocks() {
    return this.request('/invest/stocks');
  }

  async getIndices() {
    return this.request('/invest/indices');
  }

  async placeOrder(order: { symbol: string; side: 'BUY' | 'SELL'; quantity: number; priceMinor: number; investPin: string }) {
    return this.request('/invest/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  // FX
  async getFxRates() {
    return this.request('/fx/rates');
  }

  async convertFx(sourceCurrency: string, targetCurrency: string, sourceAmount: number) {
    return this.request('/fx/convert', {
      method: 'POST',
      body: JSON.stringify({ sourceCurrency, targetCurrency, sourceAmount }),
    });
  }

  // Support
  async getSupportCases() {
    return this.request('/support/cases');
  }

  async createSupportCase(data: { category: string; subject: string; description: string; relatedTxId?: string }) {
    return this.request('/support/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications');
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'POST' });
  }
}

export const apiClient = new ApiClient();
