"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";

// Dynamically import ForceGraph3D to avoid SSR issues with Three.js
const ForceGraph3D = dynamic(() => import("react-force-graph").then(mod => mod.ForceGraph3D), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center text-white/20 uppercase tracking-widest animate-pulse">Initializing 3D Space...</div>
});

interface NetworkGraphProps {
    data: {
        nodes: any[];
        links: any[];
    };
}

export default function NetworkGraph({ data }: NetworkGraphProps) {
    const fgRef = useRef<any>();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth * 0.95,
                height: window.innerHeight * 0.8
            });
        };
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    // Format data for react-force-graph
    const graphData = useMemo(() => {
        if (!data) return { nodes: [], links: [] };

        // Create nodes with fixed positions in a 3D sphere for stability
        const nodes = data.nodes.map((node, i) => {
            const phi = Math.acos(-1 + (2 * i) / data.nodes.length);
            const theta = Math.sqrt(data.nodes.length * Math.PI) * phi;
            const radius = 350; // Increased radius for "wider" feel

            return {
                ...node,
                fx: radius * Math.cos(theta) * Math.sin(phi),
                fy: radius * Math.sin(theta) * Math.sin(phi),
                fz: radius * Math.cos(phi)
            };
        });

        const links = data.links.map(link => ({
            ...link,
            source: typeof link.source === 'string' ? link.source : link.source.id,
            target: typeof link.target === 'string' ? link.target : link.target.id
        }));

        return { nodes, links };
    }, [data]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-4xl font-black tracking-tighter text-wrapped-blue uppercase">THE 3D INNER CIRCLE</h2>
                <p className="text-white/40 text-sm uppercase tracking-widest">Rotatable 3D Network • Drag to Orbit</p>
            </div>

            {/* 1.7x Wider Container (max-w-none and large width) */}
            <div className="w-full max-w-none px-4 md:px-12 flex-1 glass rounded-3xl overflow-hidden relative min-h-[500px]">
                <div className="absolute inset-0">
                    <ForceGraph3D
                        ref={fgRef}
                        graphData={graphData}
                        width={dimensions.width}
                        height={dimensions.height}
                        backgroundColor="rgba(0,0,0,0)"
                        nodeColor={() => "#1DB954"}
                        nodeLabel="id"
                        nodeRelSize={6}
                        linkColor={(d: any) => {
                            if (d.strength === "High") return "#FF4BAB";
                            if (d.strength === "Medium") return "#FFD300";
                            return "#4B91FF";
                        }}
                        linkWidth={0.5}
                        linkOpacity={0.3}
                        enableNodeDrag={false}
                        showNavInfo={false}
                    />
                </div>

                <div className="absolute bottom-6 left-6 flex space-x-6 text-[10px] uppercase tracking-widest font-black pointer-events-none">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-1 bg-wrapped-pink" />
                        <span>High Vibe</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-1 bg-wrapped-yellow" />
                        <span>Medium Vibe</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-1 bg-[#4B91FF]" />
                        <span>Low Vibe</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
