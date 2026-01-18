"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, RefreshCcw, Share2, Trophy, MessageSquare, Zap, Moon, Sun, Ghost, Sparkles } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface WrappedExperienceProps {
    data: any;
    onReset: () => void;
}

import NetworkGraph from "./NetworkGraph";

export default function WrappedExperience({ data, onReset }: WrappedExperienceProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: "intro",
            component: <IntroSlide />,
        },
        {
            id: "top-words",
            component: <TopWordsSlide data={data.stats.top_words_overall} />,
        },
        {
            id: "aura",
            component: <AuraSlide data={data.rankings.most_aura} />,
        },
        {
            id: "network",
            component: <NetworkGraph data={data.network} />,
        },
        {
            id: "time",
            component: <TimeSlide night={data.rankings.night_owls} morning={data.rankings.morning_person} />,
        },
        {
            id: "profanity",
            component: <ProfanitySlide data={data.rankings.most_profanity} />,
        },
        {
            id: "summary",
            component: <SummarySlide data={data} onReset={onReset} />,
        },
    ];

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-spotify-black overflow-hidden flex flex-col">
            {/* Progress Bar */}
            <div className="absolute top-4 left-4 right-4 flex space-x-1 z-50">
                {slides.map((_, i) => (
                    <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: i <= currentSlide ? "100%" : "0%" }}
                            className="h-full bg-white"
                        />
                    </div>
                ))}
            </div>

            {/* Slide Content */}
            <div className="flex-1 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        className="absolute inset-0 flex items-center justify-center p-6"
                    >
                        {slides[currentSlide].component}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="absolute inset-y-0 left-0 w-1/4 z-40 cursor-pointer" onClick={prevSlide} />
            <div className="absolute inset-y-0 right-0 w-3/4 z-40 cursor-pointer" onClick={nextSlide} />

            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-4 z-50 pointer-events-none">
                <p className="text-white/40 text-sm font-mono tracking-widest uppercase">
                    Tap to continue
                </p>
            </div>
        </div>
    );
}

function IntroSlide() {
    return (
        <div className="text-center space-y-8">
            <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="w-48 h-48 bg-wrapped-gradient rounded-full mx-auto flex items-center justify-center shadow-2xl"
            >
                <Sparkles className="w-24 h-24 text-white" />
            </motion.div>
            <div className="space-y-2">
                <h2 className="text-7xl font-black tracking-tighter italic">READY?</h2>
                <p className="text-2xl font-medium text-white/60">Your year in chat is here.</p>
            </div>
        </div>
    );
}

function TopWordsSlide({ data }: { data: any[] }) {
    return (
        <div className="w-full max-w-lg space-y-12">
            <h2 className="text-5xl font-black tracking-tighter text-wrapped-pink">YOUR TOP WORDS</h2>
            <div className="space-y-4">
                {data.slice(0, 5).map(([word, count], i) => (
                    <motion.div
                        key={word}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between group"
                    >
                        <span className="text-4xl font-bold tracking-tight group-hover:text-wrapped-yellow transition-colors">
                            {i + 1}. {word}
                        </span>
                        <span className="text-2xl font-mono text-white/40">{count}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function AuraSlide({ data }: { data: any[] }) {
    const topAura = data[0];
    return (
        <div className="text-center space-y-12">
            <motion.div
                animate={{
                    boxShadow: ["0 0 20px #FFD300", "0 0 60px #FFD300", "0 0 20px #FFD300"],
                    scale: [1, 1.05, 1]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-40 h-40 bg-wrapped-yellow rounded-full mx-auto flex items-center justify-center"
            >
                <Zap className="w-20 h-20 text-spotify-black" />
            </motion.div>
            <div className="space-y-4">
                <h2 className="text-4xl font-bold text-white/60 uppercase tracking-widest">Most Aura</h2>
                <h3 className="text-6xl font-black tracking-tighter text-wrapped-yellow">{topAura[0]}</h3>
                <p className="text-xl text-white/40 font-mono">Ratio: {topAura[1].toFixed(2)}</p>
            </div>
        </div>
    );
}

function TimeSlide({ night, morning }: { night: any[], morning: any[] }) {
    const topNight = night[0];
    const topMorning = morning[0];
    return (
        <div className="grid grid-cols-1 gap-12 w-full max-w-md">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-3xl bg-wrapped-blue/10 border border-wrapped-blue/20 space-y-4"
            >
                <div className="flex items-center space-x-4">
                    <Moon className="w-8 h-8 text-wrapped-blue" />
                    <h3 className="text-2xl font-bold uppercase tracking-tight">Night Owl</h3>
                </div>
                <p className="text-4xl font-black">{topNight[0]}</p>
                <p className="text-white/40 font-mono">{topNight[1]} late night messages</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-8 rounded-3xl bg-wrapped-yellow/10 border border-wrapped-yellow/20 space-y-4"
            >
                <div className="flex items-center space-x-4">
                    <Sun className="w-8 h-8 text-wrapped-yellow" />
                    <h3 className="text-2xl font-bold uppercase tracking-tight">Morning Person</h3>
                </div>
                <p className="text-4xl font-black">{topMorning[0]}</p>
                <p className="text-white/40 font-mono">{topMorning[1]} early bird messages</p>
            </motion.div>
        </div>
    );
}

function ProfanitySlide({ data }: { data: any[] }) {
    const top = data[0];
    return (
        <div className="text-center space-y-12">
            <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="w-40 h-40 bg-wrapped-pink rounded-full mx-auto flex items-center justify-center"
            >
                <Ghost className="w-20 h-20 text-white" />
            </motion.div>
            <div className="space-y-4">
                <h2 className="text-4xl font-bold text-white/60 uppercase tracking-widest">Potty Mouth</h2>
                <h3 className="text-6xl font-black tracking-tighter text-wrapped-pink">{top[0]}</h3>
                <p className="text-xl text-white/40 font-mono">{top[1]} swear words sent</p>
            </div>
        </div>
    );
}

function SummarySlide({ data, onReset }: { data: any, onReset: () => void }) {
    return (
        <div className="text-center space-y-12 w-full max-w-2xl">
            <h2 className="text-6xl font-black tracking-tighter">THAT'S YOUR YEAR.</h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 glass rounded-2xl text-left">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Top Word</p>
                    <p className="text-xl font-bold">{data.stats.top_words_overall[0][0]}</p>
                </div>
                <div className="p-6 glass rounded-2xl text-left">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Most Aura</p>
                    <p className="text-xl font-bold">{data.rankings.most_aura[0][0]}</p>
                </div>
            </div>

            <div className="flex flex-col space-y-4 pt-8">
                <button
                    onClick={() => alert("Sharing feature coming soon!")}
                    className="w-full py-4 bg-white text-spotify-black rounded-full font-bold text-xl flex items-center justify-center space-x-2 hover:scale-105 transition-transform"
                >
                    <Share2 className="w-6 h-6" />
                    <span>SHARE YOUR WRAPPED</span>
                </button>
                <button
                    onClick={onReset}
                    className="w-full py-4 bg-white/10 text-white rounded-full font-bold text-xl flex items-center justify-center space-x-2 hover:bg-white/20 transition-colors"
                >
                    <RefreshCcw className="w-6 h-6" />
                    <span>START OVER</span>
                </button>
            </div>
        </div>
    );
}
