export interface FormData {
  budget: 'low' | 'medium' | 'high';
  time: 'part-time' | 'full-time';
  skills: string[];
  risk: 'low' | 'medium' | 'high';
  revenue: 'one-time' | 'recurring';
}

export interface ModelInfo {
  id: string;
  name: string;
  tagline: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  pros: string[];
  cons: string[];
  steps: string[];
}

export interface ProfitEstimate {
  monthly: string;
  margin: string;
  initialInvestment: string;
}

export interface AnalysisResult {
  model: ModelInfo;
  successScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  skillGap: string[];
  suggestions: string[];
  aiSuggestions?: string[];
  profitEstimate: ProfitEstimate;
  breakEven: string;
}

export interface AnalysisResponse {
  recommended: AnalysisResult;
  alternatives: AnalysisResult[];
  all: AnalysisResult[];
}
