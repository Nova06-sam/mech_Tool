// import React, { useState, useEffect, useRef } from 'react';

// const ConvectionDiffusionSolver = () => {
//   // Default configurations
//   const defaultConfigs = {
//     "1D": {
//       dimension: "1D",
//       parameters: {
//         velocity: 1.0,
//         diffusion: 0.01,
//         grid_size: 200,
//         duration: 5.0,
//         schemes: ["upwind", "lax_wendroff", "van_leer"],
//         cfl_number: 0.8
//       }
//     },
//     "2D": {
//       dimension: "2D",
//       parameters: {
//         velocity_x: 0.5,
//         velocity_y: 0.5,
//         diffusion: 0.05,
//         grid_size: 60,
//         duration: 10.0
//       }
//     }
//   };

//   // State for configuration
//   const [config, setConfig] = useState(defaultConfigs["1D"]);
//   const [isRunning, setIsRunning] = useState(false);
//   const [simulationResults, setSimulationResults] = useState(null);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [animationId, setAnimationId] = useState(null);
  
//   // Refs for canvases
//   const canvas1DRef = useRef(null);
//   const canvas2DRef = useRef(null);

//   // Handle dimension change
//   const handleDimensionChange = (dim) => {
//     setConfig(defaultConfigs[dim]);
//     setSimulationResults(null);
//     setCurrentTime(0);
//     if (animationId) {
//       cancelAnimationFrame(animationId);
//       setAnimationId(null);
//     }
//   };

//   // Handle parameter changes
//   const handleParamChange = (key, value) => {
//     setConfig(prev => ({
//       ...prev,
//       parameters: {
//         ...prev.parameters,
//         [key]: key.includes('grid_size') || key.includes('duration') 
//           ? parseInt(value) || 0 
//           : parseFloat(value) || 0
//       }
//     }));
//   };

//   // Handle scheme selection
//   const handleSchemeToggle = (scheme) => {
//     if (config.dimension !== "1D") return;
    
//     setConfig(prev => {
//       const schemes = [...prev.parameters.schemes];
//       const index = schemes.indexOf(scheme);
      
//       if (index >= 0) {
//         schemes.splice(index, 1);
//       } else {
//         schemes.push(scheme);
//       }
      
//       return {
//         ...prev,
//         parameters: {
//           ...prev.parameters,
//           schemes
//         }
//       };
//     });
//   };

//   // Handle config file upload
//   const handleConfigUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       try {
//         const data = JSON.parse(event.target.result);
//         setConfig(data);
//         setSimulationResults(null);
//         setCurrentTime(0);
//         if (animationId) {
//           cancelAnimationFrame(animationId);
//           setAnimationId(null);
//         }
//       } catch (error) {
//         console.error('Invalid JSON configuration:', error);
//         alert('Error loading configuration file. Please check the format.');
//       }
//     };
//     reader.readAsText(file);
//   };

//   // Simplified 1D simulation visualization (mock data for frontend)
//   const generate1DData = (velocity, diffusion, time) => {
//     const L = 10.0;
//     const nx = 200;
//     const x = Array.from({ length: nx }, (_, i) => (i / (nx - 1)) * L);
    
//     // Initial Gaussian pulse
//     const x0 = L/4;
//     const sigma = 0.5;
    
//     // Calculate current position based on velocity
//     const currentX0 = x0 + velocity * time;
    
//     // Generate data for each scheme
//     const data = {};
    
//     // Base Gaussian
//     const baseGaussian = x.map(xi => {
//       const dist = xi - currentX0;
//       return Math.exp(-(dist * dist) / (sigma * sigma));
//     });
    
//     // Upwind (slightly diffused)
//     if (config.parameters.schemes.includes('upwind')) {
//       data.upwind = baseGaussian.map(val => {
//         const spread = Math.exp(-time * diffusion);
//         return val * spread * (0.95 + 0.05 * Math.sin(time));
//       });
//     }
    
//     // Lax-Wendroff (less diffused)
//     if (config.parameters.schemes.includes('lax_wendroff')) {
//       data.lax_wendroff = baseGaussian.map(val => {
//         const spread = Math.exp(-time * diffusion * 0.5);
//         return val * spread * (0.98 + 0.02 * Math.cos(time));
//       });
//     }
    
//     // Van Leer (TVB - sharp)
//     if (config.parameters.schemes.includes('van_leer')) {
//       data.van_leer = baseGaussian.map(val => {
//         const spread = Math.exp(-time * diffusion * 0.2);
//         return val * spread;
//       });
//     }
    
//     return { x, data };
//   };

//   // Simplified 2D simulation visualization (mock data for frontend)
//   const generate2DData = (velocityX, velocityY, diffusion, time) => {
//     const L = 10.0;
//     const nx = 60;
//     const ny = 60;
    
//     const data = Array(ny).fill().map(() => Array(nx).fill(0));
    
//     // Calculate current position
//     const centerX = 2.5 + velocityX * time;
//     const centerY = 2.5 + velocityY * time;
    
//     // Generate Gaussian pulse
//     const sigma = 0.5;
    
//     for (let i = 0; i < ny; i++) {
//       for (let j = 0; j < nx; j++) {
//         const x = (j / (nx - 1)) * L;
//         const y = (i / (ny - 1)) * L;
        
//         const dx = x - centerX;
//         const dy = y - centerY;
//         const dist = dx * dx + dy * dy;
        
//         // Add diffusion effect
//         const spread = Math.exp(-time * diffusion);
//         const value = Math.exp(-dist / (sigma * sigma)) * spread;
        
//         data[i][j] = value;
//       }
//     }
    
//     return data;
//   };

//   // Draw 1D visualization
//   const draw1DVisualization = (time) => {
//     const canvas = canvas1DRef.current;
//     if (!canvas) return;
    
//     const ctx = canvas.getContext('2d');
//     const { width, height } = canvas;
    
//     // Clear canvas
//     ctx.clearRect(0, 0, width, height);
    
