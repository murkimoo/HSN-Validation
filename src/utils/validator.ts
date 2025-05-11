import { HSNData, ValidationResult } from '../types';

/**
 * Validates if the HSN code format is correct
 */
export const validateHSNFormat = (code: string): boolean => {
  // HSN codes are typically numeric and can be 2, 4, 6, or 8 digits
  return /^\d{1,8}$/.test(code);
};

/**
 * Finds parent codes for hierarchical validation
 */
export const findParentCode = (code: string, hsnData: HSNData[]): HSNData | null => {
  if (code.length <= 2) return null;
  
  // Try different parent levels (e.g., for 01011010, try 010110, then 0101, then 01)
  for (let i = code.length - 2; i >= 2; i -= 2) {
    const parentCode = code.substring(0, i);
    const parent = hsnData.find(item => item.HSNCode === parentCode);
    if (parent) return parent;
  }
  
  return null;
};

/**
 * Validates a single HSN code against the master data
 */
export const validateHSNCode = (code: string, hsnData: HSNData[]): ValidationResult => {
  // Basic format validation
  if (!validateHSNFormat(code)) {
    return {
      code,
      isValid: false,
      error: 'Invalid format. HSN codes should be numeric and up to 8 digits.'
    };
  }
  
  // Check if code exists in master data
  const exactMatch = hsnData.find(item => item.HSNCode === code);
  
  if (exactMatch) {
    return {
      code,
      isValid: true,
      description: exactMatch.Description
    };
  }
  
  // If no exact match, try to find parent code for hierarchical validation
  const parentCode = findParentCode(code, hsnData);
  
  if (parentCode) {
    return {
      code,
      isValid: true, // Consider valid if parent exists
      description: `Derived from parent category: ${parentCode.Description}`,
      parentInfo: {
        code: parentCode.HSNCode,
        description: parentCode.Description
      }
    };
  }
  
  // No match found
  return {
    code,
    isValid: false,
    error: 'HSN code not found in master data.'
  };
};

/**
 * Validates multiple HSN codes at once
 */
export const validateMultipleHSNCodes = (codes: string[], hsnData: HSNData[]): ValidationResult[] => {
  return codes.map(code => validateHSNCode(code, hsnData));
};