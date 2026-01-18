"use client";

import { useState, useEffect, useRef } from "react";
import { animate, Timeline, stagger } from "animejs";
import { ChevronRight, ChevronLeft, RefreshCcw, Share2, Trophy, MessageSquare, Zap, Moon, Sun, Ghost, Sparkles, Music, Heart, Smile, Award, Users, Star, FileText, X } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface WrappedExperienceProps {
    data: any;
    onReset: () => void;
}

import NetworkGraph from "./NetworkGraph";

export default function WrappedExperience({ data, onReset }: WrappedExperienceProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const slideRef = useRef<HTMLDivElement>(null);

    const slides = [
        { id: "intro", component: <IntroSlide />, bg: "bg-wrapped-pink" },
        { id: "top-words", component: <TopWordsSlide data={data.stats.top_words_overall} />, bg: "bg-wrapped-green" },
        { id: "emojis", component: <EmojiSlide data={data.stats.top_emojis} />, bg: "bg-wrapped-yellow" },
        { id: "aura", component: <AuraSlide data={data.rankings.most_aura} />, bg: "bg-wrapped-blue" },
        { id: "reels", component: <ReelsSlide data={data.rankings.most_reels_sent} />, bg: "bg-wrapped-purple" },
        { id: "top-liked", component: <TopLikedSlide data={data.stats.top_liked_messages} />, bg: "bg-wrapped-pink" },
        { id: "network", component: <NetworkGraph data={data.network_data} />, bg: "bg-wrapped-green" },
        { id: "time", component: <TimeSlide night={data.rankings.night_owls} morning={data.rankings.morning_person} />, bg: "bg-gradient-to-r from-slate-900 via-slate-700 to-wrapped-yellow" },
        { id: "longest-word", component: <LongestWordSlide data={data.rankings.longest_word_sent} />, bg: "bg-wrapped-blue" },
        { id: "likes-given", component: <LikesGivenSlide data={data.rankings.most_messages_liked} />, bg: "bg-wrapped-orange" },
        { id: "profanity", component: <ProfanitySlide data={data.rankings.most_profanity} />, bg: "bg-wrapped-pink" },
        { id: "replied-to", component: <RepliedToSlide data={data.rankings.most_replied_to} />, bg: "bg-wrapped-green" },
        { id: "archetypes", component: <ArchetypesSlide rankings={data.rankings} />, bg: "bg-wrapped-purple" },
    ];
    
    // Add summary slide after slides array is defined
    slides.push({
        id: "summary", 
        component: <SummarySlide data={data} onReset={onReset} currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} slides={slides} />, 
        bg: "bg-black"
    });

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

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                prevSlide();
            } else if (event.key === 'ArrowRight') {
                nextSlide();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
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

    const isNetworkSlide = slides[currentSlide].id === "network";
    const isSummarySlide = slides[currentSlide].id === "summary";
    const disableOverlays = isSummarySlide;

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
                    data-slide={currentSlide}
                    data-slide-id={slides[currentSlide].id}
                    className="absolute inset-0 flex items-center justify-center p-6 md:p-12"
                >
                    {slides[currentSlide].component}
                </div>
            </div>

            {/* Global Navigation Arrows */}
            <div className="absolute inset-y-0 left-0 w-20 flex items-center justify-center z-[60] pointer-events-none">
                {currentSlide > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                        className="p-4 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md pointer-events-auto transition-all"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                )}
            </div>
            <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center z-[60] pointer-events-none">
                {currentSlide < slides.length - 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="p-4 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md pointer-events-auto transition-all"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                )}
            </div>

            <div className="absolute bottom-12 left-0 right-0 flex justify-center z-50 pointer-events-none">
                <div className="sticker bg-black text-white text-sm animate-bounce">TAP OR USE ARROWS</div>
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
                <div className="sticker bg-white text-black text-2xl">MOST LIKE REACTIONS PER MESSAGE</div>
            </div>
        </div>
    );
}

