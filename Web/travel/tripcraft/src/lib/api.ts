import { Route, Spot, RouteGenerationRequest } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class TripCraftAPI {
  private async fetchWithError(url: string, options?: RequestInit) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  // Routes API
  async getRoutes(userId?: string, location?: string, isPublic?: boolean) {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (location) params.append('location', location);
    if (isPublic !== undefined) params.append('is_public', String(isPublic));

    const response = await this.fetchWithError(`/api/routes?${params}`);
    return response.routes as Route[];
  }

  async getRoute(id: string) {
    const response = await this.fetchWithError(`/api/routes/${id}`);
    return response.route as Route;
  }

  async createRoute(route: Omit<Route, 'id' | 'created_at' | 'updated_at'>) {
    const response = await this.fetchWithError('/api/routes', {
      method: 'POST',
      body: JSON.stringify(route),
    });
    return response.route as Route;
  }

  async updateRoute(id: string, updates: Partial<Route>) {
    const response = await this.fetchWithError(`/api/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.route as Route;
  }

  async deleteRoute(id: string) {
    await this.fetchWithError(`/api/routes/${id}`, {
      method: 'DELETE',
    });
  }

  // Spots API
  async getSpots(location?: string, category?: string, search?: string) {
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const response = await this.fetchWithError(`/api/spots?${params}`);
    return response.spots as Spot[];
  }

  async createSpot(spot: Omit<Spot, 'id' | 'created_at' | 'updated_at'>) {
    const response = await this.fetchWithError('/api/spots', {
      method: 'POST',
      body: JSON.stringify(spot),
    });
    return response.spot as Spot;
  }

  // Share API
  async getSharedRoute(shareToken: string) {
    const response = await this.fetchWithError(`/api/share/${shareToken}`);
    return response.route as Route;
  }

  async createShareToken(routeId: string) {
    const response = await this.fetchWithError(`/api/routes/${routeId}/share`, {
      method: 'POST',
    });
    return response.share_token as string;
  }
}

export const api = new TripCraftAPI();