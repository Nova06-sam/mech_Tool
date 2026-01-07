import { TurbulenceCalculator } from "./physicsCal";

export class InletRules {
  static determine_bc(patch, field, context) {
    if (field === 'U') return this.determine_U(patch, context);
    if (field === 'p') return this.determine_p(patch, context);
    if (['k', 'epsilon', 'omega'].includes(field)) return this.determine_turbulence(patch, field);
    return { type: 'zeroGradient' };
  }

  static determine_U(patch, context) {
    if ('velocity_mag' in patch.inputs) {
      const ux = patch.inputs.velocity_x || 0;
      const uy = patch.inputs.velocity_y || 0;
      const uz = patch.inputs.velocity_z || 0;
      return {
        type: 'fixedValue',
        value: `uniform (${ux} ${uy} ${uz})`,
        explanation: 'Velocity is explicitly known.'
      };
    }
    return { type: 'fixedValue', value: 'uniform (0 0 0)' };
  }

  static determine_p(patch, context) {
    return {
      type: 'zeroGradient',
      explanation: context.compressibility === 'compressible' 
        ? 'Standard for specified velocity inlet (compressible)' 
        : 'Pressure extrapolated (incompressible)'
    };
  }

  static determine_turbulence(patch, field) {
    const val = TurbulenceCalculator.getDefaults(field, patch.inputs);
    return {
      type: 'fixedValue',
      value: `uniform ${val}`,
      explanation: 'Fixed inlet turbulence based on intensity.'
    };
  }
}

export class OutletRules {
  static determine_bc(patch, field, context) {
    if (field === 'U') return this.determine_U(patch);
    if (field === 'p') return this.determine_p(patch);
    if (['k', 'epsilon', 'omega', 'nut'].includes(field)) {
      return { type: 'zeroGradient', explanation: 'Outlet assumes developed flow' };
    }
    return { type: 'zeroGradient' };
  }

  static determine_U(patch) {
    if (patch.is_backflow_possible) {
      return {
        type: 'inletOutlet',
        inletValue: 'uniform (0 0 0)',
        value: 'uniform (0 0 0)',
        explanation: 'Prevents unphysical inflow.'
      };
    }
    return { type: 'zeroGradient', explanation: 'Fully developed outflow.' };
  }

  static determine_p(patch) {
    const p_val = patch.inputs.pressure || 0;
    return {
      type: 'fixedValue',
      value: `uniform ${p_val}`,
      explanation: 'Outlet pressure pinned.'
    };
  }
}

export class WallRules {
  static determine_bc(patch, field, context) {
    if (field === 'U') return { type: 'noSlip', explanation: 'Standard no-slip wall' };
    if (field === 'p') return { type: 'zeroGradient', explanation: 'Wall is impermeable' };
    if (['k', 'epsilon', 'omega', 'nut'].includes(field)) {
      return this.determine_turbulence_wall(patch, field, context);
    }
    return { type: 'zeroGradient' };
  }

  static determine_turbulence_wall(patch, field, context) {
    const y_plus = patch.inputs.y_plus || 50;
    
    // Low Re
    if (y_plus < 1) {
      if (field === 'k') return { type: 'fixedValue', value: 'uniform 1e-15' };
      if (field === 'epsilon') return { type: 'fixedValue', value: 'uniform 1e-10' };
      if (field === 'omega') return { type: 'fixedValue', value: 'uniform 1e-10' };
      if (field === 'nut') return { type: 'calculated', value: 'uniform 0' };
    }
    
    // High Re
    else if (y_plus >= 30 && y_plus <= 300) {
      if (field === 'k') {
        return {
          type: 'kqRWallFunction',
          value: 'uniform 1e-6',
          explanation: 'Standard wall function'
        };
      }
      if (field === 'epsilon') {
        return {
          type: 'epsilonWallFunction',
          value: 'uniform 1e-6',
          explanation: 'Standard wall function'
        };
      }
      if (field === 'omega') {
        return {
          type: 'omegaWallFunction',
          value: 'uniform 1e-6',
          explanation: 'Standard wall function'
        };
      }
      if (field === 'nut') {
        if (patch.is_rough_wall) {
          const Ks = patch.inputs.roughness_height || 0.0;
          const Cs = patch.inputs.roughness_constant || 0.5;
          return {
            type: 'nutkRoughWallFunction',
            Ks: `uniform ${Ks}`,
            Cs: `uniform ${Cs}`
          };
        }
        return { type: 'nutkWallFunction', value: 'uniform 0' };
      }
    }
    
    // Buffer layer warning
    return {
      type: 'nutkWallFunction',
      value: 'uniform 0',
      warning: 'CRITICAL: y+ is in buffer layer (1 < y+ < 30).'
    };
  }
}