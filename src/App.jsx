import { useState } from 'react'
import './App.css';
import TurbulenceBCCalculator from './mech-tools/turbulence-calculator/turbulence-calculator';
import YplusCalculator from './mech-tools/y_plus_calculator/y_plus_calculator';
import MeshRefinementVisualizer from './mech-tools/mesh-refinement-level/mesh-refinement-level';
import MeshLayDictWizard from './mech-tools/mesh-layering/mesh-layering';
import ConvectionDiffusionSolver from './mech-tools/convection-diffusion/convection-diffusion';
import ToolBox from './mech-tools/boundary-conditions-toolbox/condition-toolbox';
import Home from './page/home';
import { BrowserRouter ,Route ,Routes } from 'react-router';
function App() {
   const cfdTools = [
        {
            title: "Turbulence Calculator",
            href: "/cfd-tools/turbulence-calculator",
            ele:TurbulenceBCCalculator
        },
        {
            title: "y+ Calculator",
            href: "/cfd-tools/y-plus-calculator",
            ele:YplusCalculator
        },
        {
            title: "Mesh Refinement Level",
            href: "/cfd-tools/mesh-refinement",
            ele:MeshRefinementVisualizer
        },
        {
            title: "Boundary Condition Toolbox",
            href: "/cfd-tools/boundary-condition-toolbox",
            ele:ToolBox
        },
        {
            title: "Mesh Layer Calculator",
            href: "/cfd-tools/mesh-layer-calculator",
            ele:MeshLayDictWizard
        },
        {
            title: "Convection-Diffusion Solver",
            href: "/cfd-tools/convection-diffusion-solver",
            ele:ConvectionDiffusionSolver
        },
    ]

  return (
    <>
      <BrowserRouter>
           <Routes>
               <Route path='/' element={<Home/>}/>
               {cfdTools.map((item,i)=>{
                const Comp = item.ele
                return(
                  <>
                    <Route path={item.href} element={<Comp/>} />
                  </>
                )
               }) }
           </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