//     // Generate data
//     const { x, data } = generate1DData(
//       config.parameters.velocity,
//       config.parameters.diffusion,
//       time
//     );
    
//     // Draw grid
//     ctx.strokeStyle = '#e5e7eb';
//     ctx.lineWidth = 0.5;
//     ctx.beginPath();
//     for (let i = 0; i <= 10; i++) {
//       const xPos = (i / 10) * width;
//       ctx.moveTo(xPos, 0);
//       ctx.lineTo(xPos, height);
//       ctx.moveTo(0, (i / 10) * height);
//       ctx.lineTo(width, (i / 10) * height);
//     }
//     ctx.stroke();
    
//     // Draw axes
//     ctx.strokeStyle = '#374151';
//     ctx.lineWidth = 1;
//     ctx.beginPath();
//     ctx.moveTo(0, height - 20);
//     ctx.lineTo(width, height - 20);
//     ctx.moveTo(20, 0);
//     ctx.lineTo(20, height);
//     ctx.stroke();
    
//     // Define colors for schemes
//     const schemeColors = {
//       upwind: '#ef4444',
//       lax_wendroff: '#3b82f6',
//       van_leer: '#10b981'
//     };
    
//     // Draw each scheme
//     Object.entries(data).forEach(([scheme, values]) => {
//       ctx.strokeStyle = schemeColors[scheme];
//       ctx.lineWidth = 2;
//       ctx.beginPath();
      
//       values.forEach((value, index) => {
//         const xPos = (x[index] / 10) * (width - 40) + 20;
//         const yPos = height - 20 - (value * (height - 40));
        
//         if (index === 0) {
//           ctx.moveTo(xPos, yPos);
//         } else {
//           ctx.lineTo(xPos, yPos);
//         }
//       });
      
//       ctx.stroke();
//     });
    
//     // Draw labels
//     ctx.fillStyle = '#374151';
//     ctx.font = '12px Arial';
//     ctx.fillText('Distance (m)', width / 2 - 30, height - 5);
//     ctx.save();
//     ctx.translate(10, height / 2);
//     ctx.rotate(-Math.PI / 2);
//     ctx.fillText('Concentration', 0, 0);
//     ctx.restore();
    
//     // Draw time
//     ctx.fillStyle = '#6b7280';
//     ctx.font = '14px Arial';
//     ctx.fillText(`Time: ${time.toFixed(2)} s`, width - 100, 20);
    
//     // Draw legend
//     let legendY = 30;
//     Object.entries(schemeColors).forEach(([scheme, color]) => {
//       if (config.parameters.schemes.includes(scheme)) {
//         ctx.fillStyle = color;
//         ctx.fillRect(20, legendY, 15, 8);
//         ctx.fillStyle = '#374151';
//         ctx.font = '12px Arial';
//         const label = scheme === 'upwind' ? 'Upwind (1st order)' :
//                      scheme === 'lax_wendroff' ? 'Lax-Wendroff (2nd order)' :
//                      'Van Leer (TVD)';
//         ctx.fillText(label, 40, legendY + 8);
//         legendY += 20;
//       }
//     });
//   };

//   // Draw 2D visualization
//   const draw2DVisualization = (time) => {
//     const canvas = canvas2DRef.current;
//     if (!canvas) return;
    
//     const ctx = canvas.getContext('2d');
//     const { width, height } = canvas;
    
//     // Clear canvas
//     ctx.clearRect(0, 0, width, height);
    
//     // Generate data
//     const data = generate2DData(
//       config.parameters.velocity_x,
//       config.parameters.velocity_y,
//       config.parameters.diffusion,
//       time
//     );
    
//     const nx = data[0].length;
//     const ny = data.length;
    
//     // Create color gradient
//     const createColor = (value) => {
//       const intensity = Math.min(1, Math.max(0, value));
//       const r = Math.floor(255 * intensity);
//       const g = Math.floor(100 * intensity);
//       const b = Math.floor(100 + 155 * intensity);
//       return `rgb(${r},${g},${b})`;
//     };
    
//     // Draw heatmap
//     const cellWidth = width / nx;
//     const cellHeight = height / ny;
    
//     for (let i = 0; i < ny; i++) {
//       for (let j = 0; j < nx; j++) {
//         const value = data[i][j];
//         ctx.fillStyle = createColor(value);
//         ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
//       }
//     }
    
//     // Draw time
//     ctx.fillStyle = '#ffffff';
//     ctx.font = 'bold 16px Arial';
//     ctx.fillText(`Time: ${time.toFixed(2)} s`, 10, 25);
    
//     // Draw velocity vector
//     const centerX = width / 2;
//     const centerY = height / 2;
//     const vx = config.parameters.velocity_x;
//     const vy = config.parameters.velocity_y;
//     const magnitude = Math.sqrt(vx * vx + vy * vy);
//     const scale = 30;
    
//     if (magnitude > 0) {
//       const endX = centerX + (vx / magnitude) * scale;
//       const endY = centerY + (vy / magnitude) * scale;
      
//       // Draw arrow
//       ctx.strokeStyle = '#ffffff';
//       ctx.lineWidth = 2;
//       ctx.beginPath();
//       ctx.moveTo(centerX, centerY);
//       ctx.lineTo(endX, endY);
//       ctx.stroke();
      
//       // Draw arrowhead
//       const angle = Math.atan2(vy, vx);
//       ctx.beginPath();
//       ctx.moveTo(endX, endY);
//       ctx.lineTo(
//         endX - 8 * Math.cos(angle - Math.PI / 6),
//         endY - 8 * Math.sin(angle - Math.PI / 6)
//       );
//       ctx.lineTo(
//         endX - 8 * Math.cos(angle + Math.PI / 6),
//         endY - 8 * Math.sin(angle + Math.PI / 6)
//       );
//       ctx.closePath();
//       ctx.fillStyle = '#ffffff';
//       ctx.fill();
      
