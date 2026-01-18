"use client";

import { useState, useEffect, useRef } from "react";
import { animate } from "animejs";
import { Upload, FileJson, Sparkles, ArrowRight, Gift } from "lucide-react";
import { cn } from "./lib/utils";
import WrappedExperience from "@/components/WrappedExperience";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [wrappedData, setWrappedData] = useState<any>(null);
  const [showUnwrap, setShowUnwrap] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Initial entry animation
    if (containerRef.current) {
      animate(containerRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 1000,
        easing: 'easeOutExpo'
      });
    }

    if (titleRef.current) {
      animate(titleRef.current, {
        opacity: [0, 1],
        translateX: [-20, 0],
        delay: 300,
        duration: 1000,
        easing: 'easeOutExpo'
      });
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setWrappedData(data);
      setShowUnwrap(true);

      // Animate the unwrap button appearance
      setTimeout(() => {
        animate('.unwrap-button', {
          scale: [0.8, 1],
          opacity: [0, 1],
          duration: 800,
          easing: 'easeOutElastic(1, .6)'
        });
      }, 100);

    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to process files. Make sure the backend is running.");
    } finally {
      setIsUploading(false);
    }
  };

  if (wrappedData && !showUnwrap) {
    return <WrappedExperience data={wrappedData} onReset={() => setWrappedData(null)} />;
  }

  return (
    <main className="min-h-screen bg-wrapped-gradient flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      <div
        ref={containerRef}
        className="max-w-2xl w-full glass rounded-[3rem] p-8 md:p-16 shadow-2xl space-y-12 relative overflow-hidden border border-white/20"
      >
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-wrapped-pink/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-wrapped-blue/20 rounded-full blur-3xl animate-pulse" />

        <div className="text-center space-y-6 relative z-10">
          <div className="inline-block p-4 bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
            <Sparkles className="w-12 h-12 text-wrapped-yellow animate-spin-slow" />
          </div>
          <h1 ref={titleRef} className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            <span className="italic block transform -skew-x-6">YOUR CHAT</span>
            <span className="text-wrapped-pink italic block transform -skew-x-6 mt-2">WRAPPED</span>
          </h1>
          <p className="text-xl text-white/70 font-light italic tracking-wide max-w-md mx-auto">
            Relive your digital conversations. Modernized, stylized, and ready to be <span className="text-white font-bold">unwrapped</span>.
          </p>
        </div>

        <div className="space-y-8 relative z-10">
          {!showUnwrap ? (
            <>
              <label
                className={cn(
                  "relative group block border-2 border-dashed border-white/10 rounded-[2rem] p-16 transition-all cursor-pointer overflow-hidden",
                  "hover:border-white/30 hover:bg-white/5",
                  files.length > 0 && "border-wrapped-blue bg-wrapped-blue/5"
                )}
              >
                <input
                  type="file"
                  multiple
                  accept=".json"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center space-y-6">
                  <div className="p-6 bg-white/10 rounded-2xl group-hover:rotate-12 transition-transform duration-500">
                    <Upload className="w-10 h-10" />
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold italic">
                      {files.length > 0 ? `${files.length} files ready` : "Drop your JSONs here"}
                    </p>
                    <p className="text-white/40 italic mt-2">or click to explore your files</p>
                  </div>
                </div>
              </label>

              {files.length > 0 && (
                <button
                  ref={buttonRef}
                  onClick={handleUpload}
                  disabled={isUploading}
                  className={cn(
                    "w-full py-6 rounded-2xl text-2xl font-black italic tracking-tight transition-all flex items-center justify-center space-x-3",
                    "bg-white text-spotify-black hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95",
                    isUploading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isUploading ? (
                    <div className="w-8 h-8 border-4 border-spotify-black/20 border-t-spotify-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>PREPARE MY WRAPPED</span>
                      <ArrowRight className="w-8 h-8" />
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="unwrap-button opacity-0">
              <button
                onClick={() => setShowUnwrap(false)}
                className="w-full py-8 rounded-[2.5rem] text-3xl font-black italic tracking-tighter bg-gradient-to-r from-wrapped-pink via-wrapped-yellow to-wrapped-blue text-white shadow-2xl hover:scale-[1.05] transition-transform active:scale-95 flex items-center justify-center space-x-4 group"
              >
                <Gift className="w-10 h-10 group-hover:rotate-12 transition-transform" />
                <span>UNWRAP NOW</span>
              </button>
              <p className="text-center mt-6 text-white/50 italic font-light">
                Your year in chat is ready. Click above to reveal.
              </p>
            </div>
          )}
        </div>

        <div className="pt-12 border-t border-white/5 text-center relative z-10">
          <p className="text-[10px] text-white/30 font-mono uppercase tracking-[0.3em] italic">
            Secure • Local • Private • 2024
          </p>
        </div>
      </div>
    </main>
  );
}
