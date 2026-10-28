const API_BASE_URL = 'https://tavi-backend-api.onrender.com/api/v1';

export class MobileApiClient {
  private static token: string | null = null;

  static setToken(token: string | null) {
    this.token = token;
  }

  static getToken(): string | null {
    return this.token;
  }

  static async request(endpoint: string, options: any = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      return await response.json();
    } catch (err: any) {
      console.warn(`[Mobile API] Request to ${endpoint} failed:`, err.message);
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: 'Unable to reach backend. Using demo mode.' },
      };
    }
  }

  static async getHealth() {
    return this.request('/health');
  }

  static async login(phoneOrEmail: string, passwordOrPin: string) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneOrEmail, passwordOrPin }),
    });
    if (res.success && res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  static async register(data: { phone: string; email?: string; password?: string; firstName: string; lastName: string; demoTag?: string }) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.success && res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  static async getMe() {
    return this.request('/auth/me');
  }

  static async getWallets() {
    return this.request('/wallets');
  }

  static async getWalletBalance(currency: string = 'NGN') {
    return this.request(`/wallets/${currency.toUpperCase()}/balance`);
  }

  static async getTransactions(params: any = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/transactions?${q}`);
  }

  static async getDemoDirectory() {
    return this.request('/recipients/demo-directory');
  }

  static async lookupRecipient(query: string) {
    return this.request(`/recipients/lookup?query=${encodeURIComponent(query)}`);
  }

  static async transfer(data: any) {
    const key = data.idempotencyKey || `idem-mob-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
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

  static async resetDemoBalance() {
    return this.request('/sandbox/user/reset', { method: 'POST' });
  }

  static async getStocks() {
    return this.request('/invest/stocks');
  }

  static async getIndices() {
    return this.request('/invest/indices');
  }
}
