import React, { useState, useEffect } from 'react';

const YplusCalculator = () => {
  // Default fluid properties (air at 20°C)
  const defaultFluids = {
    air: { rho: 1.225, mu: 1.8e-5, name: "Air at 20°C" },
    water: { rho: 998.2, mu: 1e-3, name: "Water at 20°C" },
    glycerin: { rho: 1260, mu: 1.49, name: "Glycerin" }
  };

  // State for inputs
  const [inputs, setInputs] = useState({
    rho: 1.225,
    U: 10.0,
    L: 1.0,
    mu: 1.8e-5,
    y_plus: 30.0,
    growth_rate: 1.2,
    selectedFluid: 'air'
  });

  // State for results
  const [results, setResults] = useState({
    Re: 0.0,
    is_laminar: false,
    Cf: 0.0,
    tau_w: 0.0,
    u_tau: 0.0,
    delta_s: 0.0,
    delta: 0.0,
    num_layers: 0,
    recommendations: [],
    warnings: [],
    layer_info: {}
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  // Handle fluid selection
  const handleFluidChange = (fluid) => {
    const fluidData = defaultFluids[fluid];
    setInputs(prev => ({
      ...prev,
      selectedFluid: fluid,
      rho: fluidData.rho,
      mu: fluidData.mu
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
        
        // Update inputs from JSON
        setInputs(prev => ({
          ...prev,
          rho: parseFloat(data.rho) || prev.rho,
          U: parseFloat(data.U) || prev.U,
          L: parseFloat(data.L) || prev.L,
          mu: parseFloat(data.mu) || prev.mu,
          y_plus: parseFloat(data.y_plus) || prev.y_plus,
          growth_rate: parseFloat(data.growth_rate) || prev.growth_rate
        }));
        
      } catch (error) {
        console.error('Invalid JSON configuration:', error);
      }
    };
    reader.readAsText(file);
  };

  // Calculate Reynolds Number
  const calculateReynolds = (rho, U, L, mu) => {
    if (mu === 0) return 0;
    return (rho * U * L) / mu;
  };

  // Calculate Skin Friction Coefficient
  const calculateCf = (Re) => {
    if (Re < 5e5) {
      return 0.664 / Math.sqrt(Re);
    } else {
      return 0.0592 * Math.pow(Re, -0.2);
    }
  };

  // Calculate Wall Shear Stress
  const calculateTauW = (rho, U, Cf) => {
    return 0.5 * rho * Math.pow(U, 2) * Cf;
  };

  // Calculate Friction Velocity
  const calculateUTau = (tau_w, rho) => {
    return Math.sqrt(tau_w / rho);
  };

  // Calculate First Cell Height
  const calculateDeltaS = (y_plus, mu, u_tau, rho) => {
    if (u_tau === 0 || rho === 0) return 0;
    return (y_plus * mu) / (u_tau * rho);
  };

  // Calculate Boundary Layer Thickness
  const calculateDelta = (Re, L, isLaminar) => {
    if (isLaminar) {
      return (5.0 * L) / Math.sqrt(Re);
    } else {
      return 0.37 * L / Math.pow(Re, 0.2);
    }
  };

  // Calculate Number of Inflation Layers
  const calculateNumLayers = (delta, delta_s, growth_rate) => {
    if (delta_s === 0) return 0;
    
    if (growth_rate === 1) {
      return Math.ceil(delta / delta_s);
    } else {
      const term = 1 + ((delta / delta_s) * (growth_rate - 1));
      const n = Math.log(term) / Math.log(growth_rate);
      return Math.ceil(n);
    }
  };

  // Get Turbulence Recommendations
  const getTurbulenceRecommendations = (y_plus, isLaminar) => {
    const recommendations = [];
    const warnings = [];

    if (isLaminar) {
      recommendations.push("Flow is Laminar. Use 'Laminar' model.");
      return { recommendations, warnings };
    }

    if (y_plus < 1) {
      recommendations.push("Best: k-omega SST (Menter)");
      recommendations.push("Alternative: Spalart-Allmaras");
    } else if (y_plus >= 1 && y_plus <= 5) {
      recommendations.push("Best: k-omega SST (Handles transition well)");
    } else if (y_plus > 5 && y_plus < 30) {
      warnings.push("Target y+ is in Buffer Layer (5-30). Avoid placing first node here.");
      recommendations.push("Advice: Refine to y+ < 1 or coarsen to y+ > 30.");
    } else if (y_plus >= 30 && y_plus <= 300) {
      recommendations.push("Best: Standard k-epsilon (Wall Functions)");
      recommendations.push("Best: Realizable k-epsilon (Wall Functions)");
      warnings.push("Avoid: Standard k-omega (requires y+ ~1)");
    } else {
      warnings.push("y+ > 300. Mesh is likely too coarse for accurate boundary layer physics.");
    }

    return { recommendations, warnings };
  };

  // Perform all calculations
  const calculateAll = () => {
    const { rho, U, L, mu, y_plus, growth_rate } = inputs;

    // 1. Reynolds Number and Flow Regime
    const Re = calculateReynolds(rho, U, L, mu);
    const isLaminar = Re < 5e5;

    // 2. Skin Friction Coefficient
    const Cf = calculateCf(Re);

    // 3. Wall Shear Stress
    const tau_w = calculateTauW(rho, U, Cf);

    // 4. Friction Velocity
    const u_tau = calculateUTau(tau_w, rho);

    // 5. First Cell Height
    const delta_s = calculateDeltaS(y_plus, mu, u_tau, rho);

    // 6. Boundary Layer Thickness
    const delta = calculateDelta(Re, L, isLaminar);

    // 7. Number of Inflation Layers
    const num_layers = calculateNumLayers(delta, delta_s, growth_rate);

    // 8. Turbulence Model Recommendations
    const { recommendations, warnings } = getTurbulenceRecommendations(y_plus, isLaminar);

    // 9. Check for viscosity warning
    const allWarnings = [...warnings];
    if (mu > 1.0) {
      allWarnings.push(`Viscosity ${mu} Pa.s seems high. Ensure it is Dynamic Viscosity.`);
    }

    // 10. Layer info
    const layer_info = {
      boundary_layer_thickness_mm: delta * 1000,
      recommended_layers: num_layers,
      growth_rate_used: growth_rate
    };

    setResults({
      Re,
      is_laminar: isLaminar,
      Cf,
      tau_w,
      u_tau,
      delta_s,
      delta,
      num_layers,
      recommendations,
      warnings: allWarnings,
      layer_info
    });
  };

  // Calculate on input change
  useEffect(() => {
    calculateAll();
  }, [inputs]);

  // Export results as JSON
  const exportResults = () => {
    const exportData = {
      inputs,
      results,
      calculatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cfd_mesh_calc_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setInputs({
      rho: 1.225,
      U: 10.0,
      L: 1.0,
      mu: 1.8e-5,
      y_plus: 30.0,
      growth_rate: 1.2,
      selectedFluid: 'air'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            CFD Mesh Boundary Layer Calculator
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Calculate Reynolds number, first cell height, inflation layers, and turbulence model recommendations for CFD simulations
          </p>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input Parameters */}
          <div className="lg:col-span-2 space-y-6">
            {/* Configuration Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-700">Configuration</h2>
                <button
                  onClick={resetToDefaults}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Reset to Defaults
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Load Configuration from JSON:
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleConfigUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {/* Fluid Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Fluid:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(defaultFluids).map(([key, fluid]) => (
                    <button
                      key={key}
                      className={`px-4 py-3 rounded-lg transition ${inputs.selectedFluid === key 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      onClick={() => handleFluidChange(key)}
                    >
                      {fluid.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fluid Properties */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Fluid Properties</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Density (ρ) [kg/m³]
                      </label>
                      <input
                        type="number"
                        name="rho"
                        value={inputs.rho}
                        onChange={handleInputChange}
                        step="0.001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dynamic Viscosity (μ) [Pa·s]
                      </label>
                      <input
                        type="number"
                        name="mu"
                        value={inputs.mu}
                        onChange={handleInputChange}
                        step="1e-7"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Flow Conditions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Flow Conditions</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Velocity (U) [m/s]
                      </label>
                      <input
                        type="number"
                        name="U"
                        value={inputs.U}
                        onChange={handleInputChange}
                        step="0.1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Characteristic Length (L) [m]
                      </label>
                      <input
                        type="number"
                        name="L"
                        value={inputs.L}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Mesh Parameters */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Mesh Parameters</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target y+
                      </label>
                      <input
                        type="number"
                        name="y_plus"
                        value={inputs.y_plus}
                        onChange={handleInputChange}
                        step="0.1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Typical: 1 (low-Re), 30-300 (wall functions)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Growth Rate
                      </label>
                      <input
                        type="number"
                        name="growth_rate"
                        value={inputs.growth_rate}
                        onChange={handleInputChange}
                        step="0.05"
                        min="1.0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        1.1-1.3 recommended for smooth transition
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations & Warnings */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-blue-700 mb-4">Recommendations & Warnings</h2>
              
              {/* Turbulence Model Recommendations */}
              {results.recommendations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-green-700 mb-3">Turbulence Model Recommendations:</h3>
                  <div className="space-y-2">
                    {results.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {results.warnings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-yellow-700 mb-3">Warnings:</h3>
                  <div className="space-y-2">
                    {results.warnings.map((warning, index) => (
                      <div key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{warning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 italic">
                  <strong>Disclaimer:</strong> Calculations assume Flat Plate theory. Real geometry may require finer mesh (acceleration) or different handling (separation).
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Flow Properties Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b border-gray-200">
                Flow Properties
              </h2>

              <div className="space-y-4">
                {/* Reynolds Number */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-700 mb-1">Reynolds Number</div>
                  <div className="text-2xl font-bold text-blue-900">{results.Re.toExponential(3)}</div>
                  <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium inline-block ${results.is_laminar ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {results.is_laminar ? 'LAMINAR FLOW' : 'TURBULENT FLOW'}
                  </div>
                </div>

                {/* Other Properties */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-medium text-gray-500">Skin Friction Coeff</div>
                    <div className="text-lg font-semibold text-gray-800">{results.Cf.toExponential(3)}</div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-medium text-gray-500">Wall Shear Stress</div>
                    <div className="text-lg font-semibold text-gray-800">{results.tau_w.toExponential(3)} Pa</div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-medium text-gray-500">Friction Velocity</div>
                    <div className="text-lg font-semibold text-gray-800">{results.u_tau.toExponential(3)} m/s</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mesh Results Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b border-gray-200">
                Mesh Results
              </h2>

              <div className="space-y-5">
                {/* First Cell Height */}
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <div className="text-sm font-medium text-green-700 mb-1">First Cell Height</div>
                  <div className="text-3xl font-bold text-green-900">
                    {(results.delta_s * 1000).toFixed(6)}
                  </div>
                  <div className="text-sm text-green-600 mt-1">mm</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Equivalent to {results.delta_s.toExponential(3)} m
                  </div>
                </div>

                {/* Boundary Layer Info */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                  <div className="text-sm font-medium text-purple-700 mb-2">Boundary Layer</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Thickness:</span>
                      <span className="font-semibold text-gray-800">
                        {(results.delta * 1000).toFixed(3)} mm
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Growth Rate:</span>
                      <span className="font-semibold text-gray-800">
                        {inputs.growth_rate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inflation Layers */}
                <div className="text-center p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                  <div className="text-sm font-medium text-orange-700 mb-1">Inflation Layers</div>
                  <div className="text-4xl font-bold text-orange-900 mb-2">
                    {results.num_layers}
                  </div>
                  <div className="text-sm text-orange-600">
                    Recommended Number of Prism Layers
                  </div>
                </div>
              </div>
            </div>

            {/* Export Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Export Results</h3>
              <button
                onClick={exportResults}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Export as JSON</span>
              </button>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify({
                      inputs,
                      results
                    }, null, 2));
                    alert('Results copied to clipboard!');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 transition"
                >
                  Copy results to clipboard
                </button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-lg p-5 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-3">Quick Tips</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                  <span>For external aerodynamics, use y+ ≈ 1 with k-ω SST</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                  <span>For internal flows with wall functions, use y+ ≈ 30-100</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                  <span>Growth rate 1.2 gives smooth transition in boundary layer</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YplusCalculator;