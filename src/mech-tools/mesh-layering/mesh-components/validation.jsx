import React from 'react';

const ValidationResults = ({ results, config, onNext }) => {
  const { resolution, layers } = results;

  return (
    <div className="space-y-6">
      {/* Gap Ratio */}
      <div className={`p-4 rounded-lg ${resolution.gapRatio > 400 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            Gap Ratio: {resolution.gapRatio.toFixed(1)}x
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            resolution.gapRatio > 400 
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {resolution.gapRatio > 400 ? 'CRITICAL' : 'OK'}
          </span>
        </div>
        <p className="mt-2 text-sm">
          {resolution.gapRatio > 400 
            ? `Gap ratio ${resolution.gapRatio.toFixed(0)}x exceeds safe limit (400x).`
            : 'Resolution looks feasible for boundary layer generation.'
          }
        </p>
        {resolution.strategyApplied && (
          <p className="mt-2 text-sm font-medium text-amber-600">
            {resolution.strategyMessage}
          </p>
        )}
      </div>

      {/* Resolution Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700">Volume Mesh</h4>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {resolution.localCellSize.toFixed(6)} m
          </p>
          <p className="text-sm text-gray-500 mt-1">Cell size at wall</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700">Boundary Layer</h4>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {config.first_layer_height.toExponential(3)} m
          </p>
          <p className="text-sm text-gray-500 mt-1">First layer height</p>
        </div>
      </div>

      {/* Layer Stack Results */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Layer Stack Calculation</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Number of Layers</span>
            <span className="font-medium">{layers.nSurfaceLayers}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Expansion Ratio</span>
            <span className="font-medium">{layers.expansionRatio.toFixed(4)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Final Layer Thickness</span>
            <span className="font-medium">{layers.finalLayerThickness.toFixed(6)} m</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Thickness</span>
            <span className="font-medium">
              {(layers.finalLayerThickness + (config.first_layer_height * (layers.nSurfaceLayers - 1))).toFixed(6)} m
            </span>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="pt-4">
        <button
          onClick={onNext}
          className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Continue to Generate
        </button>
      </div>
    </div>
  );
};

export default ValidationResults;