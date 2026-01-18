"use client";

import { useState, useEffect, useRef } from "react";
import { animate, Timeline, stagger } from "animejs";
import { Upload, ArrowRight, Gift, Music, Heart, Zap, Sparkles, Star, Disc } from "lucide-react";
import { cn } from "./lib/utils";
import WrappedExperience from "@/components/WrappedExperience";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [wrappedData, setWrappedData] = useState<any>(null);
  const [showUnwrap, setShowUnwrap] = useState(false);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = new (Timeline as any)({
      easing: 'easeOutExpo',
    });

    tl
      .add({
        targets: '.poster-line',
        translateX: [-100, 0],
        opacity: [0, 1],
        delay: stagger(100),
        duration: 800,
      })
      .add({
        targets: '.upload-container',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 600,
      }, '-=400')
      .add({
        targets: '.sticker-entry',
        rotate: [20, -2],
        scale: [0, 1],
        opacity: [0, 1],
        delay: stagger(100),
        duration: 500,
      }, '-=300')
      .add({
        targets: '.floating-shape',
        scale: [0, 1],
        opacity: [0, 0.3],
        delay: stagger(200),
        duration: 1000,
      }, '-=800');
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.name.endsWith('.json'));
      setFiles(prev => [...prev, ...newFiles]);

      animate('.upload-container', {
        rotate: [0, -1, 1, 0],
        duration: 400,
        easing: 'easeInOutSine'
      });
    }
  };

  const clearFiles = () => {
    setFiles([]);
    animate('.upload-container', {
      scale: [1, 0.95, 1],
      duration: 300
    });
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

      setTimeout(() => {
        animate('.unwrap-action', {
          scale: [0.5, 1],
          opacity: [0, 1],
          rotate: [10, 0],
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
    return <WrappedExperience data={wrappedData} onReset={() => {
      setWrappedData(null);
      setFiles([]);
      setShowUnwrap(false);
    }} />;
  }

  return (
    <main className="min-h-screen bg-wrapped-brutalist bg-grid-white flex flex-col items-center justify-center p-4 md:p-12 text-white overflow-hidden relative">

      {/* Decorative Floating Shapes */}
      <div className="floating-shape absolute top-[10%] left-[5%] w-80 h-80 bg-wrapped-pink rounded-full blur-[100px]" />
      <div className="floating-shape absolute bottom-[10%] right-[5%] w-[30rem] h-[30rem] bg-wrapped-blue rounded-full blur-[120px]" />
      <div className="floating-shape absolute top-[40%] right-[15%] w-64 h-64 bg-wrapped-yellow rounded-full blur-[80px]" />

      {/* Background Icons */}
      <div className="absolute top-20 left-20 opacity-20 rotate-12 sticker-entry">
        <Disc className="w-40 h-40 animate-spin-slow" />
      </div>
      <div className="absolute bottom-20 right-20 opacity-20 -rotate-12 sticker-entry">
        <Star className="w-40 h-40 animate-pulse" />
      </div>

      <div className="max-w-7xl w-full flex flex-col items-center space-y-16 relative z-10">

        {/* Centered Header Section */}
        <div className="text-center space-y-8">
          <div className="inline-block">
            <div className="sticker sticker-entry bg-wrapped-yellow text-black text-2xl px-8 py-3 mb-6">2024 EDITION</div>
          </div>
          <h1 ref={titleRef} className="text-wrapped-poster text-8xl md:text-[13rem] leading-[0.75] tracking-tighter">
            <div className="poster-line">YOUR</div>
            <div className="poster-line text-wrapped-outline">CHAT</div>
            <div className="poster-line text-wrapped-pink">WRAPPED</div>
          </h1>

          <div className="poster-line max-w-2xl mx-auto pt-6">
            <p className="text-3xl md:text-5xl font-black italic tracking-tight text-white/90 leading-tight">
              The words you said. <span className="text-wrapped-blue">The vibes you sent.</span>
            </p>
          </div>
        </div>

        {/* Prominent Upload Section */}
        <div className="w-full max-w-3xl">
          <div ref={uploadRef} className="upload-container w-full">
            {!showUnwrap ? (
              <div className="space-y-10">
                <label className="wrapped-card block p-16 md:p-24 cursor-pointer relative overflow-hidden group bg-white">
                  <div className="absolute inset-0 bg-wrapped-blue/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <input type="file" multiple accept=".json" className="hidden" onChange={handleFileChange} />
                  <div className="flex flex-col items-center space-y-12 relative z-10">
                    <div className="p-12 bg-black text-white rounded-[2.5rem] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl">
                      <Upload className="w-20 h-20" />
                    </div>
                    <div className="text-center space-y-4">
                      <h3 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                        {files.length > 0 ? files.length + " FILES" : "DROP DATA"}
                      </h3>
                      <p className="text-black/40 font-bold italic text-2xl uppercase tracking-widest">JSON ONLY</p>
                    </div>
                  </div>
                </label>

                {files.length > 0 && (
                  <div className="space-y-6">
                    {/* File List Display */}
                    <div className="wrapped-card bg-black/80 text-white p-6 max-h-48 overflow-y-auto space-y-2 border-white/20">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-black uppercase tracking-widest opacity-60">Selected Files</span>
                        <button onClick={clearFiles} className="text-xs font-black uppercase tracking-widest text-wrapped-pink hover:underline">Clear All</button>
                      </div>
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center space-x-3 text-sm font-mono opacity-80">
                          <div className="w-2 h-2 bg-wrapped-green rounded-full" />
                          <span className="truncate">{file.name}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className={cn(
                        "w-full py-12 bg-wrapped-green text-black text-6xl font-black italic border-4 border-black shadow-[16px_16px_0px_black] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[20px_20px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[8px_8px_0px_black] transition-all flex items-center justify-center space-x-8",
                        isUploading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isUploading ? (
                        <div className="w-16 h-16 border-8 border-black/20 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>GENERATE</span>
                          <ArrowRight className="w-14 h-14" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="unwrap-action space-y-12">
                <button
                  onClick={() => setShowUnwrap(false)}
                  className="w-full py-20 bg-wrapped-pink text-white text-7xl font-black italic border-4 border-black shadow-[20px_20px_0px_black] hover:scale-[1.05] transition-transform active:scale-95 flex flex-col items-center justify-center space-y-8"
                >
                  <Gift className="w-32 h-32" />
                  <span>UNWRAP</span>
                </button>
                <div className="sticker bg-white text-black mx-auto block text-center text-3xl py-4 px-10">YOUR STORY IS READY</div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Icons Flair */}
        <div className="flex space-x-10 sticker-entry pt-8">
          <div className="p-6 bg-wrapped-blue text-black rounded-3xl rotate-6 shadow-xl"><Music className="w-12 h-12" /></div>
          <div className="p-6 bg-wrapped-purple text-white rounded-3xl -rotate-12 shadow-xl"><Heart className="w-12 h-12" /></div>
          <div className="p-6 bg-wrapped-orange text-black rounded-3xl rotate-12 shadow-xl"><Zap className="w-12 h-12" /></div>
          <div className="p-6 bg-wrapped-green text-black rounded-3xl -rotate-6 shadow-xl"><Sparkles className="w-12 h-12" /></div>
        </div>
      </div>

      {/* Simplified Branding */}
      <div className="absolute bottom-12 left-12 opacity-20">
        <div className="text-wrapped-poster text-6xl">WRAPPED</div>
      </div>
    </main>
  );
}
