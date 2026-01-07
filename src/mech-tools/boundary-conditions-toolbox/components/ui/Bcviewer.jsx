import React, { useState } from 'react';

const BCViewer = ({ files }) => {
  const [activeFile, setActiveFile] = useState(Object.keys(files)[0] || '');

  if (Object.keys(files).length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">Generate boundary conditions to see the results</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {Object.keys(files).map(file => (
            <button
              key={file}
              onClick={() => setActiveFile(file)}
              className={`px-4 py-3 font-medium text-sm ${
                activeFile === file
                  ? 'border-b-2 border-cfd-primary text-cfd-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {file}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-0">
        <div className="relative">
          <pre className="text-sm bg-gray-900 text-gray-100 p-4 overflow-x-auto h-96">
            {files[activeFile]}
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(files[activeFile])}
            className="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
          >
            Copy
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <strong>File:</strong> 0/{activeFile} | 
            <strong> Location:</strong> OpenFOAM case directory
          </div>
        </div>
      </div>
    </div>
  );
};

export default BCViewer;