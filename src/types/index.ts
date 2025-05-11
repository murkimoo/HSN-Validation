export interface HSNData {
  HSNCode: string;
  Description: string;
}

export interface ValidationResult {
  code: string;
  isValid: boolean;
  description?: string;
  error?: string;
  parentInfo?: {
    code: string;
    description: string;
  };
}