import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { HSNData, ValidationResult } from '../types';
import { validateHSNCode, validateMultipleHSNCodes } from '../utils/validator';

interface HSNValidatorProps {
  hsnData: HSNData[];
}

const HSNValidator: React.FC<HSNValidatorProps> = ({ hsnData }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isMultiMode, setIsMultiMode] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleValidate = () => {
    if (!inputValue.trim()) return;
    
    setIsValidating(true);
    
    setTimeout(() => {
      try {
        if (isMultiMode) {
          // Split by commas, newlines, or spaces and filter out empty strings
          const codes = inputValue
            .split(/[\n,\s]+/)
            .map(code => code.trim())
            .filter(code => code.length > 0);
            
          const results = validateMultipleHSNCodes(codes, hsnData);
          setValidationResults(results);
        } else {
          const result = validateHSNCode(inputValue.trim(), hsnData);
          setValidationResults([result]);
        }
      } catch (error) {
        console.error('Validation error:', error);
      } finally {
        setIsValidating(false);
      }
    }, 300); // Small delay to show loading state
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isMultiMode) {
      handleValidate();
    }
  };

  const toggleMode = () => {
    setIsMultiMode(!isMultiMode);
    setInputValue('');
    setValidationResults([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">HSN Code Validator</h2>
        <button
          onClick={toggleMode}
          className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors"
        >
          {isMultiMode ? 'Switch to Single Mode' : 'Switch to Batch Mode'}
        </button>
      </div>

      <div className="mb-6">
        {isMultiMode ? (
          <div>
            <label htmlFor="hsn-codes" className="block text-sm font-medium text-gray-700 mb-2">
              Enter multiple HSN codes (separated by commas, spaces, or new lines)
            </label>
            <textarea
              id="hsn-codes"
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. 01, 0101, 01011010"
              value={inputValue}
              onChange={handleInputChange}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="hsn-code" className="block text-sm font-medium text-gray-700 mb-2">
              Enter HSN Code
            </label>
            <div className="relative">
              <input
                id="hsn-code"
                type="text"
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. 01011010"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end mb-8">
        <button
          onClick={handleValidate}
          disabled={isValidating || !inputValue.trim()}
          className={`px-4 py-2 rounded-lg flex items-center ${
            isValidating || !inputValue.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          } transition-colors`}
        >
          {isValidating ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Validating...
            </>
          ) : (
            <>
              Validate
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {validationResults.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HSN Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {validationResults.map((result, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {result.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {result.isValid ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Valid
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <XCircle className="h-5 w-5 mr-2" />
                        Invalid
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {result.description || (
                      <span className="text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {result.error || 'No description available'}
                      </span>
                    )}
                    {result.parentInfo && (
                      <div className="mt-1 text-xs text-indigo-600 bg-indigo-50 p-1 rounded">
                        Parent code found: {result.parentInfo.code} - {result.parentInfo.description}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HSNValidator;