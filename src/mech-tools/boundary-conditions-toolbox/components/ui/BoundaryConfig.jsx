import React, { useState } from 'react';
import { FaceTypes } from '../data/datamodel';

const BoundaryConfig = ({ boundary, onUpdate, onRemove }) => {
  const [expanded, setExpanded] = useState(false);
  
  const handleInputChange = (key, value) => {
    const newInputs = { ...boundary.inputs, [key]: parseFloat(value) || 0 };
    onUpdate({ ...boundary, inputs: newInputs });
  };
  
  const handleFlagChange = (flag, value) => {
    onUpdate({ ...boundary, [flag]: value });
  };

  const renderInputs = () => {
    switch(boundary.face_type) {
      case 'inlet':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600">Velocity Magnitude (m/s)</label>
              <input
                type="number"
                value={boundary.inputs.velocity_mag || ''}
                onChange={(e) => handleInputChange('velocity_mag', e.target.value)}
                className="w-full p-1 border rounded text-sm"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Turbulence Intensity</label>
              <input
                type="number"
                value={boundary.inputs.turb_intensity || ''}
                onChange={(e) => handleInputChange('turb_intensity', e.target.value)}
                className="w-full p-1 border rounded text-sm"
                step="0.01"
                min="0"
                max="1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Length Scale (m)</label>
              <input
                type="number"
                value={boundary.inputs.length_scale || ''}
                onChange={(e) => handleInputChange('length_scale', e.target.value)}
                className="w-full p-1 border rounded text-sm"
                step="0.01"
              />
            </div>
          </div>
        );
        
      case 'outlet':
        return (
          <div>
            <div className="mb-3">
              <label className="block text-xs text-gray-600">Pressure (Pa)</label>
              <input
                type="number"
                value={boundary.inputs.pressure || ''}
                onChange={(e) => handleInputChange('pressure', e.target.value)}
                className="w-full p-1 border rounded text-sm"
                step="100"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={boundary.is_backflow_possible}
                onChange={(e) => handleFlagChange('is_backflow_possible', e.target.checked)}
                className="h-4 w-4 text-cfd-primary rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Allow backflow
              </label>
            </div>
          </div>
        );
        
      case 'wall':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600">y+ Value</label>
              <input
                type="number"
                value={boundary.inputs.y_plus || ''}
                onChange={(e) => handleInputChange('y_plus', e.target.value)}
                className="w-full p-1 border rounded text-sm"
                step="0.1"
              />
              <div className="mt-1 text-xs text-gray-500">
                {boundary.inputs.y_plus < 1 ? "Low-Re (Viscous Sublayer)" :
                 boundary.inputs.y_plus < 30 ? "⚠️ Buffer Layer (Problematic)" :
                 "High-Re (Log-law Region)"}
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={boundary.is_rough_wall}
                onChange={(e) => handleFlagChange('is_rough_wall', e.target.checked)}
                className="h-4 w-4 text-cfd-primary rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Rough Wall
              </label>
            </div>
            
            {boundary.is_rough_wall && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600">Roughness Height Ks (m)</label>
                  <input
                    type="number"
                    value={boundary.inputs.roughness_height || ''}
                    onChange={(e) => handleInputChange('roughness_height', e.target.value)}
                    className="w-full p-1 border rounded text-sm"
                    step="0.001"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Roughness Constant Cs</label>
                  <input
                    type="number"
                    value={boundary.inputs.roughness_constant || ''}
                    onChange={(e) => handleInputChange('roughness_constant', e.target.value)}
                    className="w-full p-1 border rounded text-sm"
                    step="0.1"
                  />
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return <div className="text-gray-500">No specific inputs needed</div>;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={boundary.name}
            onChange={(e) => onUpdate({ ...boundary, name: e.target.value })}
            className="font-medium text-lg border-b border-transparent hover:border-gray-300 focus:border-cfd-primary focus:outline-none"
          />
          <select
            value={boundary.face_type}
            onChange={(e) => onUpdate({ ...boundary, face_type: e.target.value })}
            className="p-1 border border-gray-300 rounded text-sm"
          >
            {FaceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            boundary.face_type === 'inlet' ? 'bg-green-100 text-green-800' :
            boundary.face_type === 'outlet' ? 'bg-blue-100 text-blue-800' :
            boundary.face_type === 'wall' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {boundary.face_type}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            {expanded ? 'Hide' : 'Configure'}
          </button>
          <button
            onClick={onRemove}
            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
          >
            Remove
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {renderInputs()}
        </div>
      )}
    </div>
  );
};

export default BoundaryConfig;