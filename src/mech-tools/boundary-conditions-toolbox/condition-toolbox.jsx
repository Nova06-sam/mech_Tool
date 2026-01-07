import React, { useState } from 'react';
import { SimulationContext, BoundaryPatch } from './components/data/datamodel';
import { BCGenerator } from './components/data/logic/generator';
import SimulationContextUI from './components/ui/simulationcontext';
import BoundaryConfig from './components/ui/BoundaryConfig';
import BCViewer from './components/ui/Bcviewer';
import TurbulenceCalculatorDisplay from './components/ui/TurbulenceCal';

function ToolBox() {
  const [context, setContext] = useState(new SimulationContext());
  const [boundaries, setBoundaries] = useState([
    new BoundaryPatch('inlet', 'inlet', { velocity_mag: 10, turb_intensity: 0.05, length_scale: 0.1 }),
    new BoundaryPatch('outlet', 'outlet', { pressure: 0 }, true),
    new BoundaryPatch('wall_bottom', 'wall', { y_plus: 0.5 }),
    new BoundaryPatch('wall_top', 'wall', { y_plus: 50 }, false, true),
  ]);
  
  const [generatedFiles, setGeneratedFiles] = useState({});
  const [showDemo, setShowDemo] = useState(false);

  const handleAddBoundary = () => {
    const newName = `boundary_${boundaries.length + 1}`;
    setBoundaries([...boundaries, new BoundaryPatch(newName, 'wall')]);
  };

  const handleUpdateBoundary = (index, updatedBoundary) => {
    const newBoundaries = [...boundaries];
    newBoundaries[index] = updatedBoundary;
    setBoundaries(newBoundaries);
  };

  const handleRemoveBoundary = (index) => {
    setBoundaries(boundaries.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    const generator = new BCGenerator();
    const files = generator.generate_all_files(context, boundaries);
    setGeneratedFiles(files);
  };

  const loadDemo = () => {
    const demoContext = new SimulationContext('external', 'incompressible', 'kOmegaSST', false);
    const demoBoundaries = [
      new BoundaryPatch('inlet_main', 'inlet', { 
        velocity_mag: 25, 
        turb_intensity: 0.05, 
        length_scale: 0.5 
      }),
      new BoundaryPatch('outlet_pressure', 'outlet', { pressure: 0 }, true),
      new BoundaryPatch('wing_surface', 'wall', { y_plus: 0.8 }),
      new BoundaryPatch('ground_terrain', 'wall', { y_plus: 150, roughness_height: 0.1, roughness_constant: 0.5 }, false, true),
    ];
    
    setContext(demoContext);
    setBoundaries(demoBoundaries);
    setShowDemo(true);
    
    setTimeout(() => {
      const generator = new BCGenerator();
      const files = generator.generate_all_files(demoContext, demoBoundaries);
      setGeneratedFiles(files);
    }, 100);
  };

  const handleExportJSON = () => {
    const exportData = {
      global_settings: {
        flow_type: context.flow_type,
        compressibility: context.compressibility,
        turbulence_model: context.turbulence_model,
        heat_transfer: context.heat_transfer
      },
      boundaries: boundaries.map(b => ({
        name: b.name,
        type: b.face_type,
        inputs: b.inputs,
        is_backflow_possible: b.is_backflow_possible,
        is_rough_wall: b.is_rough_wall
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cfd_boundary_conditions.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            CFD Boundary Condition Generator
          </h1>
          <p className="text-gray-600 mt-2">
            OpenFOAM boundary condition generation with intelligent logic rules
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Demo Button */}
        <div className="mb-6">
          <button
            onClick={loadDemo}
            className="px-4 py-2 bg-cfd-secondary hover:bg-teal-600 text-white rounded-md"
          >
            Load Aerodynamics Demo
          </button>
          {showDemo && (
            <span className="ml-4 text-green-600 font-medium">
              ✓ Demo case loaded. Click "Generate All Files" below.
            </span>
          )}
        </div>

        {/* Configuration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Configuration */}
          <div>
            <SimulationContextUI context={context} onUpdate={setContext} />
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-cfd-primary">Boundary Patches</h2>
                <button
                  onClick={handleAddBoundary}
                  className="px-4 py-2 bg-cfd-primary hover:bg-blue-700 text-white rounded-md"
                >
                  Add Boundary
                </button>
              </div>
              
              {boundaries.map((boundary, index) => (
                <BoundaryConfig
                  key={index}
                  boundary={boundary}
                  onUpdate={(updated) => handleUpdateBoundary(index, updated)}
                  onRemove={() => handleRemoveBoundary(index)}
                />
              ))}
              
              {boundaries.some(b => b.face_type === 'inlet') && (
                <TurbulenceCalculatorDisplay 
                  inputs={boundaries.find(b => b.face_type === 'inlet')?.inputs || {}} 
                />
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleGenerate}
                className="flex-1 px-6 py-3 bg-cfd-primary hover:bg-blue-700 text-white font-medium rounded-md shadow"
              >
                Generate All Files
              </button>
              
              <button
                onClick={handleExportJSON}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md"
              >
                Export JSON
              </button>
            </div>
          </div>
          
          {/* Right Column - Results */}
          <div>
            <div className="sticky top-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-cfd-primary">Generated Files</h2>
                <div className="text-sm text-gray-500">
                  {Object.keys(generatedFiles).length} files ready
                </div>
              </div>
              
              <BCViewer files={generatedFiles} />
              
              {/* File Download Buttons */}
              {Object.keys(generatedFiles).length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Download Files</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(generatedFiles).map(file => (
                      <a
                        key={file}
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(generatedFiles[file])}`}
                        download={`0/${file}`}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded"
                      >
                        {file}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Explanation */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-cfd-primary mb-2">1. Context-Aware Logic</h4>
              <p className="text-gray-600 text-sm">
                The system adapts boundary conditions based on flow type, compressibility, and turbulence model.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-cfd-primary mb-2">2. Physics-Based Rules</h4>
              <p className="text-gray-600 text-sm">
                Automatically calculates turbulence values, detects y+ regions, and selects appropriate wall functions.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-cfd-primary mb-2">3. Industry Best Practices</h4>
              <p className="text-gray-600 text-sm">
                Follows OpenFOAM conventions and CFD best practices for accurate boundary condition setup.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ToolBox;