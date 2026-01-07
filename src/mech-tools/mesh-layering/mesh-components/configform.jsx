import React from 'react';

const ConfigForm = ({ config, onUpdate, onNext }) => {
  const handleChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    onUpdate(newConfig);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Geometry Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Geometry Settings</h3>
          
          <div>
            <label htmlFor="geometry_name" className="block text-sm font-medium text-gray-700">
              Geometry Name
            </label>
            <input
              type="text"
              id="geometry_name"
              value={config.geometry_name}
              onChange={(e) => handleChange('geometry_name', e.target.value)}
              className="mt-1 block w-full rounded-md px-2 py-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="filename" className="block text-sm font-medium text-gray-700">
              STL Filename
            </label>
            <input
              type="text"
              id="filename"
              value={config.filename}
              onChange={(e) => handleChange('filename', e.target.value)}
              className="mt-1 block w-full rounded-md px-2 py-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Mesh Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Mesh Settings</h3>
          
          <div>
            <label htmlFor="base_cell_size" className="block text-sm font-medium text-gray-700">
              Base Cell Size (m)
            </label>
            <input
              type="number"
              id="base_cell_size"
              step="0.1"
              min="0.1"
              value={config.base_cell_size}
              onChange={(e) => handleChange('base_cell_size', parseFloat(e.target.value))}
              className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="surface_refinement_min" className="block text-sm font-medium text-gray-700">
                Min Refinement Level
              </label>
              <input
                type="number"
                id="surface_refinement_min"
                min="0"
                max="10"
                value={config.surface_refinement_min}
                onChange={(e) => handleChange('surface_refinement_min', parseInt(e.target.value))}
                className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="surface_refinement_max" className="block text-sm font-medium text-gray-700">
                Max Refinement Level
              </label>
              <input
                type="number"
                id="surface_refinement_max"
                min="0"
                max="10"
                value={config.surface_refinement_max}
                onChange={(e) => handleChange('surface_refinement_max', parseInt(e.target.value))}
                className="mt-1 block px-2 py-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Boundary Layer Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Boundary Layer</h3>
          
          <div>
            <label htmlFor="first_layer_height" className="block text-sm font-medium text-gray-700">
              First Layer Height (m)
            </label>
            <input
              type="number"
              id="first_layer_height"
              step="0.000001"
              min="0.000001"
              value={config.first_layer_height}
              onChange={(e) => handleChange('first_layer_height', parseFloat(e.target.value))}
              className="mt-1 block px-2 py-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">Target y+ height for first cell</p>
          </div>
        </div>

        {/* Strategy Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Resolution Strategy</h3>
          
          <div>
            <label htmlFor="resolution_strategy" className="block text-sm font-medium text-gray-700">
              When Resolution is Insufficient
            </label>
            <select
              id="resolution_strategy"
              value={config.resolution_strategy}
              onChange={(e) => handleChange('resolution_strategy', e.target.value)}
              className="mt-1 block w-full px-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="abort">Abort and Alert</option>
              <option value="increase_levels">Increase Refinement Levels</option>
              <option value="refine_base">Refine Base Mesh</option>
              <option value="ignore">Ignore (Use Caution)</option>
            </select>
            <div className="mt-2 space-y-1 text-sm text-gray-500">
              <p><span className="font-medium">Abort:</span> Stop if resolution is insufficient</p>
              <p><span className="font-medium">Increase Levels:</span> Automatically increase refinement</p>
              <p><span className="font-medium">Refine Base:</span> Refine the base mesh</p>
              <p><span className="font-medium">Ignore:</span> Proceed anyway (not recommended)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Validate Configuration
        </button>
      </div>
    </form>
  );
};

export default ConfigForm;