//       // Draw velocity label
//       ctx.fillStyle = '#ffffff';
//       ctx.font = '12px Arial';
//       ctx.fillText(
//         `Velocity: (${vx.toFixed(2)}, ${vy.toFixed(2)})`,
//         centerX - 50,
//         centerY - 20
//       );
//     }
//   };

//   // Start simulation animation
//   const startSimulation = () => {
//     setIsRunning(true);
//     setCurrentTime(0);
    
//     if (animationId) {
//       cancelAnimationFrame(animationId);
//     }
    
//     const animate = (timestamp) => {
//       const startTime = timestamp || performance.now();
//       const duration = config.parameters.duration;
      
//       const updateFrame = (currentTime) => {
//         if (currentTime > duration) {
//           setIsRunning(false);
//           return;
//         }
        
//         setCurrentTime(currentTime);
        
//         if (config.dimension === "1D") {
//           draw1DVisualization(currentTime);
//         } else {
//           draw2DVisualization(currentTime);
//         }
        
//         // Continue animation
//         const id = requestAnimationFrame((timestamp) => {
//           const elapsed = (timestamp - startTime) / 1000;
//           updateFrame(elapsed % (duration + 1));
//         });
//         setAnimationId(id);
//       };
      
//       updateFrame(0);
//     };
    
//     const id = requestAnimationFrame(animate);
//     setAnimationId(id);
    
//     // Set results for download/export
//     setSimulationResults({
//       type: config.dimension,
//       config: config,
//       timestamp: new Date().toISOString()
//     });
//   };

//   // Stop simulation
//   const stopSimulation = () => {
//     setIsRunning(false);
//     if (animationId) {
//       cancelAnimationFrame(animationId);
//       setAnimationId(null);
//     }
//   };

//   // Reset simulation
//   const resetSimulation = () => {
//     stopSimulation();
//     setCurrentTime(0);
    
//     if (config.dimension === "1D") {
//       draw1DVisualization(0);
//     } else {
//       draw2DVisualization(0);
//     }
//   };

//   // Export configuration
//   const exportConfig = () => {
//     const configStr = JSON.stringify(config, null, 2);
//     const blob = new Blob([configStr], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `convection_diffusion_config_${config.dimension.toLowerCase()}.json`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   // Export results
//   const exportResults = () => {
//     if (!simulationResults) return;
    
//     const resultsStr = JSON.stringify(simulationResults, null, 2);
//     const blob = new Blob([resultsStr], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `simulation_results_${Date.now()}.json`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   // Initialize canvases
//   useEffect(() => {
//     if (config.dimension === "1D") {
//       draw1DVisualization(0);
//     } else {
//       draw2DVisualization(0);
//     }
    
//     return () => {
//       if (animationId) {
//         cancelAnimationFrame(animationId);
//       }
//     };
//   }, [config]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8 pt-6">
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
//             Convection-Diffusion Solver
//           </h1>
//           <p className="text-gray-600 max-w-3xl mx-auto">
//             Visualize numerical solutions to convection-diffusion equations using different schemes
//           </p>
//           <div className="w-24 h-1 bg-blue-600 mx-auto mt-4"></div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Panel - Configuration */}
//           <div className="space-y-6">
//             {/* Dimension Selection */}
//             <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
//               <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b border-gray-200">
//                 Configuration
//               </h2>

//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-3">
//                   Dimension:
//                 </label>
//                 <div className="grid grid-cols-2 gap-3">
//                   <button
//                     onClick={() => handleDimensionChange("1D")}
//                     className={`px-4 py-3 rounded-lg transition ${config.dimension === "1D" 
//                       ? 'bg-blue-600 text-white shadow-md' 
//                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//                   >
//                     1D Simulation
//                   </button>
//                   <button
//                     onClick={() => handleDimensionChange("2D")}
//                     className={`px-4 py-3 rounded-lg transition ${config.dimension === "2D" 
//                       ? 'bg-blue-600 text-white shadow-md' 
//                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//                   >
//                     2D Simulation
//                   </button>
//                 </div>
//               </div>

