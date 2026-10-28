/**
 * TAVI API Client Service
 * Connects the web frontend to the authoritative TAVI Backend API Sandbox.
 * Supports multi-user testing, ACID transfers, safe recipient lookup, and demo balance resets.
 */

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const envUrl = (import.meta as any).env?.VITE_API_URL;
    if (envUrl) return envUrl;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api/v1';
    }
  }
  return 'https://tavi-backend-api.onrender.com/api/v1';
}

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
  total?: number;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load persisted token from localStorage for browser restart / refresh persistence
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('tavi_auth_token') || sessionStorage.getItem('tavi_auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('tavi_auth_token', token);
        sessionStorage.setItem('tavi_auth_token', token);
      } else {
        localStorage.removeItem('tavi_auth_token');
        sessionStorage.removeItem('tavi_auth_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getBaseUrl(): string {
    return API_BASE_URL;
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

  async register(data: { phone: string; email?: string; password?: string; firstName: string; lastName: string; demoTag?: string }) {
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

  async getWalletBalance(currency: string = 'NGN') {
    return this.request(`/wallets/${currency.toUpperCase()}/balance`);
  }

  async topUpWallet(amountMinor: number, currency: string = 'NGN', method: string = 'Debit Card') {
    return this.request('/wallets/topup', {
      method: 'POST',
      body: JSON.stringify({ amountMinor, currency, method }),
    });
  }

  // Recipients Lookup & Directory
  async lookupRecipient(query: string) {
    return this.request(`/recipients/lookup?query=${encodeURIComponent(query)}`);
  }

  async getDemoDirectory() {
    return this.request('/recipients/demo-directory');
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
    recipientName?: string;
    recipientBank?: string;
    amountMinor: number;
    currency?: string;
    narration?: string;
    pin: string;
    idempotencyKey?: string;
  }) {
    const key = data.idempotencyKey || `idem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    return this.request('/transactions/transfer', {
      method: 'POST',
      headers: {
        'Idempotency-Key': key,
      },
      body: JSON.stringify({
        ...data,
        idempotencyKey: key,
      }),
    });
  }

  // Sandbox Controls
  async resetDemoBalance() {
    return this.request('/sandbox/user/reset', { method: 'POST' });
  }

  async resetAllSandbox() {
    return this.request('/sandbox/reset', { method: 'POST' });
  }

  async getSandboxInfo() {
    return this.request('/sandbox/info');
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
