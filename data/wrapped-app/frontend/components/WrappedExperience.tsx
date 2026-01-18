"use client";

import { useState, useEffect, useRef } from "react";
import { animate, Timeline, stagger } from "animejs";
import { ChevronRight, ChevronLeft, RefreshCcw, Share2, Trophy, MessageSquare, Zap, Moon, Sun, Ghost, Sparkles, Music, Heart } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface WrappedExperienceProps {
    data: any;
    onReset: () => void;
}

import NetworkGraph from "./NetworkGraph";

export default function WrappedExperience({ data, onReset }: WrappedExperienceProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slideRef = useRef<HTMLDivElement>(null);

    const slides = [
        { id: "intro", component: <IntroSlide />, bg: "bg-wrapped-pink" },
        { id: "top-words", component: <TopWordsSlide data={data.stats.top_words_overall} />, bg: "bg-wrapped-green" },
        { id: "aura", component: <AuraSlide data={data.rankings.most_aura} />, bg: "bg-wrapped-yellow" },
        { id: "reels", component: <ReelsSlide data={data.rankings.most_reels_sent} />, bg: "bg-wrapped-blue" },
        { id: "network", component: <NetworkGraph data={data.network_data} />, bg: "bg-wrapped-purple" },
        { id: "time", component: <TimeSlide night={data.rankings.night_owls} morning={data.rankings.morning_person} />, bg: "bg-wrapped-pink" },
        { id: "longest-word", component: <LongestWordSlide data={data.rankings.longest_word_sent} />, bg: "bg-wrapped-green" },
        { id: "likes-given", component: <LikesGivenSlide data={data.rankings.most_messages_liked} />, bg: "bg-wrapped-yellow" },
        { id: "profanity", component: <ProfanitySlide data={data.rankings.most_profanity} />, bg: "bg-wrapped-orange" },
        { id: "replied-to", component: <RepliedToSlide data={data.rankings.most_replied_to} />, bg: "bg-wrapped-blue" },
        { id: "summary", component: <SummarySlide data={data} onReset={onReset} />, bg: "bg-black" },
    ];

    useEffect(() => {
        if (slideRef.current) {
            animate(slideRef.current, {
                opacity: [0, 1],
                scale: [0.9, 1],
                rotate: [5, 0],
                duration: 600,
                easing: 'easeOutBack'
            });
        }
    }, [currentSlide]);

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
        <div className={cn("fixed inset-0 overflow-hidden flex flex-col z-50 transition-colors duration-700", slides[currentSlide].bg)}>
            {/* Progress Bar */}
            <div className="absolute top-8 left-8 right-8 flex space-x-2 z-50">
                {slides.map((_, i) => (
                    <div key={i} className="h-2 flex-1 bg-black/10 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full bg-black transition-all duration-500",
                                i <= currentSlide ? "w-full" : "w-0"
                            )}
                        />
                    </div>
                ))}
            </div>

            {/* Slide Content */}
            <div className="flex-1 relative z-10">
                <div
                    ref={slideRef}
                    key={currentSlide}
                    className="absolute inset-0 flex items-center justify-center p-6 md:p-12"
                >
                    {slides[currentSlide].component}
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-40 cursor-pointer" onClick={(e) => { e.stopPropagation(); prevSlide(); }} />
            <div className="absolute inset-y-0 right-0 w-2/3 z-40 cursor-pointer" onClick={(e) => { e.stopPropagation(); nextSlide(); }} />

            <div className="absolute bottom-12 left-0 right-0 flex justify-center z-50 pointer-events-none">
                <div className="sticker bg-black text-white text-sm animate-bounce">TAP TO CONTINUE</div>
            </div>
        </div>
    );
}

function IntroSlide() {
    return (
        <div className="text-center space-y-12">
            <div className="wrapped-card p-12 rotate-3 inline-block">
                <Sparkles className="w-32 h-32 text-wrapped-pink" />
            </div>
            <h2 className="text-wrapped-poster text-8xl md:text-[12rem] text-black leading-none">
                READY<br />FOR<br />THIS?
            </h2>
        </div>
    );
}

