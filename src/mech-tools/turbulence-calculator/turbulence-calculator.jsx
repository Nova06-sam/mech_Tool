import React, { useState, useEffect } from 'react';

const TurbulenceBCCalculator = () => {
  // Constants
  const C_mu = 0.09;
  
  // State for inputs
  const [inputs, setInputs] = useState({
    U: 0.0,
    I: 0.05,
    I_desc: "Medium (5%)",
    l: 1.0,
    l_desc: "Default",
    definition: "industrial",
    intensityType: "medium",
    lengthScaleType: "manual",
    customIntensity: 5.0,
    lengthValue: 1.0
  });
  
  // State for results
  const [results, setResults] = useState({
    k: 0.0,
    epsilon: 0.0,
    omega: 0.0,
    viscosity_ratio: 0.0
  });
  
  // State for loading config
  const [configFile, setConfigFile] = useState(null);
  const [configError, setConfigError] = useState('');
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle intensity type change
  const handleIntensityTypeChange = (type) => {
    let newI, newI_desc;
    
    switch(type) {
      case 'low':
        newI = 0.01;
        newI_desc = "Low (1%)";
        break;
      case 'high':
        newI = 0.10;
        newI_desc = "High (10%)";
        break;
      case 'custom':
        newI = parseFloat(inputs.customIntensity) / 100.0;
        newI_desc = `Custom (${inputs.customIntensity}%)`;
        break;
      default: // medium
        newI = 0.05;
        newI_desc = "Medium (5%)";
    }
    
    setInputs(prev => ({
      ...prev,
      intensityType: type,
      I: newI,
      I_desc: newI_desc
    }));
  };
  
  // Handle length scale type change
  const handleLengthScaleTypeChange = (type) => {
    let newL, newL_desc;
    const dim = parseFloat(inputs.lengthValue);
    
    switch(type) {
      case 'internal':
        newL = 0.07 * dim;
        newL_desc = `Internal (0.07 * ${dim})`;
        break;
      case 'external':
        newL = 0.07 * dim;
        newL_desc = `External (0.07 * ${dim})`;
        break;
      default: // manual
        newL = dim;
        newL_desc = "Manual Input";
    }
    
    setInputs(prev => ({
      ...prev,
      lengthScaleType: type,
      l: newL,
      l_desc: newL_desc
    }));
  };
  
  // Handle config file upload
  const handleConfigUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // 1. Velocity
        const U = parseFloat(data.velocity || 0.0);
        if (U <= 0) throw new Error("Velocity must be positive.");
        
        // 2. Intensity
        const ti_data = data.turbulence_intensity || { type: "medium" };
        const t_type = ti_data.type?.toLowerCase() || "medium";
        let I, I_desc, intensityType, customIntensity;
        
        switch(t_type) {
          case 'low':
            I = 0.01; I_desc = "Low (1%)"; intensityType = 'low';
            break;
          case 'high':
            I = 0.10; I_desc = "High (10%)"; intensityType = 'high';
            break;
          case 'custom':
            const val = parseFloat(ti_data.value || 5.0);
            I = val / 100.0;
            I_desc = `Custom (${val}%)`;
            intensityType = 'custom';
            customIntensity = val;
            break;
          default:
            I = 0.05; I_desc = "Medium (5%)"; intensityType = 'medium';
        }
        
        // 3. Length Scale
        const ls_data = data.length_scale || { type: "manual", value: 1.0 };
        const l_type = ls_data.type?.toLowerCase() || "manual";
        const dim = parseFloat(ls_data.value || 1.0);
        let l, l_desc, lengthScaleType, lengthValue;
        
        if (l_type === "internal") {
          l = 0.07 * dim;
          l_desc = `Internal (0.07 * ${dim})`;
          lengthScaleType = 'internal';
        } else if (l_type === "external") {
          l = 0.07 * dim;
          l_desc = `External (0.07 * ${dim})`;
          lengthScaleType = 'external';
        } else {
          l = dim;
          l_desc = "Manual Input";
          lengthScaleType = 'manual';
        }
        lengthValue = dim;
        
        // 4. Solver Definition
        const definition = (data.solver_definition || "industrial").toLowerCase();
        
        setInputs(prev => ({
          ...prev,
          U,
          I,
          I_desc,
          l,
          l_desc,
          definition,
          intensityType,
          lengthScaleType,
          customIntensity: customIntensity || 5.0,
          lengthValue
        }));
        
        setConfigError('');
        setConfigFile(file.name);
        
      } catch (error) {
        setConfigError(`Invalid JSON configuration: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };
  
  // Perform calculations
  const calculate = () => {
    const { U, I, l, definition } = inputs;
    
    // 1. k
    const k = 1.5 * Math.pow(U * I, 2);
    
    // 2. epsilon
    let epsilon;
    if (definition === 'textbook') {
      epsilon = C_mu * Math.pow(k, 1.5) / l;
    } else {
      epsilon = Math.pow(C_mu, 0.75) * Math.pow(k, 1.5) / l;
    }
    
    // 3. omega
    const omega = epsilon / (C_mu * k);
    
    // 4. Viscosity Ratio
    const nu_air = 1.5e-5;
    const nut = k / omega;
    const viscosity_ratio = nut / nu_air;
    
    setResults({
      k,
      epsilon,
      omega,
      viscosity_ratio
    });
  };
  
  // Calculate whenever inputs change
  useEffect(() => {
    calculate();
  }, [inputs]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            CFD Turbulence Boundary Condition Calculator
          </h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>
        
        {/* Configuration Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-blue-700 mb-4 pb-2 border-b border-gray-200">
            Configuration
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Load from JSON Config:
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleConfigUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {configFile && (
                <div className="mt-3 flex items-center text-green-600">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Loaded: {configFile}</span>
                </div>
              )}
              {configError && (
                <div className="mt-3 flex items-center text-red-600">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{configError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Parameters Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b border-gray-200">
              Input Parameters
            </h2>
            
            <div className="space-y-8">
              {/* Velocity */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-700">
                  1. Mean Flow Velocity (m/s)
                </label>
                <input
                  type="number"
                  name="U"
                  value={inputs.U}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              
              {/* Turbulence Intensity */}
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-700">
                  2. Turbulence Intensity
                </label>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    className={`px-4 py-3 rounded-lg transition ${inputs.intensityType === 'low' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => handleIntensityTypeChange('low')}
                  >
                    Low (1%)
                  </button>
                  <button
                    className={`px-4 py-3 rounded-lg transition ${inputs.intensityType === 'medium' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => handleIntensityTypeChange('medium')}
                  >
                    Medium (5%)
                  </button>
                  <button
                    className={`px-4 py-3 rounded-lg transition ${inputs.intensityType === 'high' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => handleIntensityTypeChange('high')}
                  >
                    High (10%)
                  </button>
                  <button
                    className={`px-4 py-3 rounded-lg transition ${inputs.intensityType === 'custom' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => handleIntensityTypeChange('custom')}
                  >
                    Custom
                  </button>
                </div>
                
                {inputs.intensityType === 'custom' && (
                  <div className="flex items-center space-x-3 pt-2">
                    <input
                      type="number"
                      name="customIntensity"
                      value={inputs.customIntensity}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32"
                    />
                    <span className="text-gray-700 font-medium">%</span>
                  </div>
                )}
                
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-700 font-medium">Current: {inputs.I_desc}</span>
                </div>
              </div>
              
              {/* Length Scale */}
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-700">
                  3. Length Scale
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    className={`px-4 py-3 rounded-lg transition ${inputs.lengthScaleType === 'internal' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => handleLengthScaleTypeChange('internal')}
                  >
                    Internal (Pipe)
                  </button>
                  <button
                    className={`px-4 py-3 rounded-lg transition ${inputs.lengthScaleType === 'external' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => handleLengthScaleTypeChange('external')}
                  >
                    External (Aero)
                  </button>
                  <button
                    className={`px-4 py-3 rounded-lg transition ${inputs.lengthScaleType === 'manual' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => handleLengthScaleTypeChange('manual')}
                  >
                    Manual
                  </button>
                </div>
                
                <div className="pt-3">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    {inputs.lengthScaleType === 'internal' 
                      ? 'Hydraulic Diameter (m)' 
                      : inputs.lengthScaleType === 'external'
                      ? 'Characteristic Length (m)'
                      : 'Length Scale (m)'}
                  </label>
                  <input
                    type="number"
                    name="lengthValue"
                    value={inputs.lengthValue}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-700 font-medium">
                    Current: {inputs.l_desc} = {inputs.l.toFixed(5)} m
                  </span>
                </div>
              </div>
              
              {/* Solver Definition */}
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-700">
                  4. Solver Definition
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    className={`px-6 py-4 rounded-lg transition ${inputs.definition === 'industrial' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setInputs(prev => ({...prev, definition: 'industrial'}))}
                  >
                    Industrial (Fluent/OpenFOAM)
                  </button>
                  <button
                    className={`px-6 py-4 rounded-lg transition ${inputs.definition === 'textbook' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setInputs(prev => ({...prev, definition: 'textbook'}))}
                  >
                    Textbook
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b border-gray-200">
              Calculation Results
            </h2>
            
            <div className="space-y-6">
              {/* Mode Display */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-blue-800">
                  Solver Mode: <strong className="text-blue-900">
                    {inputs.definition === 'textbook' ? 'Textbook' : 'Industrial (Fluent/OpenFOAM)'}
                  </strong>
                </p>
              </div>
              
              {/* Summary */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-3">Input Summary</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Velocity:</span> {inputs.U} m/s
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Intensity:</span> {inputs.I_desc}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Length Scale:</span> {inputs.l.toFixed(5)} m [{inputs.l_desc}]
                  </p>
                </div>
              </div>
              
              {/* Boundary Conditions */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Boundary Conditions:</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          k (Kinetic Energy):
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                          {results.k.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          [m²/s²]
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ε (Dissipation):
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                          {results.epsilon.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          [m²/s³]
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ω (Specific Dissipation):
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                          {results.omega.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          [1/s]
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Sanity Check */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">Sanity Check</h3>
                <p className="text-yellow-700">
                  Viscosity Ratio: <span className="font-bold text-yellow-900">~{results.viscosity_ratio.toFixed(1)}</span>
                </p>
              </div>
              
              {/* Export Options */}
              <div className="pt-4">
                <button
                  onClick={() => {
                    const data = {
                      inputs: inputs,
                      results: results,
                      calculatedAt: new Date().toISOString()
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `turbulence_bc_${Date.now()}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Export Results as JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
       
      </div>
    </div>
  );
};

export default TurbulenceBCCalculator;