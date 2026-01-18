"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";


const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center text-white/20 uppercase tracking-widest animate-pulse">Initializing 2D Space...</div>
});

interface NetworkGraphProps {
    data: {
        nodes: any[];
        links: any[];
    };
}

export default function NetworkGraph({ data }: NetworkGraphProps) {
    const fgRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    // Format data for react-force-graph
    const graphData = useMemo(() => {
        if (!data) return { nodes: [], links: [] };

        const nodes = data.nodes.map((node) => ({
            ...node,
            x: (Math.random() - 0.5) * 1000,
            y: (Math.random() - 0.5) * 1000,
            z: (Math.random() - 0.5) * 1000
        }));

        const links = data.links.map(link => ({
            ...link,
            source: typeof link.source === 'string' ? link.source : link.source.id,
            target: typeof link.target === 'string' ? link.target : link.target.id
        }));

        return { nodes, links };
    }, [data]);

    useEffect(() => {
        if (fgRef.current && dimensions.width > 0 && graphData.nodes.length > 0) {
            fgRef.current.d3Force("charge").strength(-500);
            fgRef.current.d3Force("link").distance(100);

            // Aggressive zoom to fit with multiple attempts as engine stabilizes
            const zoom = () => {
                if (fgRef.current) {
                    // Use minimal padding (5) for an even tighter fit
                    fgRef.current.zoomToFit(400, 5);
                }
            };

            // Run zoom multiple times to catch the engine as it expands
            zoom();
            const timers = [100, 500, 1000, 2000, 4000].map(ms => setTimeout(zoom, ms));

            return () => timers.forEach(clearTimeout);
        }
    }, [dimensions, graphData]);


    return (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-4 md:space-y-6">
            <div className="text-center space-y-1 md:space-y-2">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-black uppercase">THE SQUAD NETWORK</h2>
                <p className="text-black/40 text-xs md:text-sm uppercase tracking-widest font-bold px-4">Interactive Map • Drag to Explore</p>
            </div>

            <div
                ref={containerRef}
                className="w-full flex-1 glass rounded-[2rem] md:rounded-[3rem] overflow-hidden relative min-h-[400px] md:min-h-[600px] border-4 border-black shadow-[8px_8px_0px_black] md:shadow-[12px_12px_0px_black]"
            >

                <div className="absolute inset-0">
                    {dimensions.width > 0 && (
                        <ForceGraph2D
                            ref={fgRef}
                            graphData={graphData}
                            width={dimensions.width}
                            height={dimensions.height}
                            backgroundColor="rgba(0,0,0,0)"
                            nodeColor={() => "#000000"}
                            nodeRelSize={4}
                            nodeCanvasObject={(node: any, ctx: any, globalScale: any) => {
                                const label = node.id;
                                const fontSize = 10 / globalScale;
                                ctx.font = `${fontSize}px Inter, sans-serif`;
                                const textWidth = ctx.measureText(label).width;
                                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                                ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2 - 6, bckgDimensions[0], bckgDimensions[1]);

                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillStyle = 'white';
                                ctx.fillText(label, node.x, node.y - 6);

                                ctx.fillStyle = '#000000';
                                ctx.beginPath(); ctx.arc(node.x, node.y, 3, 0, 2 * Math.PI, false); ctx.fill();
                            }}
                            linkColor={(d: any) => {
                                if (d.strength === "High") return "#FF4BAB";
                                if (d.strength === "Medium") return "#FFD300";
                                return "#4B91FF";
                            }}
                            linkWidth={2}
                            linkDirectionalParticles={2}
                            linkDirectionalParticleWidth={2}
                        />
                    )}
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-auto flex flex-wrap justify-center md:justify-start gap-3 md:gap-6 text-[10px] md:text-[12px] uppercase tracking-widest font-black pointer-events-none bg-white/90 backdrop-blur-md p-3 md:p-6 rounded-xl md:rounded-2xl border-2 md:border-4 border-black shadow-[4px_4px_0px_black] md:shadow-[6px_6px_0px_black] text-black">
                    <div className="flex items-center space-x-2 md:space-x-3">
                        <div className="w-3 h-1 md:w-4 md:h-1 bg-[#FF4BAB]" />
                        <span>High Vibe</span>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-3">
                        <div className="w-3 h-1 md:w-4 md:h-1 bg-[#FFD300]" />
                        <span>Medium Vibe</span>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-3">
                        <div className="w-3 h-1 md:w-4 md:h-1 bg-[#4B91FF]" />
                        <span>Low Vibe</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
