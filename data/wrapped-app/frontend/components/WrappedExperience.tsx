"use client";

import { useState, useEffect, useRef } from "react";
import { animate, Timeline, stagger } from "animejs";
import { ChevronRight, ChevronLeft, RefreshCcw, Share2, Trophy, MessageSquare, Zap, Moon, Sun, Ghost, Sparkles, Music, Heart, Smile, Award, Users, Star, FileText, X, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, LabelList } from 'recharts';
import { cn } from "@/app/lib/utils";

interface WrappedExperienceProps {
    data: any;
    selectedSlideIds: string[];
    onReset: () => void;
}

import NetworkGraph from "./NetworkGraph";

export default function WrappedExperience({ data, selectedSlideIds, onReset }: WrappedExperienceProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const slideRef = useRef<HTMLDivElement>(null);

    const generatePDF = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        setProgressMessage('Preparing to capture slides...');

        try {
            const jsPDF = (await import('jspdf')).default;
            const { toPng } = await import('html-to-image');

            const originalSlide = currentSlide;
            let pdf: any = null;

            for (let i = 0; i < slides.length - 1; i++) {
                setProgressMessage(`Capturing slide ${i + 1} of ${slides.length - 1}: ${slides[i].id}`);
                setCurrentSlide(i);
                await new Promise(resolve => setTimeout(resolve, 800));

                const slideContainer = document.querySelector('.fixed.inset-0') as HTMLElement;
                if (!slideContainer) continue;

                const imgData = await toPng(slideContainer, {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    cacheBust: true,
                    backgroundColor: slides[i].bg.includes('bg-wrapped') ? undefined : '#000000',
                    filter: (node) => {
                        const exclusionIds = ['generation-overlay', 'nav-arrows', 'top-progress-bar', 'tap-hint'];
                        return !(node instanceof HTMLElement && exclusionIds.includes(node.id));
                    }
                });

                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = imgData;
                    setTimeout(() => reject(new Error("Timeout")), 5000);
                });

                const imgWidth = img.width;
                const imgHeight = img.height;

                if (!pdf) {
                    const orientation = imgWidth > imgHeight ? 'l' : 'p';
                    pdf = new jsPDF(orientation, 'px', [imgWidth, imgHeight]);
                } else {
                    pdf.addPage([imgWidth, imgHeight], imgWidth > imgHeight ? 'l' : 'p');
                }

                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            }

            setProgressMessage('Saving PDF...');
            setCurrentSlide(originalSlide);
            pdf.save('my-year-wrapped.pdf');
            setProgressMessage('Download complete!');

        } catch (error) {
            console.error('Error generating PDF:', error);
            setProgressMessage('Error occurred. Please try again.');
        } finally {
            setTimeout(() => {
                setIsGenerating(false);
                setProgressMessage('');
            }, 2000);
        }
    };

    const generateImages = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        setProgressMessage('Preparing to capture slides...');

        try {
            const JSZip = (await import('jszip')).default;
            const { toBlob } = await import('html-to-image');

            const zip = new JSZip();
            const originalSlide = currentSlide;

            for (let i = 0; i < slides.length - 1; i++) {
                setProgressMessage(`Capturing slide ${i + 1} of ${slides.length - 1}: ${slides[i].id}`);
                setCurrentSlide(i);
                await new Promise(resolve => setTimeout(resolve, 800));

                const slideContainer = document.querySelector('.fixed.inset-0') as HTMLElement;
                if (!slideContainer) continue;

                try {
                    const blob = await toBlob(slideContainer, {
                        width: window.innerWidth,
                        height: window.innerHeight,
                        cacheBust: true,
                        filter: (node) => {
                            const exclusionIds = ['generation-overlay', 'nav-arrows', 'top-progress-bar', 'tap-hint'];
                            return !(node instanceof HTMLElement && exclusionIds.includes(node.id));
                        }
                    });

                    if (blob) {
                        const slideId = slides[i].id;
                        zip.file(`${String(i + 1).padStart(2, '0')}-${slideId}.png`, blob);
                    }
                } catch (error) {
                    console.warn(`Failed to capture slide ${i}:`, error);
                }
            }

            setProgressMessage('Creating ZIP file...');
            setCurrentSlide(originalSlide);

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
                setIsGenerating(false);
                setProgressMessage('');
            }, 2000);
        }
    };

    const allSlides = [
        { id: "intro", component: <IntroSlide />, bg: "bg-wrapped-pink" },
        { id: "top-words", component: <TopWordsSlide data={data.stats.top_words_overall} />, bg: "bg-wrapped-green" },
        { id: "chart-messages", component: <MetricsChartSlide title="VOLUME CHECK" data={data.chart_data.messages_sent} color="#FFD300" subtitle="MOST MESSAGES SENT" />, bg: "bg-wrapped-blue" },
        { id: "chart-likes", component: <LikesComparisonSlide data={data.chart_data} />, bg: "bg-wrapped-yellow" },
        { id: "response-time", component: <ResponseTimeSlide fastest={data.rankings.avg_response_times} slowest={data.rankings.slowest_responders} />, bg: "bg-wrapped-blue" },
        { id: "aura", component: <AuraSlide data={data.rankings.most_aura} />, bg: "bg-wrapped-blue" },
        { id: "reels", component: <ReelsSlide data={data.rankings.most_reels_sent} />, bg: "bg-wrapped-purple" },
        { id: "chart-reels", component: <MetricsChartSlide title="REEL TALK" data={data.chart_data.reels_sent} color="#FF4BAB" subtitle="REEL ADDICTION LEVELS" />, bg: "bg-wrapped-orange" },
        { id: "paragrapher", component: <ParagrapherSlide data={data.rankings.avg_message_lengths} />, bg: "bg-wrapped-orange" },
        { id: "top-liked", component: <TopLikedSlide data={data.stats.top_liked_messages} />, bg: "bg-wrapped-pink" },
        { id: "network", component: <NetworkGraph data={data.network_data} />, bg: "bg-wrapped-green" },
        { id: "peak-month", component: <PeakMonthSlide data={data.rankings.peak_month} />, bg: "bg-wrapped-yellow" },
        { id: "time", component: <TimeSlide night={data.rankings.night_owls} morning={data.rankings.morning_person} />, bg: "bg-gradient-to-r from-slate-900 via-slate-700 to-wrapped-yellow" },
        { id: "longest-word", component: <LongestWordSlide data={data.rankings.longest_word_sent} />, bg: "bg-wrapped-blue" },
        { id: "likes-given", component: <LikesGivenSlide data={data.rankings.most_messages_liked} />, bg: "bg-wrapped-orange" },
        { id: "profanity", component: <ProfanitySlide data={data.rankings.most_profanity} />, bg: "bg-wrapped-pink" },
        { id: "replied-to", component: <RepliedToSlide data={data.rankings.most_replied_to} />, bg: "bg-wrapped-green" },
        { id: "archetypes", component: <ArchetypesSlide rankings={data.rankings} />, bg: "bg-wrapped-purple" },
        { id: "quiz", component: <QuizSlide pool={data.stats.quiz_pool} participants={data.network_data.nodes.map((n: any) => n.id)} />, bg: "bg-wrapped-yellow" },
    ];

    // Filter slides based on selection, but always keep intro first
    const slides = allSlides.filter(s => s.id === "intro" || selectedSlideIds.includes(s.id));

    // Add summary slide after slides array is defined
    slides.push({
        id: "summary",
        component: (
            <SummarySlide
                data={data}
                onReset={onReset}
                currentSlide={currentSlide}
                setCurrentSlide={setCurrentSlide}
                slides={slides}
                generatePDF={generatePDF}
                generateImages={generateImages}
                isGenerating={isGenerating}
                progressMessage={progressMessage}
            />
        ),
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
            <div id="top-progress-bar" className="absolute top-8 left-8 right-8 flex space-x-2 z-50">
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
                    className="absolute inset-0 flex items-center justify-center p-4 md:p-12 overflow-y-auto"
                >
                    <div className="w-full max-w-full flex items-center justify-center min-h-full py-20 md:py-0">
                        {slides[currentSlide].component}
                    </div>
                </div>
            </div>

            {/* Global Navigation Arrows */}
            <div id="nav-arrows" className="absolute inset-y-0 left-0 right-0 flex items-center justify-between z-[60] pointer-events-none px-4">
                <div className="w-20 flex items-center justify-center">
                    {currentSlide > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                            className="p-4 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md pointer-events-auto transition-all"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                    )}
                </div>
                <div className="w-20 flex items-center justify-center">
                    {currentSlide < slides.length - 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                            className="p-4 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md pointer-events-auto transition-all"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    )}
                </div>
            </div>

            <div id="tap-hint" className="absolute bottom-12 left-0 right-0 flex justify-center z-50 pointer-events-none">
                <div className="sticker bg-black text-white text-sm animate-bounce">TAP OR USE ARROWS</div>
            </div>

            {/* Global Progress Overlay */}
            {isGenerating && (
                <div id="generation-overlay" className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex flex-col items-center justify-center space-y-8 p-12 text-center">
                    <div className="wrapped-card p-12 animate-snap bg-wrapped-yellow">
                        <RefreshCcw className="w-24 h-24 animate-spin" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-wrapped-poster text-6xl text-white">GENERATING...</h2>
                        <p className="text-2xl font-black italic text-wrapped-yellow uppercase tracking-tighter">{progressMessage}</p>
                    </div>
                    <div className="w-full max-w-md h-4 bg-white/10 rounded-full overflow-hidden border-2 border-white/20">
                        <div
                            className="h-full bg-wrapped-yellow transition-all duration-500"
                            style={{ width: `${(currentSlide / (slides.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function IntroSlide() {
    return (
        <div className="text-center space-y-12">
            <div className="wrapped-card p-12 rotate-3 inline-block">
                <Sparkles className="w-32 h-32 text-wrapped-pink" />
            </div>
            <h2 className="text-wrapped-poster text-6xl md:text-[12rem] text-black leading-none">
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
                    <div key={word} className="word-row opacity-0 flex items-center md:items-end space-x-4">
                        <span className="text-wrapped-poster text-4xl md:text-8xl text-black/20">{i + 1}</span>
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
                <h2 className="text-wrapped-poster text-4xl md:text-7xl text-black/40">MOST AURA</h2>
                <h3 className="text-wrapped-poster text-6xl md:text-[10rem] text-black">{topAura[0]}</h3>
                <div className="sticker bg-white text-black text-lg md:text-2xl">MOST LIKE REACTIONS PER MESSAGE</div>
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
                    <p className="text-wrapped-poster text-5xl md:text-8xl">{topNight[0]}</p>
                    <p className="text-lg md:text-xl font-bold opacity-60 uppercase tracking-tighter">{topNight[1]} LATE NIGHTS</p>
                </div>
            </div>

            <div className="wrapped-card p-12 space-y-8 rotate-2 bg-wrapped-yellow">
                <div className="flex items-center space-x-4">
                    <Sun className="w-12 h-12" />
                    <h3 className="text-3xl font-black italic">EARLY BIRD</h3>
                </div>
                <div className="space-y-2">
                    <p className="text-wrapped-poster text-5xl md:text-8xl">{topMorning[0]}</p>
                    <p className="text-lg md:text-xl font-bold opacity-60 uppercase tracking-tighter">{topMorning[1]} MORNINGS</p>
                </div>
            </div>
        </div>
    );
}

function ResponseTimeSlide({ fastest, slowest }: { fastest: any[], slowest: any[] }) {
    const topFast = fastest[0];
    const topSlow = slowest[0];

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
        return `${Math.round(seconds / 3600)}h`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
            <div className="wrapped-card p-12 space-y-8 -rotate-1 bg-white text-black">
                <div className="flex items-center space-x-4">
                    <Zap className="w-12 h-12 text-wrapped-yellow" />
                    <h3 className="text-3xl font-black italic">THE FLASH</h3>
                </div>
                <div className="space-y-2">
                    <p className="text-wrapped-poster text-5xl md:text-8xl">{topFast[0]}</p>
                    <p className="text-lg md:text-xl font-bold opacity-40 uppercase tracking-tighter">{formatTime(topFast[1])} AVG RESPONSE</p>
                </div>
            </div>

            <div className="wrapped-card p-12 space-y-8 rotate-1 bg-black text-white border-white">
                <div className="flex items-center space-x-4">
                    <Ghost className="w-12 h-12 text-wrapped-pink" />
                    <h3 className="text-3xl font-black italic">THE GHOSTER</h3>
                </div>
                <div className="space-y-2">
                    <p className="text-wrapped-poster text-5xl md:text-8xl">{topSlow[0]}</p>
                    <p className="text-lg md:text-xl font-bold opacity-40 uppercase tracking-tighter">{formatTime(topSlow[1])} AVG RESPONSE</p>
                </div>
            </div>
        </div>
    );
}

function ParagrapherSlide({ data }: { data: any[] }) {
    const top = data[0];
    return (
        <div className="text-center space-y-12">
            <div className="wrapped-card p-10 bg-white rotate-3 inline-block">
                <FileText className="w-24 h-24 text-wrapped-orange" />
            </div>
            <div className="space-y-4">
                <h2 className="text-wrapped-poster text-4xl md:text-7xl text-black/40 uppercase">THE PARAGRAPHER</h2>
                <h3 className="text-wrapped-poster text-6xl md:text-[10rem] text-black">{top[0]}</h3>
                <div className="sticker bg-black text-white text-lg md:text-2xl">{Math.round(top[1])} CHARS PER MESSAGE</div>
            </div>
        </div>
    );
}

function PeakMonthSlide({ data }: { data: [string, number] }) {
    return (
        <div className="text-center space-y-12">
            <div className="wrapped-card p-12 bg-white -rotate-2 inline-block">
                <h2 className="text-wrapped-poster text-4xl md:text-6xl text-black/20 mb-4 uppercase">PEAK YAP SESSION</h2>
                <h3 className="text-wrapped-poster text-6xl md:text-[12rem] text-black leading-none">{data[0].split(' ')[0]}<br />{data[0].split(' ')[1]}</h3>
                <div className="sticker bg-wrapped-green text-black text-2xl mt-8">
                    {data[1].toLocaleString()} MESSAGES SENT
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
                <h2 className="text-wrapped-poster text-4xl md:text-7xl text-black/40">POTTY MOUTH</h2>
                <h3 className="text-wrapped-poster text-6xl md:text-[10rem] text-black">{top[0]}</h3>
                <div className="sticker bg-black text-white text-lg md:text-2xl">{top[1]} SWEARS SENT</div>
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
                <h2 className="text-wrapped-poster text-4xl md:text-7xl text-black/40 uppercase">REEL ADDICT</h2>
                <h3 className="text-wrapped-poster text-6xl md:text-[10rem] text-black">{top[0]}</h3>
                <div className="sticker bg-wrapped-blue text-white text-lg md:text-2xl">{top[1]} REELS SHARED</div>
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
                <h2 className="text-wrapped-poster text-4xl md:text-7xl text-black/40 uppercase">VOCABULARY KING</h2>
                <h3 className="text-wrapped-poster text-5xl md:text-8xl text-black">{top.user}</h3>
                <div className="sticker bg-black text-white text-lg md:text-2xl">"{top.word}" ({top.length} LETTERS)</div>
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
                <h2 className="text-wrapped-poster text-4xl md:text-7xl text-black/40 uppercase">CHIEF ENCOURAGER</h2>
                <h3 className="text-wrapped-poster text-6xl md:text-[10rem] text-black">{top[0]}</h3>
                <div className="sticker bg-white text-black text-lg md:text-2xl">{top[1]} LIKES GIVEN</div>
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
                <h2 className="text-wrapped-poster text-4xl md:text-7xl text-black/40 uppercase">MOST POPULAR</h2>
                <h3 className="text-wrapped-poster text-6xl md:text-[10rem] text-black">{top[0]}</h3>
                <div className="sticker bg-black text-white text-lg md:text-2xl">THEY GET ALL THE REPLIES</div>
            </div>
        </div>
    );
}

function MetricsChartSlide({ title, data, color, subtitle }: { title: string, data: any[], color: string, subtitle: string }) {
    return (
        <div className="w-full max-w-5xl space-y-8 text-center">
            <h2 className="text-wrapped-poster text-5xl md:text-7xl text-black">{title}</h2>
            <div className="wrapped-card p-6 md:p-10 bg-white h-[400px] md:h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 20, right: 40, top: 20, bottom: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={120}
                            tick={{ fill: '#000', fontWeight: 'bold', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            contentStyle={{
                                backgroundColor: '#000',
                                border: '4px solid #000',
                                borderRadius: '0px',
                                color: '#fff',
                                fontWeight: 'bold'
                            }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={color} stroke="#000" strokeWidth={2} />
                            ))}
                            <LabelList dataKey="value" position="right" style={{ fill: '#000', fontWeight: '900', fontSize: '14px' }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="sticker bg-black text-white text-xl rotate-[-2deg] inline-block uppercase">{subtitle}</div>
        </div>
    );
}

function LikesComparisonSlide({ data }: { data: any }) {
    // Merge likes given and received for the same users
    const users = Array.from(new Set([
        ...data.likes_given.map((d: any) => d.name),
        ...data.likes_received.map((d: any) => d.name)
    ])).slice(0, 10);

    const chartData = users.map(user => ({
        name: user,
        given: data.likes_given.find((d: any) => d.name === user)?.value || 0,
        received: data.likes_received.find((d: any) => d.name === user)?.value || 0
    }));

    return (
        <div className="w-full max-w-5xl space-y-8 text-center">
            <h2 className="text-wrapped-poster text-5xl md:text-7xl text-black">THE LOVE SCALE</h2>
            <div className="wrapped-card p-6 md:p-10 bg-white h-[400px] md:h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                            tick={{ fill: '#000', fontWeight: 'bold', fontSize: 10 }}
                        />
                        <YAxis tick={{ fill: '#000', fontWeight: 'bold' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#000',
                                border: '4px solid #000',
                                color: '#fff'
                            }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Bar name="Likes Given" dataKey="given" fill="#FF4BAB" stroke="#000" strokeWidth={2}>
                            <LabelList dataKey="given" position="top" style={{ fill: '#000', fontWeight: '900', fontSize: '10px' }} />
                        </Bar>
                        <Bar name="Likes Received" dataKey="received" fill="#00E5FF" stroke="#000" strokeWidth={2}>
                            <LabelList dataKey="received" position="top" style={{ fill: '#000', fontWeight: '900', fontSize: '10px' }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="sticker bg-wrapped-yellow text-black text-xl rotate-[2deg] inline-block uppercase italic">WHO'S THE MOST GENEROUS?</div>
        </div>
    );
}

function TopLikedSlide({ data }: { data: any[] }) {
    const top = data[0];
    return (
        <div className="w-full max-w-4xl space-y-12 text-center">
            <h2 className="text-wrapped-poster text-6xl md:text-8xl text-black">HALL OF FAME</h2>
            <div className="wrapped-card p-6 md:p-12 space-y-6 md:space-y-8 relative">
                <Award className="absolute -top-6 -left-6 md:-top-8 md:-left-8 w-12 h-12 md:w-20 md:h-20 text-wrapped-yellow rotate-[-15deg]" />
                <p className="text-2xl md:text-6xl font-black italic">"{top.content}"</p>
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

function SummarySlide({
    data,
    onReset,
    currentSlide,
    setCurrentSlide,
    slides,
    generatePDF,
    generateImages,
    isGenerating,
    progressMessage
}: {
    data: any,
    onReset: () => void,
    currentSlide: number,
    setCurrentSlide: (slide: number) => void,
    slides: any[],
    generatePDF: () => Promise<void>,
    generateImages: () => Promise<void>,
    isGenerating: boolean,
    progressMessage: string
}) {
    const [showShareDialog, setShowShareDialog] = useState(false);

    return (
        <div className="text-center space-y-12 w-full max-w-5xl px-4">
            <h2 className="text-wrapped-poster text-5xl md:text-[10rem] text-white">THAT'S<br />YOUR<br />YEAR.</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="wrapped-card p-8 text-left -rotate-1">
                    <p className="text-xs font-black opacity-40 uppercase mb-2">Top Word</p>
                    <p className="text-4xl font-black italic uppercase">{data.stats.top_words_overall[0][0]}</p>
                </div>
                <div className="wrapped-card p-8 text-left rotate-1 bg-wrapped-pink text-white border-white">
                    <p className="text-xs font-black opacity-60 uppercase mb-2">Aura King</p>
                    <p className="text-4xl font-black italic uppercase">{data.rankings.most_aura[0][0]}</p>
                </div>
                <div className="wrapped-card p-8 text-left -rotate-2 bg-wrapped-green text-black">
                    <p className="text-xs font-black opacity-40 uppercase mb-2">Peak Month</p>
                    <p className="text-4xl font-black italic uppercase">{data.rankings.peak_month[0].split(' ')[0]}</p>
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
                                onClick={() => { setShowShareDialog(false); generatePDF(); }}
                                disabled={isGenerating}
                                className="w-full py-4 bg-wrapped-blue text-white font-black italic text-xl border-4 border-black shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                            >
                                <FileText className="w-6 h-6" />
                                <span>DOWNLOAD AS PDF</span>
                            </button>

                            <button
                                onClick={() => { setShowShareDialog(false); generateImages(); }}
                                disabled={isGenerating}
                                className="w-full py-4 bg-wrapped-pink text-white font-black italic text-xl border-4 border-black shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                            >
                                <FileText className="w-6 h-6" />
                                <span>SAVE AS IMAGES (ZIP)</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
function QuizSlide({ pool, participants }: { pool: any[], participants: string[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [options, setOptions] = useState<string[]>([]);

    const currentQuestion = pool[currentIndex];

    useEffect(() => {
        if (currentQuestion) {
            const others = participants.filter(p => p !== currentQuestion.sender);
            const shuffledOthers = others.sort(() => 0.5 - Math.random()).slice(0, 3);
            const newOptions = [currentQuestion.sender, ...shuffledOthers].sort(() => 0.5 - Math.random());
            setOptions(newOptions);
            setSelectedAnswer(null);
            setIsCorrect(null);
        }
    }, [currentIndex, currentQuestion, participants]);

    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(answer);
        const correct = answer === currentQuestion.sender;
        setIsCorrect(correct);
        if (correct) setScore(s => s + 1);
    };

    const nextQuestion = () => {
        if (currentIndex < pool.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    if (!currentQuestion) return null;

    return (
        <div className="w-full max-w-4xl space-y-8 md:space-y-12 text-center">
            <div className="space-y-4">
                <h2 className="text-wrapped-poster text-5xl md:text-7xl text-black">WHO SAID IT?</h2>
                <div className="flex justify-center space-x-4">
                    <div className="sticker bg-black text-white text-sm">QUESTION {currentIndex + 1}/{pool.length}</div>
                    <div className="sticker bg-wrapped-green text-black text-sm">SCORE: {score}</div>
                </div>
            </div>

            <div className="wrapped-card p-8 md:p-12 bg-white space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-black/5" />
                <p className="text-2xl md:text-4xl font-black italic leading-tight">
                    "{currentQuestion.content}"
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((option, i) => (
                    <button
                        key={i}
                        onClick={() => handleAnswer(option)}
                        className={cn(
                            "wrapped-card p-4 md:p-6 text-xl font-black uppercase transition-all transform active:scale-95",
                            selectedAnswer === option
                                ? (option === currentQuestion.sender ? "bg-wrapped-green text-black" : "bg-red-500 text-white")
                                : (selectedAnswer && option === currentQuestion.sender ? "bg-wrapped-green/50 text-black" : "bg-white text-black hover:bg-black hover:text-white")
                        )}
                    >
                        {option}
                    </button>
                ))}
            </div>

            {selectedAnswer && (
                <div className="animate-snap">
                    {currentIndex < pool.length - 1 ? (
                        <button
                            onClick={nextQuestion}
                            className="btn-primary bg-black text-white px-12 py-4 text-2xl"
                        >
                            NEXT QUESTION
                        </button>
                    ) : (
                        <div className="sticker bg-wrapped-pink text-white text-2xl rotate-3">
                            FINAL SCORE: {score}/{pool.length}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
