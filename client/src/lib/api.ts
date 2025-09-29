import { apiRequest } from './queryClient';

// Event types
export interface Event {
  id: string;
  title: string;
  date: string;
  description: string | null;
  externalLink: string | null;
  locationTagId: string | null;
}

export interface CreateEventRequest {
  title: string;
  date: string;
  description?: string;
  externalLink?: string;
  locationTagId?: string;
}

// Reference website types
export interface ReferenceWebsite {
  id: string;
  title: string;
  url: string;
}

export interface CreateReferenceWebsiteRequest {
  title: string;
  url: string;
}

// User interest types
export interface UserInterestsResponse {
  interests: string[];
}

export interface ToggleInterestResponse {
  eventId: string;
  isInterested: boolean;
}

// Location tag types
export interface LocationTag {
  id: string;
  name: string;
  color: string;
}

export interface CreateLocationTagRequest {
  name: string;
  color: string;
}

// Admin authentication types
export interface AdminLoginRequest {
  password: string;
}

export interface AdminStatusResponse {
  isAdmin: boolean;
}

export interface AdminResponse {
  success: boolean;
  message: string;
}

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

// Events API
export const eventsApi = {
  getAll: async (): Promise<Event[]> => {
    const response = await apiRequest('GET', '/api/events');
    return handleApiResponse<Event[]>(response);
  },
    
  getByDate: async (date: string): Promise<Event[]> => {
    const response = await apiRequest('GET', `/api/events/date/${date}`);
    return handleApiResponse<Event[]>(response);
  },
    
  create: async (event: CreateEventRequest): Promise<Event> => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${await response.text()}`);
    }
    
    return handleApiResponse<Event>(response);
  },
    
  update: async (id: string, event: Partial<CreateEventRequest>): Promise<Event> => {
    const response = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${await response.text()}`);
    }
    
    return handleApiResponse<Event>(response);
  },
    
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${await response.text()}`);
    }
  }
};

// Reference websites API
export const referenceWebsitesApi = {
  getAll: async (): Promise<ReferenceWebsite[]> => {
    const response = await apiRequest('GET', '/api/reference-websites');
    return handleApiResponse<ReferenceWebsite[]>(response);
  },
    
  create: async (website: CreateReferenceWebsiteRequest): Promise<ReferenceWebsite> => {
    const response = await fetch('/api/reference-websites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(website),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${await response.text()}`);
    }
    
    return handleApiResponse<ReferenceWebsite>(response);
  },
    
  update: async (id: string, website: Partial<CreateReferenceWebsiteRequest>): Promise<ReferenceWebsite> => {
    const response = await fetch(`/api/reference-websites/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(website),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${await response.text()}`);
    }
    
    return handleApiResponse<ReferenceWebsite>(response);
  },
    
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/reference-websites/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${await response.text()}`);
    }
  }
};

// User interests API
export const userInterestsApi = {
  get: async (): Promise<UserInterestsResponse> => {
    const response = await apiRequest('GET', '/api/user-interests');
    return handleApiResponse<UserInterestsResponse>(response);
  },
    
  toggle: async (eventId: string): Promise<ToggleInterestResponse> => {
    const response = await apiRequest('POST', '/api/user-interests/toggle', { eventId });
    return handleApiResponse<ToggleInterestResponse>(response);
  }
};

// Location tags API
export const locationTagsApi = {
  getAll: async (): Promise<LocationTag[]> => {
    const response = await apiRequest('GET', '/api/location-tags');
    return handleApiResponse<LocationTag[]>(response);
  },
  
  create: async (locationTag: CreateLocationTagRequest): Promise<LocationTag> => {
    const response = await fetch('/api/location-tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(locationTag),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${await response.text()}`);
    }
    
    return handleApiResponse<LocationTag>(response);
  },
  
  update: async (id: string, locationTag: Partial<CreateLocationTagRequest>): Promise<LocationTag> => {
    const response = await fetch(`/api/location-tags/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(locationTag),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${await response.text()}`);
    }
    
    return handleApiResponse<LocationTag>(response);
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/location-tags/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${await response.text()}`);
    }
  }
};

// Admin API
export const adminApi = {
  login: async (credentials: AdminLoginRequest): Promise<AdminResponse> => {
    const response = await apiRequest('POST', '/api/admin/login', credentials);
    return handleApiResponse<AdminResponse>(response);
  },
  
  logout: async (): Promise<AdminResponse> => {
    const response = await apiRequest('POST', '/api/admin/logout');
    return handleApiResponse<AdminResponse>(response);
  },
  
  getStatus: async (): Promise<AdminStatusResponse> => {
    const response = await apiRequest('GET', '/api/admin/status');
    return handleApiResponse<AdminStatusResponse>(response);
  }
};