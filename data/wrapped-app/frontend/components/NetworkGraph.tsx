"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";

import * as THREE from "three";
import { cn } from "@/app/lib/utils";

// Dynamically import ForceGraph components to avoid SSR issues
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center text-white/20 uppercase tracking-widest animate-pulse">Initializing 3D Space...</div>
});

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
    const [viewMode, setViewMode] = useState<"2D" | "3D">("3D");

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
            if (viewMode === "3D") {
                // Enable auto-rotation
                const controls = fgRef.current.controls();
                if (controls) {
                    controls.autoRotate = true;
                    controls.autoRotateSpeed = 1.5;
                }

                // Move camera closer
                fgRef.current.cameraPosition({ z: 300 });

                // Configure forces
                fgRef.current.d3Force("charge").strength(-400);
                fgRef.current.d3Force("link").distance(100);

                // Add a subtle wireframe cube to the scene
                const scene = fgRef.current.scene();
                if (scene) {
                    scene.children = scene.children.filter((c: any) => c.type !== "LineSegments");
                    const geometry = new THREE.BoxGeometry(1000, 1000, 1000);
                    const edges = new THREE.EdgesGeometry(geometry);
                    const line = new THREE.LineSegments(
                        edges,
                        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 })
                    );
                    scene.add(line);
                }
            } else {
                fgRef.current.d3Force("charge").strength(-500);
                fgRef.current.d3Force("link").distance(100);
            }

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
    }, [dimensions, viewMode, graphData]);


    return (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-4 md:space-y-6">
            <div className="text-center space-y-1 md:space-y-2">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-black uppercase">THE 3D INNER CIRCLE</h2>
                <p className="text-black/40 text-xs md:text-sm uppercase tracking-widest font-bold px-4">Auto-Orbiting 3D Space • Drag to Explore</p>
            </div>

            <div
                ref={containerRef}
                className="w-full flex-1 glass rounded-[2rem] md:rounded-[3rem] overflow-hidden relative min-h-[400px] md:min-h-[600px] border-4 border-black shadow-[8px_8px_0px_black] md:shadow-[12px_12px_0px_black]"
            >
                {/* View Toggle */}
                <div className="absolute top-4 right-4 md:top-6 md:right-6 z-[100] flex bg-white/90 backdrop-blur-md p-1 rounded-xl md:rounded-2xl border-2 border-black shadow-[4px_4px_0px_black]">
                    <button
                        onClick={() => setViewMode("2D")}
                        data-view="2D"
                        className={cn(
                            "px-3 py-1 md:px-6 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all",
                            viewMode === "2D" ? "bg-black text-white" : "text-black hover:bg-black/5"
                        )}
                    >
                        2D
                    </button>
                    <button
                        onClick={() => setViewMode("3D")}
                        className={cn(
                            "px-3 py-1 md:px-6 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all",
                            viewMode === "3D" ? "bg-black text-white" : "text-black hover:bg-black/5"
                        )}
                    >
                        3D
                    </button>
                </div>

                <div className="absolute inset-0">
                    {dimensions.width > 0 && (
                        viewMode === "3D" ? (
                            <ForceGraph3D
                                ref={fgRef}
                                graphData={graphData}
                                width={dimensions.width}
                                height={dimensions.height}
                                backgroundColor="rgba(0,0,0,0)"
                                nodeColor={() => "#000000"}
                                nodeLabel="id"
                                nodeRelSize={6}
                                nodeOpacity={1}
                                nodeThreeObject={(node: any) => {
                                    // Create a canvas for the label
                                    const canvas = document.createElement('canvas');
                                    const context = canvas.getContext('2d');
                                    const name = node.id;

                                    canvas.width = 256;
                                    canvas.height = 64;

                                    if (context) {
                                        context.font = 'Bold 32px Inter, system-ui, sans-serif';
                                        context.textAlign = 'center';
                                        context.textBaseline = 'middle';

                                        // Draw background for better legibility
                                        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
                                        const textWidth = context.measureText(name).width;
                                        context.fillRect(128 - (textWidth / 2) - 10, 12, textWidth + 20, 40);

                                        context.fillStyle = 'white';
                                        context.fillText(name, 128, 32);
                                    }

                                    const texture = new THREE.CanvasTexture(canvas);
                                    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
                                    const sprite = new THREE.Sprite(spriteMaterial);
                                    sprite.scale.set(20, 5, 1);
                                    sprite.position.y = 5; // Position above the node

                                    // Group node and label
                                    const group = new THREE.Group();
                                    const nodeGeometry = new THREE.SphereGeometry(2);
                                    const nodeMaterial = new THREE.MeshPhongMaterial({
                                        color: 0x000000,
                                        emissive: 0x000000,
                                        emissiveIntensity: 0.2,
                                        shininess: 100
                                    });
                                    const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);

                                    group.add(nodeMesh);
                                    group.add(sprite);
                                    return group;
                                }}
                                nodeThreeObjectExtend={false}
                                linkColor={(d: any) => {
                                    if (d.strength === "High") return "#FF4BAB";
                                    if (d.strength === "Medium") return "#FFD300";
                                    return "#4B91FF";
                                }}
                                linkWidth={4}
                                linkOpacity={0.8}
                                linkDirectionalParticles={2}
                                linkDirectionalParticleSpeed={0.002}
                                linkDirectionalParticleWidth={3}
                                linkDirectionalParticleColor={(d: any) => {
                                    if (d.strength === "High") return "#FF4BAB";
                                    if (d.strength === "Medium") return "#FFD300";
                                    return "#4B91FF";
                                }}
                                enableNodeDrag={true}
                                showNavInfo={false}
                            />
                        ) : (
                            <ForceGraph2D
                                ref={fgRef}
                                graphData={graphData}
                                width={dimensions.width}
                                height={dimensions.height}
                                backgroundColor="rgba(0,0,0,0)"
                                nodeColor={() => "#000000"}
                                nodeRelSize={6}
                                nodeCanvasObject={(node: any, ctx: any, globalScale: any) => {
                                    const label = node.id;
                                    const fontSize = 12 / globalScale;
                                    ctx.font = `${fontSize}px Inter`;
                                    const textWidth = ctx.measureText(label).width;
                                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                                    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                                    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2 - 8, bckgDimensions[0], bckgDimensions[1]);

                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'middle';
                                    ctx.fillStyle = 'white';
                                    ctx.fillText(label, node.x, node.y - 8);

                                    ctx.fillStyle = '#000000';
                                    ctx.beginPath(); ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false); ctx.fill();
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
                        )
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
