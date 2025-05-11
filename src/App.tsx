import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, CheckCircle, AlertCircle, Upload, Download } from 'lucide-react';
import HSNValidator from './components/HSNValidator';
import { HSNData } from './types';
import { readExcelFile } from './utils/excelReader';

function App() {
  const [hsnData, setHsnData] = useState<HSNData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await readExcelFile(file);
      setHsnData(data);
      setIsDataLoaded(true);
      localStorage.setItem('hsnData', JSON.stringify(data));
    } catch (err) {
      setError('Failed to read Excel file. Please ensure it has HSNCode and Description columns.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://docs.google.com/spreadsheets/d/1UD4JAAQ6Fgeyc5a1OwBiLV2cPTAK_D2q/edit?usp=sharing&ouid=116706160084886050181&rtpof=true&sd=true');
      if (!response.ok) {
        throw new Error('Failed to fetch sample data');
      }
      
      // This is a placeholder as we can't directly fetch from Google Sheets without proper API
      // In a real implementation, we would use Google Sheets API or a proxy server
      const sampleData: HSNData[] = [
        { HSNCode: '01', Description: 'LIVE ANIMALS' },
        { HSNCode: '0101', Description: 'LIVE HORSES, ASSES, MULES AND HINNIES.' },
        { HSNCode: '01011010', Description: 'LIVE HORSES, ASSES, MULES AND HINNIES PURE-BRED BREEDING ANIMALS HORSES' },
        { HSNCode: '010121', Description: 'PURE-BRED BREEDING ANIMALS' },
        { HSNCode: '01012100', Description: 'PURE-BRED BREEDING ANIMALS' },
      ];
      
      setHsnData(sampleData);
      setIsDataLoaded(true);
      localStorage.setItem('hsnData', JSON.stringify(sampleData));
    } catch (err) {
      setError('Failed to load sample data. Please try uploading your own Excel file.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem('hsnData');
    if (savedData) {
      try {
        setHsnData(JSON.parse(savedData));
        setIsDataLoaded(true);
      } catch (err) {
        console.error('Failed to parse saved HSN data', err);
        localStorage.removeItem('hsnData');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <FileSpreadsheet className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">HSN Code Validation Agent</h1>
          </div>
          <div className="text-sm text-gray-500">Powered by ADK Framework</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!isDataLoaded ? (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">Upload HSN Master Data</h2>
            <p className="mb-6 text-gray-600">
              Please upload an Excel file containing HSN codes and descriptions, or use our sample data.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label 
                  htmlFor="file-upload" 
                  className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Upload Excel File</span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="flex-1">
                <button
                  onClick={loadSampleData}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Use Sample Data
                </button>
              </div>
            </div>
            
            {isLoading && (
              <div className="mt-4 text-center text-gray-600">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mr-2"></div>
                Processing data...
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          <HSNValidator hsnData={hsnData} />
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-4">About HSN Code Validation</h2>
          <p className="mb-4 text-gray-600">
            Harmonized System Nomenclature (HSN) codes are an internationally standardized system of names and numbers to classify traded products.
          </p>
          <p className="mb-4 text-gray-600">
            This agent validates HSN codes against a master dataset and provides information about their validity and description.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-medium">Format Validation</h3>
              </div>
              <p className="text-sm text-gray-600">
                Checks if the input code adheres to expected structural characteristics.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-medium">Existence Validation</h3>
              </div>
              <p className="text-sm text-gray-600">
                Verifies if the exact HSN code exists in the master data.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-medium">Hierarchical Validation</h3>
              </div>
              <p className="text-sm text-gray-600">
                For longer codes, checks if parent codes are present in the dataset structure.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;