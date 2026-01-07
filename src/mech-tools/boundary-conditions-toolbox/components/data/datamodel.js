// Data models that match Python backend
export const FlowTypes = ['internal', 'external'];
export const CompressibilityTypes = ['incompressible', 'compressible'];
export const TurbulenceModels = ['laminar', 'kEpsilon', 'kOmegaSST', 'SpalartAllmaras'];
export const FaceTypes = ['inlet', 'outlet', 'wall', 'symmetry', 'cyclic'];

export class SimulationContext {
  constructor(flow_type = 'internal', compressibility = 'incompressible', 
              turbulence_model = 'kEpsilon', heat_transfer = false) {
    this.flow_type = flow_type;
    this.compressibility = compressibility;
    this.turbulence_model = turbulence_model;
    this.heat_transfer = heat_transfer;
  }
}

export class BoundaryPatch {
  constructor(name, face_type, inputs = {}, is_backflow_possible = false, is_rough_wall = false) {
    this.name = name;
    this.face_type = face_type;
    this.inputs = { ...inputs };
    this.is_backflow_possible = is_backflow_possible;
    this.is_rough_wall = is_rough_wall;
  }
}