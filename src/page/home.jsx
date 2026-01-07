import React from 'react'
import { Zap } from 'lucide-react'
import { Link } from 'react-router'
export default function Home() {
    const cfdTools = [
        {
            title: "Turbulence Calculator",
            description: "Compute turbulence parameters (k, ε, ω) from velocity and intensity",
            icon: Zap,
            href: "/cfd-tools/turbulence-calculator",
        },
        {
            title: "y+ Calculator",
            description: "Calculate wall-plus distance for optimal mesh sizing near walls",
            icon: Zap,
            href: "/cfd-tools/y-plus-calculator",
        },
        {
            title: "Mesh Refinement Level",
            description: "Generate progressive mesh refinement ratios for convergence studies",
            icon: Zap,
            href: "/cfd-tools/mesh-refinement",
        },
        {
            title: "Boundary Condition Toolbox",
            description: "Quick reference for inlet, outlet, and wall boundary conditions",
            icon: Zap,
            href: "/cfd-tools/boundary-condition-toolbox",
        },
        {
            title: "Mesh Layer Calculator",
            description: "Compute boundary layer mesh with exponential spacing and growth ratios",
            icon: Zap,
            href: "/cfd-tools/mesh-layer-calculator",
        },
        {
            title: "Convection-Diffusion Solver",
            description: "Analyze Peclet number and recommend discretization schemes",
            icon: Zap,
            href: "/cfd-tools/convection-diffusion-solver",
        },
    ]
    return (
        <>
            <main>
                <div className='min-h-screen bg-linear-to-r from-cyan-500 to-blue-500'>
                    {/* title */}
                    <div className="text-center pt-10 mb-10 flex flex-col justify-center items-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Interactive CFD Tools</h2>
                        <p className="text-lg text-gray-50">Master CFD calculations with our collection of engineering tools</p>
                    </div>
                    <div className="grid md:grid-cols-2 px-20 lg:grid-cols-3 gap-6">
                        {cfdTools.map((tool, index) => (
                            <Link key={index} to={tool.href} className="block">
                                <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full hover:shadow-lg hover:border-emerald-200 transition-all duration-300 cursor-pointer group">
                                    {/* Card Header */}
                                    <div className=" border-b border-gray-100 p-4">
                                        <tool.icon className="h-10 w-10 text-cyan-500 mb-3 group-hover:scale-110 transition-transform" />
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-cyan-500 transition-colors">
                                            {tool.title}
                                        </h3>
                                        <hr className='text-gray-300 my-3'/>
                                         <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </>
    )
}
