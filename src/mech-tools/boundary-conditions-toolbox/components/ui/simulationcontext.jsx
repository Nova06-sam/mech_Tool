import React from 'react';
import { FlowTypes, CompressibilityTypes, TurbulenceModels } from '../data/datamodel';

const SimulationContextUI = ({ context, onUpdate }) => {
  const handleChange = (field, value) => {
    onUpdate({ ...context, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-cfd-primary mb-4">Global Simulation Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Flow Type
          </label>
          <select 
            value={context.flow_type}
            onChange={(e) => handleChange('flow_type', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {FlowTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compressibility
          </label>
          <select 
            value={context.compressibility}
            onChange={(e) => handleChange('compressibility', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {CompressibilityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Turbulence Model
          </label>
          <select 
            value={context.turbulence_model}
            onChange={(e) => handleChange('turbulence_model', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {TurbulenceModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="heat_transfer"
            checked={context.heat_transfer}
            onChange={(e) => handleChange('heat_transfer', e.target.checked)}
            className="h-4 w-4 text-cfd-primary rounded"
          />
          <label htmlFor="heat_transfer" className="ml-2 text-sm text-gray-700">
            Enable Heat Transfer
          </label>
        </div>
      </div>
    </div>
  );
};

export default SimulationContextUI;