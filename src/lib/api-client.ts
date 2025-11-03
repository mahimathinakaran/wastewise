// API Client for FastAPI Backend Integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          detail: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(error.detail || 'An error occurred');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(name: string, email: string, password: string, role: 'user' | 'admin') {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  async login(email: string, password: string, role: 'user' | 'admin') {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  }

  // Report endpoints
  async createReport(
    token: string,
    formData: FormData
  ) {
    const url = `${this.baseUrl}/reports/create`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: `HTTP error! status: ${response.status}`,
      }));
      throw new Error(error.detail || 'Failed to create report');
    }

    return await response.json();
  }

  async getUserReports(token: string, userId: string) {
    return this.request<any[]>(`/reports/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getAllReports(token: string) {
    return this.request<any[]>('/reports/all', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateReport(
    token: string,
    reportId: string,
    status: string,
    adminComment?: string
  ) {
    return this.request<any>(`/reports/update/${reportId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        admin_comment: adminComment,
      }),
    });
  }

  async getReportStats(token: string) {
    return this.request<{
      pending: number;
      in_progress: number;
      completed: number;
      total: number;
    }>('/reports/stats', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
