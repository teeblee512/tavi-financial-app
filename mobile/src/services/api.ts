const API_BASE_URL = 'https://tavi-backend-api.onrender.com/api/v1';

export class MobileApiClient {
  private static token: string | null = null;

  static setToken(token: string | null) {
    this.token = token;
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

  static async getWallets() {
    return this.request('/wallets');
  }

  static async getTransactions(params: any = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/transactions?${q}`);
  }

  static async transfer(data: any) {
    return this.request('/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getStocks() {
    return this.request('/invest/stocks');
  }

  static async getIndices() {
    return this.request('/invest/indices');
  }
}
