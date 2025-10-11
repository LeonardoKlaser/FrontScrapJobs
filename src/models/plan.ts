export interface Plan {
    id: number;
    name: string;
    price: number;
    max_sites: number;
    max_ai_analyses: number;
    features: string[];
  }