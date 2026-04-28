import axios from 'axios';
import type { FormData, AnalysisResponse } from './types';

const BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : '/api';

export async function analyzeForm(data: FormData): Promise<AnalysisResponse> {
  const res = await axios.post(`${BASE_URL}/analyze`, data);
  return res.data;
}

export async function getAllModels() {
  const res = await axios.get(`${BASE_URL}/models`);
  return res.data;
}