function TopWordsSlide({ data }: { data: any[] }) {
    useEffect(() => {
        animate('.word-row', {
            opacity: [0, 1],
            translateX: [-100, 0],
            delay: stagger(100),
            easing: 'easeOutExpo'
        });
    }, []);

    return (
        <div className="w-full max-w-4xl space-y-12">
            <h2 className="text-wrapped-poster text-7xl md:text-9xl text-black">TOP WORDS</h2>
            <div className="space-y-4">
                {data.slice(0, 5).map(([word, count], i) => (
                    <div key={word} className="word-row opacity-0 flex items-end space-x-4">
                        <span className="text-wrapped-poster text-6xl md:text-8xl text-black/20">{i + 1}</span>
                        <div className="wrapped-card flex-1 p-4 md:p-6 flex justify-between items-center">
                            <span className="text-3xl md:text-5xl font-black italic uppercase">{word}</span>
                            <span className="text-xl md:text-2xl font-mono font-black">{count}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AuraSlide({ data }: { data: any[] }) {
    const topAura = data[0];
    return (
        <div className="text-center space-y-12">
            <div className="relative inline-block">
                <div className="wrapped-card p-8 rounded-full animate-spin-slow">
                    <Zap className="w-24 h-24" />
                </div>
                <div className="sticker bg-black text-white absolute -top-4 -right-4">ELITE VIBES</div>
            </div>
            <div className="space-y-4">
                <h2 className="text-wrapped-poster text-5xl md:text-7xl text-black/40">MOST AURA</h2>
                <h3 className="text-wrapped-poster text-8xl md:text-[10rem] text-black">{topAura[0]}</h3>
                <div className="sticker bg-white text-black text-2xl">RATIO: {topAura[1].toFixed(2)}</div>
            </div>
        </div>
    );
}

function TimeSlide({ night, morning }: { night: any[], morning: any[] }) {
    const topNight = night[0];
    const topMorning = morning[0];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
            <div className="wrapped-card p-12 space-y-8 -rotate-2">
                <div className="flex items-center space-x-4">
                    <Moon className="w-12 h-12" />
                    <h3 className="text-3xl font-black italic">NIGHT OWL</h3>
                </div>
                <div className="space-y-2">
                    <p className="text-wrapped-poster text-6xl md:text-8xl">{topNight[0]}</p>
                    <p className="text-xl font-bold opacity-60 uppercase tracking-tighter">{topNight[1]} LATE NIGHTS</p>
                </div>
            </div>

            <div className="wrapped-card p-12 space-y-8 rotate-2 bg-wrapped-yellow">
                <div className="flex items-center space-x-4">
                    <Sun className="w-12 h-12" />
                    <h3 className="text-3xl font-black italic">EARLY BIRD</h3>
                </div>
                <div className="space-y-2">
                    <p className="text-wrapped-poster text-6xl md:text-8xl">{topMorning[0]}</p>
                    <p className="text-xl font-bold opacity-60 uppercase tracking-tighter">{topMorning[1]} MORNINGS</p>
                </div>
            </div>
        </div>
    );
}

function ProfanitySlide({ data }: { data: any[] }) {
    const top = data[0];
    return (
        <div className="text-center space-y-12">
            <div className="wrapped-card p-10 bg-black text-white rotate-12 inline-block">
                <Ghost className="w-24 h-24" />
            </div>
            <div className="space-y-4">
                <h2 className="text-wrapped-poster text-5xl md:text-7xl text-black/40">POTTY MOUTH</h2>
                <h3 className="text-wrapped-poster text-8xl md:text-[10rem] text-black">{top[0]}</h3>
                <div className="sticker bg-black text-white text-2xl">{top[1]} SWEARS SENT</div>
            </div>
        </div>
    );
}

function ReelsSlide({ data }: { data: any[] }) {
    const top = data[0];
    return (
        <div className="text-center space-y-12">
            <div className="wrapped-card p-10 bg-white rotate-6 inline-block">
                <Music className="w-24 h-24 text-wrapped-blue" />
            </div>
            <div className="space-y-4">
                <h2 className="text-wrapped-poster text-5xl md:text-7xl text-black/40 uppercase">REEL ADDICT</h2>
                <h3 className="text-wrapped-poster text-8xl md:text-[10rem] text-black">{top[0]}</h3>
                <div className="sticker bg-wrapped-blue text-white text-2xl">{top[1]} REELS SHARED</div>
            </div>
        </div>
    );
}

function LongestWordSlide({ data }: { data: any[] }) {
    const top = data[0];
    return (
        <div className="text-center space-y-12">
            <div className="wrapped-card p-10 bg-black text-white -rotate-6 inline-block">
                <Trophy className="w-24 h-24 text-wrapped-yellow" />
            </div>
            <div className="space-y-4">
                <h2 className="text-wrapped-poster text-5xl md:text-7xl text-black/40 uppercase">VOCABULARY KING</h2>
                <h3 className="text-wrapped-poster text-6xl md:text-8xl text-black">{top.user}</h3>
                <div className="sticker bg-black text-white text-2xl">"{top.word}" ({top.length} LETTERS)</div>
            </div>
        </div>
    );
}

function LikesGivenSlide({ data }: { data: any[] }) {
    const top = data[0];
    return (
        <div className="text-center space-y-12">
            <div className="wrapped-card p-10 bg-wrapped-pink rotate-3 inline-block">
                <Heart className="w-24 h-24 text-white" />
            </div>
            <div className="space-y-4">
                <h2 className="text-wrapped-poster text-5xl md:text-7xl text-black/40 uppercase">CHIEF ENCOURAGER</h2>
                <h3 className="text-wrapped-poster text-8xl md:text-[10rem] text-black">{top[0]}</h3>
                <div className="sticker bg-white text-black text-2xl">{top[1]} LIKES GIVEN</div>
            </div>
        </div>
    );
}

function RepliedToSlide({ data }: { data: any[] }) {
    const top = data[0];
    return (
        <div className="text-center space-y-12">
            <div className="wrapped-card p-10 bg-wrapped-green -rotate-3 inline-block">
                <MessageSquare className="w-24 h-24 text-black" />
            </div>
            <div className="space-y-4">
                <h2 className="text-wrapped-poster text-5xl md:text-7xl text-black/40 uppercase">MOST POPULAR</h2>
                <h3 className="text-wrapped-poster text-8xl md:text-[10rem] text-black">{top[0]}</h3>
                <div className="sticker bg-black text-white text-2xl">THEY GET ALL THE REPLIES</div>
            </div>
        </div>
    );
}

function SummarySlide({ data, onReset }: { data: any, onReset: () => void }) {
    return (
        <div className="text-center space-y-12 w-full max-w-5xl">
            <h2 className="text-wrapped-poster text-7xl md:text-[10rem] text-white">THAT'S<br />YOUR<br />YEAR.</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="wrapped-card p-8 text-left -rotate-1">
                    <p className="text-xs font-black opacity-40 uppercase mb-2">Top Word</p>
                    <p className="text-4xl font-black italic uppercase">{data.stats.top_words_overall[0][0]}</p>
                </div>
                <div className="wrapped-card p-8 text-left rotate-1 bg-wrapped-pink text-white border-white">
                    <p className="text-xs font-black opacity-60 uppercase mb-2">Aura King</p>
                    <p className="text-4xl font-black italic uppercase">{data.rankings.most_aura[0][0]}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 pt-12">
                <button
                    onClick={() => alert("Sharing feature coming soon!")}
                    className="flex-1 py-8 bg-wrapped-green text-black text-3xl font-black italic border-4 border-black shadow-[8px_8px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_black] transition-all flex items-center justify-center space-x-4"
                >
                    <Share2 className="w-8 h-8" />
                    <span>SHARE STORY</span>
                </button>
                <button
                    onClick={onReset}
                    className="flex-1 py-8 bg-white text-black text-3xl font-black italic border-4 border-black shadow-[8px_8px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_black] transition-all flex items-center justify-center space-x-4"
                >
                    <RefreshCcw className="w-8 h-8" />
                    <span>START OVER</span>
                </button>
            </div>
        </div>
    );
}
