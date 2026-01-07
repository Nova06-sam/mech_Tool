import React from 'react';
import { TurbulenceCalculator } from '../data/logic/physicsCal';

const TurbulenceCalculatorDisplay = ({ inputs }) => {
  const U = inputs.velocity_mag || 10.0;
  const I = inputs.turb_intensity || 0.05;
  const L = inputs.length_scale || 0.1;
  
  const k = TurbulenceCalculator.calculate_k(U, I);
  const epsilon = TurbulenceCalculator.calculate_epsilon(k, L);
  const omega = TurbulenceCalculator.calculate_omega(k, epsilon);
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <h3 className="font-medium text-gray-700 mb-3">Calculated Turbulence Values</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-500">k</div>
          <div className="text-lg font-mono">{k.toExponential(3)} m²/s²</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">ε</div>
          <div className="text-lg font-mono">{epsilon.toExponential(3)} m²/s³</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">ω</div>
          <div className="text-lg font-mono">{omega.toExponential(3)} 1/s</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        Based on: U = {U} m/s, I = {(I*100).toFixed(1)}%, L = {L} m
      </div>
    </div>
  );
};

export default TurbulenceCalculatorDisplay;