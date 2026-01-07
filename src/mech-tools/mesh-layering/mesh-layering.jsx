import React, { useState, useEffect } from 'react';
import ConfigForm from './mesh-components/configform.jsx';
import ValidationResults from './mesh-components/validation.jsx';
import DictPreview from './mesh-components/dictpreview.jsx';
import { calculateResolution, calculateLayerStack, generateDictContent } from './utils/calculate.js';

const MeshLayDictWizard = () => {
  // Default configuration
  const defaultConfig = {
    geometry_name: "patch",
    filename: "patch.stl",
    base_cell_size: 1.0,
    surface_refinement_min: 2,
    surface_refinement_max: 3,
    first_layer_height: 0.001,
    resolution_strategy: "abort"
  };

  const [config, setConfig] = useState(defaultConfig);
  const [results, setResults] = useState(null);
  const [dictContent, setDictContent] = useState('');
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate whenever config changes
  useEffect(() => {
    if (config) {
      const resolution = calculateResolution(config);
      const layers = calculateLayerStack(resolution);
      const dict = generateDictContent(config, resolution, layers);
      
      setResults({ resolution, layers });
      setDictContent(dict);
    }
  }, [config]);

  const handleConfigUpdate = (newConfig) => {
    setConfig(newConfig);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Create download link
    const element = document.createElement('a');
    const file = new Blob([dictContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'snappyHexMeshDict';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setIsGenerating(false);
  };

  const steps = [
    { number: 1, name: 'Configuration', description: 'Set mesh parameters' },
    { number: 2, name: 'Validation', description: 'Check resolution feasibility' },
    { number: 3, name: 'Generate', description: 'Create dictionary file' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SnappyDictWizard</h1>
        <p className="text-gray-600">
          Generate snappyHexMeshDict configuration for OpenFOAM with automatic resolution validation
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-10">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((stepItem, index) => (
              <li
                key={stepItem.name}
                className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}
              >
                <div className="flex items-center">
                  <div
                    className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full ${
                      step >= stepItem.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {stepItem.number}
                  </div>
                  {index !== steps.length - 1 && (
                    <div
                      className={`hidden sm:block absolute top-4 left-8 w-full h-0.5 ${
                        step > stepItem.number ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      style={{ width: 'calc(100% - 2rem)' }}
                    />
                  )}
                </div>
                <div className="mt-2 text-xs sm:text-sm">
                  <div className="font-medium text-gray-900">{stepItem.name}</div>
                  <div className="text-gray-500">{stepItem.description}</div>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Configuration Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Configuration Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration</h2>
            <ConfigForm 
              config={config} 
              onUpdate={handleConfigUpdate} 
              onNext={() => setStep(2)}
            />
          </div>

          {/* Validation Results */}
          {results && step >= 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resolution Validation</h2>
              <ValidationResults 
                results={results} 
                config={config}
                onNext={() => setStep(3)}
              />
            </div>
          )}

          {/* Generate Button */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Dictionary</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">
                    Ready to generate your snappyHexMeshDict file.
                  </p>
                  {results?.resolution?.strategyApplied && (
                    <p className="text-sm text-amber-600 mt-2">
                      Note: {results.resolution.strategyMessage}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    'Download snappyHexMeshDict'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-1">
          <DictPreview content={dictContent} />
        </div>
      </div>
    </div>
  );
};

export default MeshLayDictWizard;