"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";

import * as THREE from "three";

// Dynamically import ForceGraph3D to avoid SSR issues with Three.js
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
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

    useEffect(() => {
        if (fgRef.current) {
            // Enable auto-rotation
            const controls = fgRef.current.controls();
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.8;

            // Add some distance to the camera
            fgRef.current.cameraPosition({ z: 800 });

            // Configure forces for a "contained" feel
            fgRef.current.d3Force("charge").strength(-200);
            fgRef.current.d3Force("link").distance(80);

            // Add a subtle wireframe cube to the scene
            const scene = fgRef.current.scene();
            const geometry = new THREE.BoxGeometry(800, 800, 800);
            const edges = new THREE.EdgesGeometry(geometry);
            const line = new THREE.LineSegments(
                edges,
                new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 })
            );
            scene.add(line);
        }
    }, [dimensions]);

    // Format data for react-force-graph
    const graphData = useMemo(() => {
        if (!data) return { nodes: [], links: [] };

        const nodes = data.nodes.map((node) => ({
            ...node,
            x: (Math.random() - 0.5) * 500,
            y: (Math.random() - 0.5) * 500,
            z: (Math.random() - 0.5) * 500
        }));

        const links = data.links.map(link => ({
            ...link,
            source: typeof link.source === 'string' ? link.source : link.source.id,
            target: typeof link.target === 'string' ? link.target : link.target.id
        }));

        return { nodes, links };
    }, [data]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-5xl font-black tracking-tighter text-black uppercase">THE 3D INNER CIRCLE</h2>
                <p className="text-black/40 text-sm uppercase tracking-widest font-bold">Auto-Orbiting 3D Space • Drag to Explore</p>
            </div>

            <div
                ref={containerRef}
                className="w-full flex-1 glass rounded-[3rem] overflow-hidden relative min-h-[600px] border-4 border-black shadow-[12px_12px_0px_black]"
            >
                <div className="absolute inset-0">
                    <ForceGraph3D
                        ref={fgRef}
                        graphData={graphData}
                        width={dimensions.width}
                        height={dimensions.height}
                        backgroundColor="rgba(0,0,0,0)"
                        nodeColor={() => "#1DB954"}
                        nodeLabel="id"
                        nodeRelSize={9}
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
                            sprite.scale.set(60, 15, 1);
                            sprite.position.y = 15; // Position above the node

                            // Group node and label
                            const group = new THREE.Group();
                            const nodeGeometry = new THREE.SphereGeometry(8);
                            const nodeMaterial = new THREE.MeshPhongMaterial({
                                color: 0x1DB954,
                                emissive: 0x1DB954,
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
                        linkWidth={2}
                        linkOpacity={0.4}
                        linkDirectionalParticles={4}
                        linkDirectionalParticleSpeed={0.005}
                        linkDirectionalParticleWidth={3}
                        linkDirectionalParticleColor={(d: any) => {
                            if (d.strength === "High") return "#FF4BAB";
                            if (d.strength === "Medium") return "#FFD300";
                            return "#4B91FF";
                        }}
                        enableNodeDrag={true}
                        showNavInfo={false}
                    />
                </div>

                {/* Legend */}
                <div className="absolute bottom-8 left-8 flex space-x-6 text-[12px] uppercase tracking-widest font-black pointer-events-none bg-white/90 backdrop-blur-md p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_black]">
                    <div className="flex items-center space-x-3">
                        <div className="w-4 h-1 bg-[#FF4BAB]" />
                        <span>High Vibe</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-4 h-1 bg-[#FFD300]" />
                        <span>Medium Vibe</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-4 h-1 bg-[#4B91FF]" />
                        <span>Low Vibe</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
