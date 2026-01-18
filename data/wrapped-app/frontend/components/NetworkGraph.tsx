"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface NetworkGraphProps {
    data: {
        nodes: any[];
        links: any[];
    };
}

export default function NetworkGraph({ data }: NetworkGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data) return;

        const width = window.innerWidth;
        const height = window.innerHeight * 0.6;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

        svg.selectAll("*").remove();

        const simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg.append("g")
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("stroke", (d: any) => {
                if (d.strength === "High") return "#FF4BAB";
                if (d.strength === "Medium") return "#FFD300";
                return "#ffffff20";
            })
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", (d: any) => (d.value / 10) + 1);

        const node = svg.append("g")
            .selectAll("g")
            .data(data.nodes)
            .join("g")
            .call(d3.drag<any, any>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("circle")
            .attr("r", 8)
            .attr("fill", "#1DB954");

        node.append("text")
            .text((d: any) => d.id)
            .attr("x", 12)
            .attr("y", 4)
            .attr("fill", "white")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("pointer-events", "none");

        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node
                .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        });

        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return () => {
            simulation.stop();
        };
    }, [data]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-4xl font-black tracking-tighter text-wrapped-blue">YOUR CHAT NETWORK</h2>
                <p className="text-white/40 text-sm uppercase tracking-widest">Who you vibe with most</p>
            </div>
            <div className="w-full flex-1 glass rounded-3xl overflow-hidden relative">
                <svg ref={svgRef} className="w-full h-full" />
                <div className="absolute bottom-4 left-4 flex space-x-4 text-[10px] uppercase tracking-widest font-bold">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-1 bg-wrapped-pink" />
                        <span>High Vibe</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-1 bg-wrapped-yellow" />
                        <span>Medium Vibe</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
