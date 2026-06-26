import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5067/api',
});

export interface SubmitSalaryRequest {
    stack: string;
    amount: number;
    city: string;
    latitude: number;
    longitude: number;
    level: string;
}

export interface GeoSearchResult {
    city: string;
    stack: string;
    level: string;
    averageSalary: number;
    sampleSize: number;
    distanceKm: number;
    latitude: number;
    longitude: number;
}

export interface OverviewStats {
  totalSubmissions: number;
  uniqueCities: number;
  uniqueStacks: number;
}

export interface CityStat {
  city: string;
  averageSalary: number;
  sampleSize: number;
}

export interface StackStat {
  stack: string;
  averageSalary: number;
  sampleSize: number;
}

export interface CitySuggestion {
    name: string;
    latitude: number;
    longitude: number;
}

export const normalizeStack = (stack: string) =>
  api.post('/salary/normalize', { stack });

export const getOverview = () => api.get<OverviewStats>('/stats/overview');
export const getTopCities = (stack?: string) => api.get<CityStat[]>('/stats/top-cities', { params: { stack } });
export const getTopStacks = () => api.get<StackStat[]>('/stats/top-stacks');

export const submitSalary = (data: SubmitSalaryRequest) =>
  api.post('/salary', data);

export const searchByRadius = (params: {
  lat: number;
  lng: number;
  radiusKm: number;
  stack?: string;
}) => api.get('/geosearch/radius', { params });

export const autocompleteCity = (q: string) =>
  api.get('/search/cities', { params: { q } });

export default api;