//               {/* Scheme Selection (1D only) */}
//               {config.dimension === "1D" && (
//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-3">
//                     Numerical Schemes:
//                   </label>
//                   <div className="space-y-2">
//                     {['upwind', 'lax_wendroff', 'van_leer'].map(scheme => (
//                       <div key={scheme} className="flex items-center">
//                         <input
//                           type="checkbox"
//                           id={`scheme-${scheme}`}
//                           checked={config.parameters.schemes.includes(scheme)}
//                           onChange={() => handleSchemeToggle(scheme)}
//                           className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                         />
//                         <label htmlFor={`scheme-${scheme}`} className="ml-2 text-gray-700">
//                           {scheme === 'upwind' ? '1st-Order Upwind' :
//                            scheme === 'lax_wendroff' ? '2nd-Order Lax-Wendroff' :
//                            'TVD Van Leer Limiter'}
//                         </label>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Parameters */}
//               <div className="space-y-4">
//                 {config.dimension === "1D" ? (
//                   <>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Velocity: {config.parameters.velocity.toFixed(2)}
//                       </label>
//                       <input
//                         type="range"
//                         min="-2"
//                         max="2"
//                         step="0.1"
//                         value={config.parameters.velocity}
//                         onChange={(e) => handleParamChange('velocity', e.target.value)}
//                         className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                       />
//                       <div className="flex justify-between text-xs text-gray-500">
//                         <span>-2.0</span>
//                         <span>0</span>
//                         <span>2.0</span>
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Diffusion Coefficient: {config.parameters.diffusion.toFixed(3)}
//                       </label>
//                       <input
//                         type="range"
//                         min="0"
//                         max="0.1"
//                         step="0.001"
//                         value={config.parameters.diffusion}
//                         onChange={(e) => handleParamChange('diffusion', e.target.value)}
//                         className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                       />
//                       <div className="flex justify-between text-xs text-gray-500">
//                         <span>0</span>
//                         <span>0.05</span>
//                         <span>0.1</span>
//                       </div>
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         X-Velocity: {config.parameters.velocity_x.toFixed(2)}
//                       </label>
//                       <input
//                         type="range"
//                         min="-1"
//                         max="1"
//                         step="0.1"
//                         value={config.parameters.velocity_x}
//                         onChange={(e) => handleParamChange('velocity_x', e.target.value)}
//                         className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                       />
//                       <div className="flex justify-between text-xs text-gray-500">
//                         <span>-1.0</span>
//                         <span>0</span>
//                         <span>1.0</span>
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Y-Velocity: {config.parameters.velocity_y.toFixed(2)}
//                       </label>
//                       <input
//                         type="range"
//                         min="-1"
//                         max="1"
//                         step="0.1"
//                         value={config.parameters.velocity_y}
//                         onChange={(e) => handleParamChange('velocity_y', e.target.value)}
//                         className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                       />
//                       <div className="flex justify-between text-xs text-gray-500">
//                         <span>-1.0</span>
//                         <span>0</span>
//                         <span>1.0</span>
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Diffusion: {config.parameters.diffusion.toFixed(3)}
//                       </label>
//                       <input
//                         type="range"
//                         min="0"
//                         max="0.2"
//                         step="0.005"
//                         value={config.parameters.diffusion}
//                         onChange={(e) => handleParamChange('diffusion', e.target.value)}
//                         className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                       />
//                       <div className="flex justify-between text-xs text-gray-500">
//                         <span>0</span>
//                         <span>0.1</span>
//                         <span>0.2</span>
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Grid Size: {config.parameters.grid_size}
//                   </label>
//                   <input
//                     type="range"
//                     min="20"
//                     max="400"
//                     step="20"
//                     value={config.parameters.grid_size}
//                     onChange={(e) => handleParamChange('grid_size', e.target.value)}
//                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                   />
//                   <div className="flex justify-between text-xs text-gray-500">
//                     <span>Coarse</span>
//                     <span>Medium</span>
//                     <span>Fine</span>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Duration: {config.parameters.duration} s
//                   </label>
//                   <input
//                     type="range"
//                     min="1"
//                     max="20"
//                     step="1"
//                     value={config.parameters.duration}
//                     onChange={(e) => handleParamChange('duration', e.target.value)}
//                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                   />
//                   <div className="flex justify-between text-xs text-gray-500">
//                     <span>1s</span>
//                     <span>10s</span>
//                     <span>20s</span>
//                   </div>
//                 </div>
//               </div>

//               {/* File Upload */}
//               <div className="mt-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Load Configuration from JSON:
//                 </label>
//                 <input
//                   type="file"
//                   accept=".json"
//                   onChange={handleConfigUpload}
//                   className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                 />
//               </div>
//             </div>

//             {/* Controls */}
//             <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
//               <h3 className="text-lg font-bold text-gray-800 mb-4">Controls</h3>
              
//               <div className="space-y-3">
//                 <div className="grid grid-cols-3 gap-3">
//                   <button
//                     onClick={startSimulation}
//                     disabled={isRunning}
//                     className={`px-4 py-3 rounded-lg font-medium transition ${isRunning 
//                       ? 'bg-gray-300 cursor-not-allowed' 
//                       : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
//                   >
//                     {isRunning ? 'Running...' : 'Start'}
//                   </button>
                  
//                   <button
//                     onClick={stopSimulation}
//                     disabled={!isRunning}
//                     className={`px-4 py-3 rounded-lg font-medium transition ${!isRunning 
//                       ? 'bg-gray-300 cursor-not-allowed' 
//                       : 'bg-red-600 hover:bg-red-700 text-white'}`}
//                   >
//                     Stop
//                   </button>
                  
//                   <button
//                     onClick={resetSimulation}
//                     className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition"
//                   >
//                     Reset
//                   </button>
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                   <button
//                     onClick={exportConfig}
//                     className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center justify-center space-x-2"
//                   >
//                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
//                     </svg>
//                     <span>Export Config</span>
//                   </button>
                  
//                   <button
//                     onClick={exportResults}
//                     disabled={!simulationResults}
//                     className={`px-4 py-3 font-medium rounded-lg transition flex items-center justify-center space-x-2 ${!simulationResults 
//                       ? 'bg-gray-300 cursor-not-allowed' 
//                       : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
//                   >
//                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
//                     </svg>
//                     <span>Export Results</span>
//                   </button>
//                 </div>
//               </div>

//               {/* Progress */}
//               <div className="mt-6">
//                 <div className="flex justify-between text-sm text-gray-600 mb-1">
//                   <span>Time: {currentTime.toFixed(2)} s</span>
//                   <span>Total: {config.parameters.duration} s</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div 
//                     className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                     style={{ width: `${(currentTime / config.parameters.duration) * 100}%` }}
//                   ></div>
//                 </div>
//               </div>

//               {/* Stats */}
//               {simulationResults && (
//                 <div className="mt-6 pt-4 border-t border-gray-200">
//                   <h4 className="font-semibold text-gray-700 mb-2">Simulation Info</h4>
//                   <div className="space-y-1 text-sm text-gray-600">
//                     <div className="flex justify-between">
//                       <span>Dimension:</span>
//                       <span className="font-medium">{simulationResults.type}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Schemes:</span>
//                       <span className="font-medium">
//                         {config.dimension === "1D" 
//                           ? config.parameters.schemes.join(', ')
//                           : 'Upwind (2D)'}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Status:</span>
//                       <span className={`font-medium ${isRunning ? 'text-green-600' : 'text-gray-600'}`}>
//                         {isRunning ? 'Running' : 'Stopped'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Right Panel - Visualization */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Visualization */}
//             <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-2xl font-bold text-blue-700">
//                   {config.dimension} Simulation Visualization
//                 </h2>
//                 <div className="text-sm text-gray-500">
//                   {config.dimension === "1D" 
//                     ? `Velocity: ${config.parameters.velocity.toFixed(2)}, Diffusion: ${config.parameters.diffusion.toFixed(3)}`
//                     : `Velocity: (${config.parameters.velocity_x.toFixed(2)}, ${config.parameters.velocity_y.toFixed(2)}), Diffusion: ${config.parameters.diffusion.toFixed(3)}`}
//                 </div>
//               </div>
              
