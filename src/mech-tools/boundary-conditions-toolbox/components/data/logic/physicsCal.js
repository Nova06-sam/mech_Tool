export class TurbulenceCalculator {
  static C_mu = 0.09;

  static calculate_k(U, I) {
    return 1.5 * Math.pow(U * I, 2);
  }

  static calculate_epsilon(k, L) {
    return (Math.pow(this.C_mu, 0.75) * Math.pow(k, 1.5)) / L;
  }

  static calculate_omega(k, epsilon) {
    return epsilon / (this.C_mu * k);
  }

  static getDefaults(field, inputs) {
    const U = inputs.velocity_mag || 10.0;
    const I = inputs.turb_intensity || 0.05;
    const L = inputs.length_scale || 0.1;
    
    const k = this.calculate_k(U, I);
    const epsilon = this.calculate_epsilon(k, L);
    
    if (field === 'k') return k;
    if (field === 'epsilon') return epsilon;
    if (field === 'omega') return this.calculate_omega(k, epsilon);
    return 0.0;
  }
}