function TimeSlide({ night, morning }: { night: any[], morning: any[] }) {
    const topNight = night[0];
    const topMorning = morning[0];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
            <div className="wrapped-card p-12 space-y-8 -rotate-2 bg-slate-800 text-white border-white">
                <div className="flex items-center space-x-4">
                    <Moon className="w-12 h-12 text-blue-200" />
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
                <div className="text-6xl font-black text-red-400">!#%&</div>
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
                <div className="text-6xl" style={{ textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black' }}>😊</div>
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

function EmojiSlide({ data }: { data: any[] }) {
    return (
        <div className="text-center space-y-12">
            <h2 className="text-wrapped-poster text-7xl md:text-9xl text-black">VIBE CHECK</h2>
            <div className="flex flex-wrap justify-center gap-8">
                {data.slice(0, 5).map(([emoji, count], i) => (
                    <div key={i} className="wrapped-card p-6 flex flex-col items-center space-y-4 animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>
                        <span className="text-7xl">{emoji}</span>
                        <span className="text-2xl font-black">{count}</span>
                    </div>
                ))}
            </div>
            <div className="sticker bg-black text-white text-2xl rotate-3 inline-block">THE GROUP'S FAVORITES</div>
        </div>
    );
}

function TopLikedSlide({ data }: { data: any[] }) {
    const top = data[0];
    return (
        <div className="w-full max-w-4xl space-y-12 text-center">
            <h2 className="text-wrapped-poster text-6xl md:text-8xl text-black">HALL OF FAME</h2>
            <div className="wrapped-card p-12 space-y-8 relative">
                <Award className="absolute -top-8 -left-8 w-20 h-20 text-wrapped-yellow rotate-[-15deg]" />
                <p className="text-4xl md:text-6xl font-black italic">"{top.content}"</p>
                <div className="flex justify-between items-center pt-8 border-t-4 border-black">
                    <div className="text-left">
                        <p className="text-sm font-black opacity-40 uppercase">Sent by</p>
                        <p className="text-2xl font-black uppercase">{top.sender}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-black opacity-40 uppercase">Reactions</p>
                        <p className="text-4xl font-black italic">{top.likes} LIKES</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArchetypesSlide({ rankings }: { rankings: any }) {
    const archetypes = [
        { title: "THE AURA KING", name: rankings.most_aura[0][0], icon: <Zap className="w-8 h-8" />, color: "bg-wrapped-yellow" },
        { title: "THE NIGHT OWL", name: rankings.night_owls[0][0], icon: <Moon className="w-8 h-8" />, color: "bg-wrapped-purple text-white" },
        { title: "THE REEL ADDICT", name: rankings.most_reels_sent[0][0], icon: <Music className="w-8 h-8" />, color: "bg-wrapped-blue text-white" },
        { title: "THE POTTY MOUTH", name: rankings.most_profanity[0][0], icon: <Ghost className="w-8 h-8" />, color: "bg-black text-white" },
        { title: "THE ENCOURAGER", name: rankings.most_messages_liked[0][0], icon: <Heart className="w-8 h-8" />, color: "bg-wrapped-pink text-white" },
        { title: "THE POPULAR ONE", name: rankings.most_replied_to[0][0], icon: <Star className="w-8 h-8" />, color: "bg-wrapped-green" },
    ];

    return (
        <div className="w-full max-w-5xl space-y-12">
            <h2 className="text-wrapped-poster text-6xl md:text-8xl text-black text-center">THE SQUAD ROSTER</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archetypes.map((arc, i) => (
                    <div key={i} className={cn("wrapped-card p-6 space-y-4 rotate-1", arc.color)}>
                        <div className="flex items-center space-x-3">
                            {arc.icon}
                            <p className="text-xs font-black uppercase opacity-60">{arc.title}</p>
                        </div>
                        <p className="text-2xl font-black uppercase italic">{arc.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SummarySlide({ data, onReset, currentSlide, setCurrentSlide, slides }: { data: any, onReset: () => void, currentSlide: number, setCurrentSlide: (slide: number) => void, slides: any[] }) {
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');

    const generateImages = async () => {
        setIsGeneratingPDF(true);
        setProgressMessage('Preparing to capture slides...');
        
        try {
            const JSZip = (await import('jszip')).default;
            const html2canvas = (await import('html2canvas')).default;
            
            const zip = new JSZip();
            const originalSlide = currentSlide;
            
            // Go through each slide and capture it
            for (let i = 0; i < slides.length - 1; i++) { // Exclude summary slide
                setProgressMessage(`Capturing slide ${i + 1} of ${slides.length - 1}: ${slides[i].id}`);
                
                // Navigate to slide
                setCurrentSlide(i);
                
                // Wait for slide to render and animations to complete
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Find the slide container (the whole screen)
                const slideContainer = document.querySelector('.fixed.inset-0') as HTMLElement;
                if (!slideContainer) continue;
                
                try {
                    // Capture the entire screen
                    const canvas = await html2canvas(slideContainer, {
                        width: window.innerWidth,
                        height: window.innerHeight,
                        backgroundColor: null,
                        logging: false,
                        useCORS: true,
                        allowTaint: true
                    });
                    
                    // Convert to blob
                    const blob = await new Promise<Blob>((resolve) => {
                        canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0);
                    });
                    
                    // Add to zip
                    const slideId = slides[i].id;
                    zip.file(`${String(i + 1).padStart(2, '0')}-${slideId}.png`, blob);
                    
                } catch (error) {
                    console.warn(`Failed to capture slide ${i}:`, error);
                    // Create placeholder for failed slides
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = 1920;
                    canvas.height = 1080;
                    ctx!.fillStyle = '#FFD300';
                    ctx!.fillRect(0, 0, canvas.width, canvas.height);
                    ctx!.fillStyle = '#000000';
                    ctx!.font = '48px Arial';
                    ctx!.textAlign = 'center';
                    ctx!.fillText(`Slide ${i + 1}: ${slides[i].id}`, canvas.width / 2, canvas.height / 2);
                    ctx!.fillText('(Screenshot failed)', canvas.width / 2, canvas.height / 2 + 60);
                    
                    const blob = await new Promise<Blob>((resolve) => {
                        canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0);
                    });
                    
                    zip.file(`${String(i + 1).padStart(2, '0')}-${slides[i].id}.png`, blob);
                }
            }
            
            setProgressMessage('Creating ZIP file...');
            
            // Return to original slide
            setCurrentSlide(originalSlide);
            
            // Generate and download zip
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my-year-wrapped-images.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setProgressMessage('Download complete!');
            
        } catch (error) {
            console.error('Error generating images:', error);
            setProgressMessage('Error occurred. Please try again.');
        } finally {
            setTimeout(() => {
                setIsGeneratingPDF(false);
                setShowShareDialog(false);
                setProgressMessage('');
            }, 1000);
        }
    };

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
                    onClick={() => setShowShareDialog(true)}
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

            {/* Share Dialog */}
            {showShareDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                    <div className="wrapped-card p-8 max-w-md w-full mx-4 relative">
                        <button
                            onClick={() => setShowShareDialog(false)}
                            className="absolute -top-4 -right-4 p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        <h3 className="text-2xl font-black italic uppercase mb-6 text-center">Share Your Story</h3>
                        
                        <div className="space-y-4">
                            <button
                                onClick={generateImages}
                                disabled={isGeneratingPDF}
                                className="w-full py-4 bg-wrapped-pink text-white font-black italic text-xl border-4 border-black shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                            >
                                <FileText className="w-6 h-6" />
                                <span>{isGeneratingPDF ? progressMessage || 'GENERATING...' : 'SAVE AS IMAGES'}</span>
                            </button>
                            
                            <button
                                disabled
                                className="w-full py-4 bg-gray-300 text-gray-500 font-black italic text-xl border-4 border-gray-400 shadow-[4px_4px_0px_gray-400] flex items-center justify-center space-x-3 opacity-50"
                            >
                                <Share2 className="w-6 h-6" />
                                <span>OTHER FORMATS (COMING SOON)</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