//               <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
//                 {config.dimension === "1D" ? (
//                   <canvas
//                     ref={canvas1DRef}
//                     width={800}
//                     height={500}
//                     className="w-full h-auto"
//                   />
//                 ) : (
//                   <canvas
//                     ref={canvas2DRef}
//                     width={800}
//                     height={500}
//                     className="w-full h-auto"
//                   />
//                 )}
//               </div>
              
//               <div className="mt-4 text-sm text-gray-600">
//                 <p>
//                   {config.dimension === "1D" 
//                     ? "Showing 1D convection-diffusion of a Gaussian pulse. Different numerical schemes show varying levels of numerical diffusion and oscillation."
//                     : "Showing 2D convection-diffusion of a Gaussian pulse moving through the domain. Colors represent concentration levels."}
//                 </p>
//               </div>
//             </div>

//             {/* Legend & Info */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-lg p-5 border border-blue-200">
//                 <h3 className="text-lg font-bold text-blue-800 mb-3">Numerical Schemes</h3>
//                 <ul className="space-y-2 text-sm text-blue-700">
//                   <li className="flex items-start">
//                     <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-2"></div>
//                     <span><strong>Upwind:</strong> 1st-order accurate, stable but diffusive</span>
//                   </li>
//                   <li className="flex items-start">
//                     <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></div>
//                     <span><strong>Lax-Wendroff:</strong> 2nd-order accurate, less diffusive but can oscillate</span>
//                   </li>
//                   <li className="flex items-start">
//                     <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></div>
//                     <span><strong>Van Leer:</strong> TVD limiter, prevents oscillations while maintaining accuracy</span>
//                   </li>
//                 </ul>
//               </div>
              
//               <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-5 border border-purple-200">
//                 <h3 className="text-lg font-bold text-purple-800 mb-3">CFD Tips</h3>
//                 <ul className="space-y-2 text-sm text-purple-700">
//                   <li className="flex items-start">
//                     <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-2"></div>
//                     <span>High velocity + low diffusion = convection-dominated flow</span>
//                   </li>
//                   <li className="flex items-start">
//                     <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-2"></div>
//                     <span>Low velocity + high diffusion = diffusion-dominated flow</span>
//                   </li>
//                   <li className="flex items-start">
//                     <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-2"></div>
//                     <span>Use finer grid for sharper gradients</span>
//                   </li>
//                   <li className="flex items-start">
//                     <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-2"></div>
//                     <span>Monitor CFL number for stability</span>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ConvectionDiffusionSolver;



import React, { useState, useEffect, useRef } from 'react';

