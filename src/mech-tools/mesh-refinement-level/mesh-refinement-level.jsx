import React, { useState, useEffect, useRef } from 'react';

const MeshRefinementVisualizer = () => {
  // Canvas references
  const canvasFullRef = useRef(null);
  const canvasZoomRef = useRef(null);
  
  // Default configurations for different geometries
  const defaultConfigs = {
    cylinder: {
      geometry_type: "cylinder",
      base_cell_size: 1.0,
      domain_width: 20,
      surface_level: 2,
      feature_level: 5,
      resolve_feature_angle: 30.0,
      output_filename: "mesh_cylinder.png"
    },
    box: {
      geometry_type: "box",
      base_cell_size: 1.0,
      domain_width: 20,
      surface_level: 3,
      feature_level: 6,
      resolve_feature_angle: 90.0,
      output_filename: "mesh_box.png"
    },
    naca0012: {
      geometry_type: "naca0012",
      base_cell_size: 0.8,
      domain_width: 25,
      surface_level: 4,
      feature_level: 7,
      resolve_feature_angle: 20.0,
      output_filename: "mesh_naca0012.png"
    },
    ahmed_body: {
      geometry_type: "ahmed_body",
      base_cell_size: 1.0,
      domain_width: 30,
      surface_level: 3,
      feature_level: 5,
      resolve_feature_angle: 45.0,
      output_filename: "mesh_ahmed_body.png"
    }
  };

  // Configuration state with default
  const [config, setConfig] = useState(defaultConfigs.cylinder);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [featurePoints, setFeaturePoints] = useState([]);
  const [meshCells, setMeshCells] = useState([]);
  const [geometryPoints, setGeometryPoints] = useState([]);

  // Geometry presets
  const geometryPresets = [
    { id: 'cylinder', name: 'Cylinder', color: '#3B82F6' },
    { id: 'box', name: 'Box', color: '#10B981' },
    { id: 'naca0012', name: 'NACA 0012', color: '#8B5CF6' },
    { id: 'ahmed_body', name: 'Ahmed Body', color: '#EF4444' },
  ];

  // Safe access to geometry_type
  const getGeometryType = () => {
    const geoType = config.geometry_type;
    return typeof geoType === 'string' ? geoType : 'cylinder';
  };

  // Handle configuration changes
  const handleConfigChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: key === 'surface_level' || key === 'feature_level' || key === 'domain_width' || key === 'resolve_feature_angle'
        ? parseFloat(value) || 0
        : key === 'geometry_type'
        ? value
        : parseFloat(value) || 0
    }));
  };

  const selectPreset = (presetName) => {
    setConfig(defaultConfigs[presetName]);
  };

  // Handle config file upload
  const handleConfigUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setConfig(prev => ({
          ...prev,
          ...data,
          surface_level: data.surface_level || prev.surface_level,
          feature_level: data.feature_level || prev.feature_level,
          resolve_feature_angle: data.resolve_feature_angle || prev.resolve_feature_angle
        }));
      } catch (error) {
        console.error('Invalid JSON configuration:', error);
        alert('Error loading configuration file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  // Generate circle geometry
  const generateCircle = (centerX, centerY, radius, segments = 36) => {
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    }
    return points;
  };

  // Generate box geometry
  const generateBox = (centerX, centerY, width, height) => {
    return [
      { x: centerX - width/2, y: centerY - height/2 },
      { x: centerX + width/2, y: centerY - height/2 },
      { x: centerX + width/2, y: centerY + height/2 },
      { x: centerX - width/2, y: centerY + height/2 },
      { x: centerX - width/2, y: centerY - height/2 },
    ];
  };

  // Generate NACA 0012 airfoil points
  const generateNACA0012 = (centerX, centerY, chord) => {
    const points = [];
    const segments = 50;
    
    // Upper surface
    for (let i = 0; i <= segments; i++) {
      const beta = (i / segments) * Math.PI;
      const x = (1 - Math.cos(beta)) / 2;
      const yt = 0.6 * (0.2969 * Math.sqrt(x) - 0.1260 * x - 
               0.3516 * Math.pow(x, 2) + 0.2843 * Math.pow(x, 3) - 
               0.1015 * Math.pow(x, 4));
      points.push({ x: centerX + (x * chord) - chord/2, y: centerY + yt * chord });
    }
    
    // Lower surface
    for (let i = segments; i >= 0; i--) {
      const beta = (i / segments) * Math.PI;
      const x = (1 - Math.cos(beta)) / 2;
      const yt = 0.6 * (0.2969 * Math.sqrt(x) - 0.1260 * x - 
               0.3516 * Math.pow(x, 2) + 0.2843 * Math.pow(x, 3) - 
               0.1015 * Math.pow(x, 4));
      points.push({ x: centerX + (x * chord) - chord/2, y: centerY - yt * chord });
    }
    
    return points;
  };

  // Generate Ahmed body
  const generateAhmedBody = (centerX, centerY, length) => {
    const height = length * 0.288;
    const slantLen = length * 0.222;
    
    return [
      { x: centerX - length/2, y: centerY - height/2 }, // Front bottom
      { x: centerX + length/2, y: centerY - height/2 }, // Rear bottom
      { x: centerX + length/2, y: centerY + height/3 }, // Rear top
      { x: centerX + length/2 - slantLen, y: centerY + height/2 }, // Slant start
      { x: centerX - length/4, y: centerY + height/2 },  // Front top
      { x: centerX - length/2, y: centerY }, // Nose
      { x: centerX - length/2, y: centerY - height/2 }, // Close polygon
    ];
  };

  // Analyze feature points
  const analyzeFeatures = (points, angleThreshold) => {
    const features = [];
    const n = points.length;
    
    for (let i = 0; i < n; i++) {
      const prev = points[(i - 1 + n) % n];
      const curr = points[i];
      const next = points[(i + 1) % n];
      
      // Calculate vectors
      const vecA = { x: curr.x - prev.x, y: curr.y - prev.y };
      const vecB = { x: next.x - curr.x, y: next.y - curr.y };
      
      // Calculate lengths
      const lenA = Math.sqrt(vecA.x * vecA.x + vecA.y * vecA.y);
      const lenB = Math.sqrt(vecB.x * vecB.x + vecB.y * vecB.y);
      
      if (lenA === 0 || lenB === 0) continue;
      
      // Calculate angle
      const dot = (vecA.x * vecB.x + vecA.y * vecB.y) / (lenA * lenB);
      const clampedDot = Math.max(-1, Math.min(1, dot));
      const angleDeg = Math.acos(clampedDot) * (180 / Math.PI);
      
      if (angleDeg > angleThreshold) {
        features.push(curr);
      }
    }
    
    return features;
  };

  // Line intersection check
  const linesIntersect = (a1, a2, b1, b2) => {
    const ccw = (A, B, C) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    return (ccw(a1, b1, b2) !== ccw(a2, b1, b2)) && (ccw(a1, a2, b1) !== ccw(a1, a2, b2));
  };

  // Check if cell intersects geometry
  const cellIntersectsGeometry = (x, y, size, geometrySegments) => {
    const cellMaxX = x + size;
    const cellMaxY = y + size;
    
    for (const segment of geometrySegments) {
      const { x1, y1, x2, y2 } = segment;
      
      // Broad phase check
      const segMinX = Math.min(x1, x2);
      const segMaxX = Math.max(x1, x2);
      const segMinY = Math.min(y1, y2);
      const segMaxY = Math.max(y1, y2);
      
      if (cellMaxX < segMinX || x > segMaxX || cellMaxY < segMinY || y > segMaxY) {
        continue;
      }
      
      // Check if segment endpoints are inside cell
      if ((x <= x1 && x1 <= cellMaxX && y <= y1 && y1 <= cellMaxY) ||
          (x <= x2 && x2 <= cellMaxX && y <= y2 && y2 <= cellMaxY)) {
        return true;
      }
      
      // Check edge intersections
      const cellEdges = [
        [{ x, y: y + size }, { x: x + size, y: y + size }],
        [{ x, y }, { x: x + size, y }],
        [{ x, y }, { x, y: y + size }],
        [{ x: x + size, y }, { x: x + size, y: y + size }]
      ];
      
      for (const edge of cellEdges) {
        if (linesIntersect({ x: x1, y: y1 }, { x: x2, y: y2 }, edge[0], edge[1])) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Check if cell contains feature point
  const cellContainsFeature = (x, y, size, featurePoints) => {
    for (const point of featurePoints) {
      if (x <= point.x && point.x <= x + size && y <= point.y && point.y <= y + size) {
        return true;
      }
    }
    return false;
  };

  // Recursive mesh refinement
  const recursiveRefine = (x, y, size, level, cells, geometrySegments, featurePoints) => {
    let shouldSplit = false;
    
    // Check for features
    const hasFeature = cellContainsFeature(x, y, size, featurePoints);
    if (hasFeature && level < config.feature_level) {
      shouldSplit = true;
    }
    
    // Check for surface intersection
    if (!shouldSplit) {
      const intersectsSurface = cellIntersectsGeometry(x, y, size, geometrySegments);
      if (intersectsSurface && level < config.surface_level) {
        shouldSplit = true;
      }
    }
    
    if (shouldSplit) {
      const newSize = size / 2;
      recursiveRefine(x, y, newSize, level + 1, cells, geometrySegments, featurePoints);
      recursiveRefine(x + newSize, y, newSize, level + 1, cells, geometrySegments, featurePoints);
      recursiveRefine(x, y + newSize, newSize, level + 1, cells, geometrySegments, featurePoints);
      recursiveRefine(x + newSize, y + newSize, newSize, level + 1, cells, geometrySegments, featurePoints);
    } else {
      cells.push({ x, y, size, level });
    }
  };

  // Generate mesh
  const generateMesh = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const centerX = config.domain_width / 2;
    const centerY = config.domain_width / 2;
    let geometry = [];
    
    const geoType = getGeometryType();
    
    // Generate geometry based on type
    switch(geoType) {
      case 'cylinder':
        geometry = generateCircle(centerX, centerY, config.domain_width * 0.2);
        break;
      case 'box':
        geometry = generateBox(centerX, centerY, config.domain_width * 0.4, config.domain_width * 0.2);
        break;
      case 'naca0012':
        const chord = config.domain_width * 0.6;
        geometry = generateNACA0012(centerX, centerY, chord);
        break;
      case 'ahmed_body':
        const length = config.domain_width * 0.5;
        geometry = generateAhmedBody(centerX, centerY, length);
        break;
      default:
        geometry = generateCircle(centerX, centerY, config.domain_width * 0.2);
    }
    
    setGeometryPoints(geometry);
    
    // Convert points to segments
    const geometrySegments = [];
    const n = geometry.length;
    for (let i = 0; i < n; i++) {
      const p1 = geometry[i];
      const p2 = geometry[(i + 1) % n];
      geometrySegments.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
    }
    
    // Analyze feature points
    const features = analyzeFeatures(geometry, config.resolve_feature_angle);
    setFeaturePoints(features);
    
    // Generate mesh cells
    const cells = [];
    const nCells = Math.floor(config.domain_width / config.base_cell_size);
    const totalCells = nCells * nCells;
    let processed = 0;
    
    for (let i = 0; i < nCells; i++) {
      for (let j = 0; j < nCells; j++) {
        const x = i * config.base_cell_size;
        const y = j * config.base_cell_size;
        
        recursiveRefine(x, y, config.base_cell_size, 0, cells, geometrySegments, features);
        
        processed++;
        if (processed % 10 === 0) {
          setGenerationProgress(Math.round((processed / totalCells) * 100));
        }
      }
    }
    
    setMeshCells(cells);
    setGenerationProgress(100);
    setIsGenerating(false);
  };

  // Draw on canvases
  const drawCanvases = () => {
    const fullCanvas = canvasFullRef.current;
    const zoomCanvas = canvasZoomRef.current;
    
    if (!fullCanvas || !zoomCanvas || meshCells.length === 0) return;
    
    const ctxFull = fullCanvas.getContext('2d');
    const ctxZoom = zoomCanvas.getContext('2d');
    
    const canvasWidth = 600;
    const canvasHeight = 600;
    
    // Clear canvases
    ctxFull.clearRect(0, 0, canvasWidth, canvasHeight);
    ctxZoom.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Calculate scale for drawing
    const scale = canvasWidth / config.domain_width;
    
    // Draw mesh cells on full canvas with color coding
    meshCells.forEach(cell => {
      const x = cell.x * scale;
      const y = cell.y * scale;
      const size = cell.size * scale;
      
      // Color based on refinement level
      let color;
      if (cell.level >= config.feature_level) {
        color = '#EF4444'; // Red for feature refinement
      } else if (cell.level >= config.surface_level) {
        color = '#3B82F6'; // Blue for surface refinement
      } else {
        color = '#D1D5DB'; // Gray for base mesh
      }
      
      ctxFull.strokeStyle = color;
      ctxFull.lineWidth = 0.5;
      ctxFull.strokeRect(x, y, size, size);
    });
    
    // Draw geometry on full canvas
    if (geometryPoints.length > 0) {
      ctxFull.strokeStyle = '#10B981';
      ctxFull.lineWidth = 2;
      ctxFull.beginPath();
      
      geometryPoints.forEach((point, index) => {
        const x = point.x * scale;
        const y = point.y * scale;
        
        if (index === 0) {
          ctxFull.moveTo(x, y);
        } else {
          ctxFull.lineTo(x, y);
        }
      });
      
      // Close the polygon
      const firstPoint = geometryPoints[0];
      ctxFull.lineTo(firstPoint.x * scale, firstPoint.y * scale);
      ctxFull.stroke();
    }
    
    // Draw feature points
    if (featurePoints.length > 0) {
      ctxFull.fillStyle = '#8B5CF6';
      featurePoints.forEach(point => {
        const x = point.x * scale;
        const y = point.y * scale;
        ctxFull.beginPath();
        ctxFull.arc(x, y, 4, 0, Math.PI * 2);
        ctxFull.fill();
      });
    }
    
    // Determine zoom focus point
    let zoomFocus = { x: config.domain_width / 2, y: config.domain_width / 2 };
    if (getGeometryType() === 'naca0012') {
      const chord = config.domain_width * 0.6;
      zoomFocus = { x: config.domain_width / 2 - chord / 2, y: config.domain_width / 2 };
    } else if (getGeometryType() === 'ahmed_body' && geometryPoints.length > 3) {
      zoomFocus = geometryPoints[3];
    } else {
      zoomFocus = { x: config.domain_width / 2, y: config.domain_width / 2 + config.domain_width * 0.2 };
    }
    
    // Calculate zoom bounds
    const minCellSize = config.base_cell_size / Math.pow(2, config.feature_level);
    const zoomWidth = minCellSize * 15;
    const zoomScale = canvasWidth / (zoomWidth * 2);
    
    // Draw mesh cells on zoom canvas
    meshCells.forEach(cell => {
      const screenX = (cell.x - (zoomFocus.x - zoomWidth)) * zoomScale;
      const screenY = (cell.y - (zoomFocus.y - zoomWidth)) * zoomScale;
      const screenSize = cell.size * zoomScale;
      
      // Only draw if cell is within zoom bounds
      if (screenX + screenSize >= 0 && screenX <= canvasWidth && 
          screenY + screenSize >= 0 && screenY <= canvasHeight) {
        
        let color;
        if (cell.level >= config.feature_level) {
          color = '#EF4444';
        } else if (cell.level >= config.surface_level) {
          color = '#3B82F6';
        } else {
          color = '#D1D5DB';
        }
        
        ctxZoom.strokeStyle = color;
        ctxZoom.lineWidth = 0.5;
        ctxZoom.strokeRect(screenX, screenY, screenSize, screenSize);
      }
    });
    
    // Draw geometry on zoom canvas
    if (geometryPoints.length > 0) {
      ctxZoom.strokeStyle = '#10B981';
      ctxZoom.lineWidth = 2;
      ctxZoom.beginPath();
      
      geometryPoints.forEach(point => {
        const screenX = (point.x - (zoomFocus.x - zoomWidth)) * zoomScale;
        const screenY = (point.y - (zoomFocus.y - zoomWidth)) * zoomScale;
        
        if (geometryPoints.indexOf(point) === 0) {
          ctxZoom.moveTo(screenX, screenY);
        } else {
          ctxZoom.lineTo(screenX, screenY);
        }
      });
      
      // Close the polygon
      const firstPoint = geometryPoints[0];
      const screenX = (firstPoint.x - (zoomFocus.x - zoomWidth)) * zoomScale;
      const screenY = (firstPoint.y - (zoomFocus.y - zoomWidth)) * zoomScale;
      ctxZoom.lineTo(screenX, screenY);
      ctxZoom.stroke();
    }
    
    // Draw zoom rectangle on full canvas
    ctxFull.strokeStyle = '#F59E0B';
    ctxFull.lineWidth = 1;
    ctxFull.setLineDash([5, 5]);
    const rectX = (zoomFocus.x - zoomWidth) * scale;
    const rectY = (zoomFocus.y - zoomWidth) * scale;
    const rectSize = zoomWidth * 2 * scale;
    ctxFull.strokeRect(rectX, rectY, rectSize, rectSize);
    ctxFull.setLineDash([]);
    
    // Add canvas labels
    ctxFull.fillStyle = '#374151';
    ctxFull.font = '14px Arial';
    ctxFull.fillText('Full Domain View', 10, 20);
    
    ctxZoom.fillStyle = '#374151';
    ctxZoom.font = '14px Arial';
    ctxZoom.fillText('Zoom View (Detail)', 10, 20);
  };

  // Draw canvases when mesh updates
  useEffect(() => {
    drawCanvases();
  }, [meshCells, geometryPoints, featurePoints, config]);

  // Export configuration as JSON
  const exportConfig = () => {
    const configStr = JSON.stringify(config, null, 2);
    const blob = new Blob([configStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mesh_config_${getGeometryType()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Capture canvas as image
  const captureImage = (canvasRef, name) => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `${name}_${getGeometryType()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Format geometry type for display
  const formatGeometryType = (type) => {
    if (!type || typeof type !== 'string') return 'Cylinder';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Mesh Refinement Visualizer
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Simulate mesh refinement levels around different geometries with feature-based refinement
          </p>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Configuration Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b border-gray-200">
                Configuration
              </h2>

              {/* Geometry Presets */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Geometry Presets:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(defaultConfigs).map(preset => (
                    <button
                      key={preset}
                      onClick={() => selectPreset(preset)}
                      className={`px-4 py-3 rounded-lg transition ${getGeometryType() === preset 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {preset.charAt(0).toUpperCase() + preset.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Configuration Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Cell Size
                  </label>
                  <input
                    type="number"
                    value={config.base_cell_size}
                    onChange={(e) => handleConfigChange('base_cell_size', e.target.value)}
                    step="0.1"
                    min="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Starting cell size for the background mesh</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain Width
                  </label>
                  <input
                    type="number"
                    value={config.domain_width}
                    onChange={(e) => handleConfigChange('domain_width', e.target.value)}
                    step="1"
                    min="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Size of the computational domain</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Surface Refinement Level
                  </label>
                  <input
                    type="number"
                    value={config.surface_level}
                    onChange={(e) => handleConfigChange('surface_level', e.target.value)}
                    step="1"
                    min="0"
                    max="8"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of refinement levels at the surface</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feature Refinement Level
                  </label>
                  <input
                    type="number"
                    value={config.feature_level}
                    onChange={(e) => handleConfigChange('feature_level', e.target.value)}
                    step="1"
                    min="0"
                    max="8"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Additional refinement at sharp features</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feature Angle Threshold (degrees)
                  </label>
                  <input
                    type="number"
                    value={config.resolve_feature_angle}
                    onChange={(e) => handleConfigChange('resolve_feature_angle', e.target.value)}
                    step="1"
                    min="0"
                    max="180"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Angle above which edges are considered features</p>
                </div>
              </div>

              {/* File Upload */}
              <div className="mt-6">
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
            </div>

            {/* Control Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Controls</h3>
              
              {/* Generate Button */}
              <button
                onClick={generateMesh}
                disabled={isGenerating}
                className={`w-full px-4 py-3 rounded-lg font-medium transition mb-4 ${isGenerating 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                {isGenerating ? 'Generating Mesh...' : 'Generate Mesh'}
              </button>

              {/* Progress Bar */}
              {isGenerating && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Export Buttons */}
              <div className="space-y-3">
                <button
                  onClick={exportConfig}
                  className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Export Config as JSON</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => captureImage(canvasFullRef, 'full_domain')}
                    disabled={meshCells.length === 0}
                    className={`px-4 py-2 rounded-lg font-medium transition ${meshCells.length === 0 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  >
                    Save Full View
                  </button>
                  <button
                    onClick={() => captureImage(canvasZoomRef, 'zoom_view')}
                    disabled={meshCells.length === 0}
                    className={`px-4 py-2 rounded-lg font-medium transition ${meshCells.length === 0 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  >
                    Save Zoom View
                  </button>
                </div>
              </div>

              {/* Statistics */}
              {meshCells.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">Mesh Statistics</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Total Cells:</span>
                      <span className="font-medium">{meshCells.length.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Feature Points:</span>
                      <span className="font-medium">{featurePoints.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Geometry Type:</span>
                      <span className="font-medium">{formatGeometryType(getGeometryType())}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Visualization */}
          <div className="lg:col-span-2 space-y-6">
            {/* Full Domain View */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-700">Full Domain View</h2>
                <div className="text-sm text-gray-500">
                  Geometry: {formatGeometryType(getGeometryType())}
                </div>
              </div>
              
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <canvas
                  ref={canvasFullRef}
                  width={600}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-600 flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 border border-gray-400 mr-2"></div>
                  <span>Base Mesh</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 border border-blue-500 mr-2"></div>
                  <span>Surface Refinement</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 border border-red-500 mr-2"></div>
                  <span>Feature Refinement</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-0.5 bg-green-500 mr-2"></div>
                  <span>Geometry</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span>Feature Points ({featurePoints.length})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 border border-yellow-500 border-dashed mr-2"></div>
                  <span>Zoom Area</span>
                </div>
              </div>
            </div>

            {/* Zoom View */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-700">Microscope View (Detail)</h2>
                <div className="text-sm text-gray-500">
                  Feature Level: {config.feature_level}
                </div>
              </div>
              
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <canvas
                  ref={canvasZoomRef}
                  width={600}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  Showing detailed refinement around features. Each cell represents a hexahedral element 
                  that would be generated by SnappyHexMesh. Feature points trigger additional refinement 
                  to capture sharp edges and corners accurately.
                </p>
              </div>
            </div>

            {/* Legend and Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-lg p-5 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-3">Refinement Levels</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">Base Level:</span>
                    <span className="font-semibold">Level 0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">Surface Refinement:</span>
                    <span className="font-semibold">Up to Level {config.surface_level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">Feature Refinement:</span>
                    <span className="font-semibold">Up to Level {config.feature_level}</span>
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Each refinement level divides cells by 2× in each direction (8× volume reduction).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-5 border border-green-200">
                <h3 className="text-lg font-bold text-green-800 mb-3">CFD Mesh Tips</h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></span>
                    <span>Surface refinement captures geometry curvature</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></span>
                    <span>Feature refinement resolves sharp edges and corners</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></span>
                    <span>Start with coarse mesh and increase refinement gradually</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></span>
                    <span>Balance accuracy with computational cost</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
      </div>
    </div>
  );
};

export default MeshRefinementVisualizer;