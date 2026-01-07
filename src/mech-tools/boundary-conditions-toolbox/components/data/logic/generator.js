import { InletRules, OutletRules, WallRules } from './ruleEngier';

export class BCGenerator {
  generate_all_files(context, boundaries) {
    const required_fields = ['U', 'p'];
    
    if (context.turbulence_model === 'kEpsilon') {
      required_fields.push('k', 'epsilon', 'nut');
    } else if (context.turbulence_model === 'kOmegaSST') {
      required_fields.push('k', 'omega', 'nut');
    }
    
    const generated_files = {};
    
    required_fields.forEach(field => {
      const content = this._generate_file_content(field, context, boundaries);
      generated_files[field] = content;
    });
    
    return generated_files;
  }
  
  _generate_file_content(field, context, boundaries) {
    const header = this._generate_file_header(field, context);
    let boundaryBlock = '\nboundaryField\n{\n';
    
    boundaries.forEach(patch => {
      let bc_data = {};
      
      switch(patch.face_type) {
        case 'inlet':
          bc_data = InletRules.determine_bc(patch, field, context);
          break;
        case 'wall':
          bc_data = WallRules.determine_bc(patch, field, context);
          break;
        case 'outlet':
          bc_data = OutletRules.determine_bc(patch, field, context);
          break;
        default:
          bc_data = { type: patch.face_type };
      }
      
      boundaryBlock += `    ${patch.name}\n`;
      boundaryBlock += '    {\n';
      boundaryBlock += `        type            ${bc_data.type};\n`;
      
      if (bc_data.value) boundaryBlock += `        value           ${bc_data.value};\n`;
      if (bc_data.p0) boundaryBlock += `        p0              ${bc_data.p0};\n`;
      if (bc_data.Ks) boundaryBlock += `        Ks              ${bc_data.Ks};\n`;
      if (bc_data.Cs) boundaryBlock += `        Cs              ${bc_data.Cs};\n`;
      if (bc_data.inletValue) boundaryBlock += `        inletValue      ${bc_data.inletValue};\n`;
      if (bc_data.warning) boundaryBlock += `        // WARNING: ${bc_data.warning}\n`;
      if (bc_data.explanation) boundaryBlock += `        // Note: ${bc_data.explanation}\n`;
      
      boundaryBlock += '    }\n\n';
    });
    
    boundaryBlock += '}';
    
    return header + boundaryBlock;
  }
  
  _generate_file_header(field, context) {
    const dimensions = this._get_dimensions(field, context);
    const fieldClass = field === 'U' ? 'volVectorField' : 'volScalarField';
    const defaultInternal = field === 'U' ? '(0 0 0)' : '0';
    
    return `/*--------------------------------*- C++ -*----------------------------------*\\
| =========                 |                                                 |
| \\\\      /  F ield         | OpenFOAM: The Open Source CFD Toolbox           |
|  \\\\    /   O peration     | Version:  v2012                                 |
|   \\\\  /    A nd           | Website:  www.openfoam.com                      |
|    \\\\/     M anipulation  |                                                 |
\\*---------------------------------------------------------------------------*/
FoamFile
{
    version     2.0;
    format      ascii;
    class       ${fieldClass};
    location    "0";
    object      ${field};
}
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

dimensions      ${dimensions};

internalField   uniform ${defaultInternal};

`;
  }
  
  _get_dimensions(field, context) {
    const dims_map = {
      'U': '[0 1 -1 0 0 0 0]',
      'p': context.compressibility === 'compressible' ? '[1 -1 -2 0 0 0 0]' : '[0 2 -2 0 0 0 0]',
      'k': '[0 2 -2 0 0 0 0]',
      'epsilon': '[0 2 -3 0 0 0 0]',
      'omega': '[0 0 -1 0 0 0 0]',
      'nut': '[0 2 -1 0 0 0 0]'
    };
    
    return dims_map[field] || '[0 0 0 0 0 0 0]';
  }
}