const ConvectionDiffusionSolver = () => {
  // Default configurations
  const defaultConfigs = {
    "1D": {
      dimension: "1D",
      parameters: {
        velocity: 1.0,
        diffusion: 0.01,
        grid_size: 200,
        duration: 5.0,
        schemes: ["upwind", "lax_wendroff", "van_leer"],
        cfl_number: 0.8
      }
    },
    "2D": {
      dimension: "2D",
      parameters: {
        velocity_x: 0.5,
        velocity_y: 0.5,
        diffusion: 0.05,
        grid_size: 60,
        duration: 10.0
      }
    }
  };

  // State for configuration
  const [config, setConfig] = useState(defaultConfigs["1D"]);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [animationId, setAnimationId] = useState(null);
  
  // Refs for canvases
  const canvas1DRef = useRef(null);
  const canvas2DRef = useRef(null);

  // Helper function to validate and parse configuration
  const validateAndParseConfig = (content) => {
    // Clean markdown code blocks if present
    let cleaned = content
      .replace(/^```json\s*/i, '')
      .replace(/```$/g, '')
      .replace(/^```\s*/i, '') // Also handle ``` without json
      .trim();
    
    try {
      const data = JSON.parse(cleaned);
      
      // Validate required structure
      if (!data.dimension) {
        throw new Error('Missing "dimension" field');
      }
      
      const dimension = data.dimension.toUpperCase();
      if (!['1D', '2D'].includes(dimension)) {
        throw new Error('Dimension must be "1D" or "2D"');
      }
      
      // Ensure parameters exist
      if (!data.parameters) {
        data.parameters = {};
      }
      
      // Set default values based on dimension
      if (dimension === '1D') {
        data.parameters = {
          velocity: data.parameters.velocity || 1.0,
          diffusion: data.parameters.diffusion || 0.01,
          grid_size: data.parameters.grid_size || 200,
          duration: data.parameters.duration || 5.0,
          schemes: data.parameters.schemes || ["upwind", "lax_wendroff", "van_leer"],
          cfl_number: data.parameters.cfl_number || 0.8
        };
        data.dimension = "1D";
      } else {
        data.parameters = {
          velocity_x: data.parameters.velocity_x || 0.5,
          velocity_y: data.parameters.velocity_y || 0.5,
          diffusion: data.parameters.diffusion || 0.05,
          grid_size: data.parameters.grid_size || 60,
          duration: data.parameters.duration || 10.0
        };
        data.dimension = "2D";
      }
      
      return data;
    } catch (parseError) {
      // Try to provide helpful error messages
      if (cleaned.includes('```')) {
        throw new Error('File contains markdown formatting. Please upload pure JSON.');
      }
      throw parseError;
    }
  };

  // Handle dimension change
  const handleDimensionChange = (dim) => {
    setConfig(defaultConfigs[dim]);
    setSimulationResults(null);
    setCurrentTime(0);
    if (animationId) {
      cancelAnimationFrame(animationId);
      setAnimationId(null);
    }
  };

  // Handle parameter changes
  const handleParamChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: key.includes('grid_size') || key.includes('duration') 
          ? parseInt(value) || 0 
          : parseFloat(value) || 0
      }
    }));
  };

  // Handle scheme selection
  const handleSchemeToggle = (scheme) => {
    if (config.dimension !== "1D") return;
    
    setConfig(prev => {
      const schemes = [...prev.parameters.schemes];
      const index = schemes.indexOf(scheme);
      
      if (index >= 0) {
        schemes.splice(index, 1);
      } else {
        schemes.push(scheme);
      }
      
      return {
        ...prev,
        parameters: {
          ...prev.parameters,
          schemes
        }
      };
    });
  };

  // Handle config file upload
  const handleConfigUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file extension
    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('Please select a JSON file (.json)');
      e.target.value = ''; // Clear the file input
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const validatedConfig = validateAndParseConfig(content);
        
        setConfig(validatedConfig);
        setSimulationResults(null);
        setCurrentTime(0);
        if (animationId) {
          cancelAnimationFrame(animationId);
          setAnimationId(null);
        }
        
        // Show success message
        alert(`Configuration loaded successfully!\nDimension: ${validatedConfig.dimension}`);
        
      } catch (error) {
        console.error('Config validation failed:', error);
        alert(`Failed to load configuration:\n\n${error.message}\n\nPlease check that your file contains valid JSON in the correct format.`);
        e.target.value = ''; // Clear the file input
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      e.target.value = ''; // Clear the file input
    };
    
    reader.readAsText(file);
  };

  // Download sample configuration
  const downloadSampleConfig = (dimension) => {
    const sampleConfig = dimension === "1D" 
      ? {
          dimension: "1D",
          parameters: {
            velocity: 1.0,
            diffusion: 0.01,
            grid_size: 200,
            duration: 5.0,
            schemes: ["upwind", "lax_wendroff", "van_leer"],
            cfl_number: 0.8
          }
        }
      : {
          dimension: "2D",
          parameters: {
            velocity_x: 0.5,
            velocity_y: 0.5,
            diffusion: 0.05,
            grid_size: 60,
            duration: 10.0
          }
        };
    
    const blob = new Blob([JSON.stringify(sampleConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_config_${dimension.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simplified 1D simulation visualization (mock data for frontend)
  const generate1DData = (velocity, diffusion, time) => {
    const L = 10.0;
    const nx = 200;
    const x = Array.from({ length: nx }, (_, i) => (i / (nx - 1)) * L);
    
    // Initial Gaussian pulse
    const x0 = L/4;
    const sigma = 0.5;
    
    // Calculate current position based on velocity
    const currentX0 = x0 + velocity * time;
    
    // Generate data for each scheme
    const data = {};
    
    // Base Gaussian
    const baseGaussian = x.map(xi => {
      const dist = xi - currentX0;
      return Math.exp(-(dist * dist) / (sigma * sigma));
    });
    
    // Upwind (slightly diffused)
    if (config.parameters.schemes.includes('upwind')) {
      data.upwind = baseGaussian.map(val => {
        const spread = Math.exp(-time * diffusion);
        return val * spread * (0.95 + 0.05 * Math.sin(time));
      });
    }
    
    // Lax-Wendroff (less diffused)
    if (config.parameters.schemes.includes('lax_wendroff')) {
      data.lax_wendroff = baseGaussian.map(val => {
        const spread = Math.exp(-time * diffusion * 0.5);
        return val * spread * (0.98 + 0.02 * Math.cos(time));
      });
    }
    
    // Van Leer (TVB - sharp)
    if (config.parameters.schemes.includes('van_leer')) {
      data.van_leer = baseGaussian.map(val => {
        const spread = Math.exp(-time * diffusion * 0.2);
        return val * spread;
      });
    }
    
    return { x, data };
  };

  // Simplified 2D simulation visualization (mock data for frontend)
  const generate2DData = (velocityX, velocityY, diffusion, time) => {
    const L = 10.0;
    const nx = 60;
    const ny = 60;
    
    const data = Array(ny).fill().map(() => Array(nx).fill(0));
    
    // Calculate current position
    const centerX = 2.5 + velocityX * time;
    const centerY = 2.5 + velocityY * time;
    
    // Generate Gaussian pulse
    const sigma = 0.5;
    
    for (let i = 0; i < ny; i++) {
      for (let j = 0; j < nx; j++) {
        const x = (j / (nx - 1)) * L;
        const y = (i / (ny - 1)) * L;
        
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = dx * dx + dy * dy;
        
        // Add diffusion effect
        const spread = Math.exp(-time * diffusion);
        const value = Math.exp(-dist / (sigma * sigma)) * spread;
        
        data[i][j] = value;
      }
    }
    
    return data;
  };

  // Draw 1D visualization
  const draw1DVisualization = (time) => {
    const canvas = canvas1DRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Generate data
    const { x, data } = generate1DData(
      config.parameters.velocity,
      config.parameters.diffusion,
      time
    );
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
      const xPos = (i / 10) * width;
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, height);
      const yPos = (i / 10) * height;
      ctx.moveTo(0, yPos);
      ctx.lineTo(width, yPos);
    }
    ctx.stroke();
    
    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height - 20);
    ctx.lineTo(width, height - 20);
    ctx.moveTo(20, 0);
    ctx.lineTo(20, height);
    ctx.stroke();
    
    // Define colors for schemes
    const schemeColors = {
      upwind: '#ef4444',
      lax_wendroff: '#3b82f6',
      van_leer: '#10b981'
    };
    
    // Draw each scheme
    Object.entries(data).forEach(([scheme, values]) => {
      ctx.strokeStyle = schemeColors[scheme];
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      values.forEach((value, index) => {
        const xPos = (x[index] / 10) * (width - 40) + 20;
        const yPos = height - 20 - (value * (height - 40));
        
        if (index === 0) {
          ctx.moveTo(xPos, yPos);
        } else {
          ctx.lineTo(xPos, yPos);
        }
      });
      
      ctx.stroke();
    });
    
    // Draw labels
    ctx.fillStyle = '#374151';
    ctx.font = '14px Arial';
    ctx.fillText('Distance (m)', width / 2 - 40, height - 5);
    ctx.save();
    ctx.translate(10, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Concentration', 0, 0);
    ctx.restore();
    
    // Draw time
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Time: ${time.toFixed(2)} s`, width - 120, 25);
    
    // Draw legend
    let legendY = 30;
    Object.entries(schemeColors).forEach(([scheme, color]) => {
      if (config.parameters.schemes.includes(scheme)) {
        ctx.fillStyle = color;
        ctx.fillRect(20, legendY, 15, 8);
        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        const label = scheme === 'upwind' ? 'Upwind (1st order)' :
                     scheme === 'lax_wendroff' ? 'Lax-Wendroff (2nd order)' :
                     'Van Leer (TVD)';
        ctx.fillText(label, 40, legendY + 8);
        legendY += 20;
      }
    });
  };

  // Draw 2D visualization
  const draw2DVisualization = (time) => {
    const canvas = canvas2DRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Generate data
    const data = generate2DData(
      config.parameters.velocity_x,
      config.parameters.velocity_y,
      config.parameters.diffusion,
      time
    );
    
    const nx = data[0].length;
    const ny = data.length;
    
    // Create color gradient
    const createColor = (value) => {
      const intensity = Math.min(1, Math.max(0, value));
      const r = Math.floor(255 * intensity);
      const g = Math.floor(100 * intensity);
      const b = Math.floor(100 + 155 * intensity);
      return `rgb(${r},${g},${b})`;
    };
    
    // Draw heatmap
    const cellWidth = width / nx;
    const cellHeight = height / ny;
    
    for (let i = 0; i < ny; i++) {
      for (let j = 0; j < nx; j++) {
        const value = data[i][j];
        ctx.fillStyle = createColor(value);
        ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
      }
    }
    
    // Draw time
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Time: ${time.toFixed(2)} s`, 10, 25);
    
    // Draw velocity vector
    const centerX = width / 2;
    const centerY = height / 2;
    const vx = config.parameters.velocity_x;
    const vy = config.parameters.velocity_y;
    const magnitude = Math.sqrt(vx * vx + vy * vy);
    const scale = 30;
    
    if (magnitude > 0) {
      const endX = centerX + (vx / magnitude) * scale;
      const endY = centerY + (vy / magnitude) * scale;
      
      // Draw arrow
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Draw arrowhead
      const angle = Math.atan2(vy, vx);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - 8 * Math.cos(angle - Math.PI / 6),
        endY - 8 * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - 8 * Math.cos(angle + Math.PI / 6),
        endY - 8 * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      
      // Draw velocity label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.fillText(
        `Velocity: (${vx.toFixed(2)}, ${vy.toFixed(2)})`,
        centerX - 50,
        centerY - 20
      );
    }
    
    // Draw color scale
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText('Low', 10, height - 30);
    ctx.fillText('High', width - 50, height - 30);
    
    // Draw color bar
    const barWidth = width - 100;
    const barHeight = 10;
    const barY = height - 40;
    
    for (let i = 0; i < barWidth; i++) {
      const value = i / barWidth;
      ctx.fillStyle = createColor(value);
      ctx.fillRect(50 + i, barY, 1, barHeight);
    }
  };

  // Start simulation animation
  const startSimulation = () => {
    setIsRunning(true);
    setCurrentTime(0);
    
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    
    const startTime = performance.now();
    const duration = config.parameters.duration;
    
    const animate = (timestamp) => {
      const elapsed = (timestamp - startTime) / 1000;
      const currentTimeValue = Math.min(elapsed, duration);
      
      setCurrentTime(currentTimeValue);
      
      if (config.dimension === "1D") {
        draw1DVisualization(currentTimeValue);
      } else {
        draw2DVisualization(currentTimeValue);
      }
      
      if (currentTimeValue < duration) {
        const id = requestAnimationFrame(animate);
        setAnimationId(id);
      } else {
        setIsRunning(false);
      }
    };
    
    const id = requestAnimationFrame(animate);
    setAnimationId(id);
    
    // Set results for download/export
    setSimulationResults({
      type: config.dimension,
      config: config,
      timestamp: new Date().toISOString()
    });
  };

  // Stop simulation
  const stopSimulation = () => {
    setIsRunning(false);
    if (animationId) {
      cancelAnimationFrame(animationId);
      setAnimationId(null);
    }
  };

  // Reset simulation
  const resetSimulation = () => {
    stopSimulation();
    setCurrentTime(0);
    
    if (config.dimension === "1D") {
      draw1DVisualization(0);
    } else {
      draw2DVisualization(0);
    }
  };

  // Export configuration
  const exportConfig = () => {
    const configStr = JSON.stringify(config, null, 2);
    const blob = new Blob([configStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `convection_diffusion_config_${config.dimension.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export results
  const exportResults = () => {
    if (!simulationResults) return;
    
    const resultsStr = JSON.stringify(simulationResults, null, 2);
    const blob = new Blob([resultsStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation_results_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Initialize canvases
  useEffect(() => {
    if (config.dimension === "1D") {
      draw1DVisualization(0);
    } else {
      draw2DVisualization(0);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [config]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Convection-Diffusion Solver
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Visualize numerical solutions to convection-diffusion equations using different schemes
          </p>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Configuration */}
          <div className="space-y-6">
            {/* Dimension Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b border-gray-200">
                Configuration
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Dimension:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDimensionChange("1D")}
                    className={`px-4 py-3 rounded-lg transition ${config.dimension === "1D" 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    1D Simulation
                  </button>
                  <button
                    onClick={() => handleDimensionChange("2D")}
                    className={`px-4 py-3 rounded-lg transition ${config.dimension === "2D" 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    2D Simulation
                  </button>
                </div>
              </div>

              {/* Scheme Selection (1D only) */}
              {config.dimension === "1D" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Numerical Schemes:
                  </label>
                  <div className="space-y-2">
                    {['upwind', 'lax_wendroff', 'van_leer'].map(scheme => (
                      <div key={scheme} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`scheme-${scheme}`}
                          checked={config.parameters.schemes.includes(scheme)}
                          onChange={() => handleSchemeToggle(scheme)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`scheme-${scheme}`} className="ml-2 text-gray-700">
                          {scheme === 'upwind' ? '1st-Order Upwind' :
                           scheme === 'lax_wendroff' ? '2nd-Order Lax-Wendroff' :
                           'TVD Van Leer Limiter'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parameters */}
              <div className="space-y-4">
                {config.dimension === "1D" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Velocity: {config.parameters.velocity.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.1"
                        value={config.parameters.velocity}
                        onChange={(e) => handleParamChange('velocity', e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>-2.0</span>
                        <span>0</span>
                        <span>2.0</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diffusion Coefficient: {config.parameters.diffusion.toFixed(3)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="0.1"
                        step="0.001"
                        value={config.parameters.diffusion}
                        onChange={(e) => handleParamChange('diffusion', e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>0.05</span>
                        <span>0.1</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        X-Velocity: {config.parameters.velocity_x.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={config.parameters.velocity_x}
                        onChange={(e) => handleParamChange('velocity_x', e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>-1.0</span>
                        <span>0</span>
                        <span>1.0</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Y-Velocity: {config.parameters.velocity_y.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={config.parameters.velocity_y}
                        onChange={(e) => handleParamChange('velocity_y', e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>-1.0</span>
                        <span>0</span>
                        <span>1.0</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diffusion: {config.parameters.diffusion.toFixed(3)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="0.2"
                        step="0.005"
                        value={config.parameters.diffusion}
                        onChange={(e) => handleParamChange('diffusion', e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>0.1</span>
                        <span>0.2</span>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grid Size: {config.parameters.grid_size}
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="400"
                    step="20"
                    value={config.parameters.grid_size}
                    onChange={(e) => handleParamChange('grid_size', e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Coarse</span>
                    <span>Medium</span>
                    <span>Fine</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration: {config.parameters.duration} s
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={config.parameters.duration}
                    onChange={(e) => handleParamChange('duration', e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1s</span>
                    <span>10s</span>
                    <span>20s</span>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Load Configuration from JSON:
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleConfigUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500">
                    Upload a valid JSON configuration file.
                    <button
                      type="button"
                      onClick={() => downloadSampleConfig(config.dimension)}
                      className="ml-1 text-blue-600 hover:text-blue-800 underline"
                    >
                      Download sample {config.dimension} config
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Controls</h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={startSimulation}
                    disabled={isRunning}
                    className={`px-4 py-3 rounded-lg font-medium transition ${isRunning 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    {isRunning ? 'Running...' : 'Start'}
                  </button>
                  
                  <button
                    onClick={stopSimulation}
                    disabled={!isRunning}
                    className={`px-4 py-3 rounded-lg font-medium transition ${!isRunning 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700 text-white'}`}
                  >
                    Stop
                  </button>
                  
                  <button
                    onClick={resetSimulation}
                    className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition"
                  >
                    Reset
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={exportConfig}
                    className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Export Config</span>
                  </button>
                  
                  <button
                    onClick={exportResults}
                    disabled={!simulationResults}
                    className={`px-4 py-3 font-medium rounded-lg transition flex items-center justify-center space-x-2 ${!simulationResults 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <span>Export Results</span>
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Time: {currentTime.toFixed(2)} s</span>
                  <span>Total: {config.parameters.duration} s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (currentTime / config.parameters.duration) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              {simulationResults && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-2">Simulation Info</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Dimension:</span>
                      <span className="font-medium">{simulationResults.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Schemes:</span>
                      <span className="font-medium">
                        {config.dimension === "1D" 
                          ? config.parameters.schemes.join(', ')
                          : 'Upwind (2D)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`font-medium ${isRunning ? 'text-green-600' : 'text-gray-600'}`}>
                        {isRunning ? 'Running' : 'Stopped'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Visualization */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visualization */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-700">
                  {config.dimension} Simulation Visualization
                </h2>
                <div className="text-sm text-gray-500">
                  {config.dimension === "1D" 
                    ? `Velocity: ${config.parameters.velocity.toFixed(2)}, Diffusion: ${config.parameters.diffusion.toFixed(3)}`
                    : `Velocity: (${config.parameters.velocity_x.toFixed(2)}, ${config.parameters.velocity_y.toFixed(2)}), Diffusion: ${config.parameters.diffusion.toFixed(3)}`}
                </div>
              </div>
              
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                {config.dimension === "1D" ? (
                  <canvas
                    ref={canvas1DRef}
                    width={800}
                    height={500}
                    className="w-full h-auto"
                  />
                ) : (
                  <canvas
                    ref={canvas2DRef}
                    width={800}
                    height={500}
                    className="w-full h-auto"
                  />
                )}
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  {config.dimension === "1D" 
                    ? "Showing 1D convection-diffusion of a Gaussian pulse. Different numerical schemes show varying levels of numerical diffusion and oscillation."
                    : "Showing 2D convection-diffusion of a Gaussian pulse moving through the domain. Colors represent concentration levels."}
                </p>
              </div>
            </div>

            {/* Legend & Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-lg p-5 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-3">Numerical Schemes</h3>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-2"></div>
                    <span><strong>Upwind:</strong> 1st-order accurate, stable but diffusive</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></div>
                    <span><strong>Lax-Wendroff:</strong> 2nd-order accurate, less diffusive but can oscillate</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></div>
                    <span><strong>Van Leer:</strong> TVD limiter, prevents oscillations while maintaining accuracy</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-5 border border-purple-200">
                <h3 className="text-lg font-bold text-purple-800 mb-3">CFD Tips</h3>
                <ul className="space-y-2 text-sm text-purple-700">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-2"></div>
                    <span>High velocity + low diffusion = convection-dominated flow</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-2"></div>
                    <span>Low velocity + high diffusion = diffusion-dominated flow</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-2"></div>
                    <span>Use finer grid for sharper gradients</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-2"></div>
                    <span>Monitor CFL number for stability</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvectionDiffusionSolver;