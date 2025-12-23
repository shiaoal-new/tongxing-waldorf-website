import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const DEVICE_PRESETS = {
    iphone14: { name: 'iPhone 14', width: 390, height: 844, browser: 'safari' },
    iphone14pro: { name: 'iPhone 14 Pro', width: 393, height: 852, browser: 'safari' },
    pixel7: { name: 'Pixel 7', width: 412, height: 915, browser: 'chrome' },
    s23ultra: { name: 'S23 Ultra', width: 384, height: 854, browser: 'chrome' },
};

const SCALES = [1, 0.75, 0.5];

export default function DeviceSimulator() {
    const router = useRouter();
    const [currentUrl, setCurrentUrl] = useState('/');
    const [syncEnabled, setSyncEnabled] = useState(true);

    // Splitter positions (percentages)
    const [horizontalSplit, setHorizontalSplit] = useState(66.66);
    const [verticalSplit, setVerticalSplit] = useState(60);

    // Persist splitters
    useEffect(() => {
        const savedH = localStorage.getItem('simulator_h_split');
        const savedV = localStorage.getItem('simulator_v_split');
        if (savedH) setHorizontalSplit(parseFloat(savedH));
        if (savedV) setVerticalSplit(parseFloat(savedV));
    }, []);

    useEffect(() => {
        localStorage.setItem('simulator_h_split', horizontalSplit);
        localStorage.setItem('simulator_v_split', verticalSplit);
    }, [horizontalSplit, verticalSplit]);

    // Individual scales
    const [scaleUltrawide, setScaleUltrawide] = useState(1);
    const [scaleDesktop, setScaleDesktop] = useState(1);
    const [scaleMobile, setScaleMobile] = useState(1);

    // Mobile settings
    const [mobileDevice, setMobileDevice] = useState('iphone14');
    const currentMobilePreset = DEVICE_PRESETS[mobileDevice];
    const mobileBrowser = currentMobilePreset.browser;

    const iframeUltrawide = useRef(null);
    const iframeDesktop = useRef(null);
    const iframeMobile = useRef(null);

    // Polling interval for URL sync
    useEffect(() => {
        if (!syncEnabled) return;

        const interval = setInterval(() => {
            const iframes = [
                { ref: iframeUltrawide, name: 'ultrawide' },
                { ref: iframeDesktop, name: 'desktop' },
                { ref: iframeMobile, name: 'mobile' }
            ];

            for (const item of iframes) {
                const iframe = item.ref.current;
                if (iframe && iframe.contentWindow) {
                    try {
                        const iframePath = iframe.contentWindow.location.pathname;
                        // If one iframe moved to a new path, update the global state
                        if (iframePath && iframePath !== currentUrl) {
                            console.log(`Sync: Detected change in ${item.name} to ${iframePath}`);
                            setCurrentUrl(iframePath);
                            break; // Only pick one change at a time
                        }
                    } catch (e) {
                        // Cross-origin or loading state - skip
                    }
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentUrl, syncEnabled]);

    // Force update other iframes when currentUrl changes
    useEffect(() => {
        if (!syncEnabled) return;

        const iframes = [iframeUltrawide.current, iframeDesktop.current, iframeMobile.current];
        iframes.forEach(iframe => {
            if (iframe && iframe.contentWindow) {
                try {
                    if (iframe.contentWindow.location.pathname !== currentUrl) {
                        iframe.contentWindow.location.href = currentUrl;
                    }
                } catch (e) {
                    // Fallback for cross-origin or other errors
                    if (iframe.src !== window.location.origin + currentUrl) {
                        iframe.src = currentUrl;
                    }
                }
            }
        });
    }, [currentUrl, syncEnabled]);

    const isResizingH = useRef(false);
    const isResizingV = useRef(false);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isResizingH.current || isResizingV.current) {
                e.preventDefault(); // Prevent text selection
            }

            if (isResizingH.current) {
                const newSplit = (e.clientX / window.innerWidth) * 100;
                setHorizontalSplit(Math.min(Math.max(newSplit, 20), 80));
            }
            if (isResizingV.current) {
                const newSplit = (e.clientY / window.innerHeight) * 100;
                setVerticalSplit(Math.min(Math.max(newSplit, 20), 80));
            }
        };

        const handleMouseUp = () => {
            isResizingH.current = false;
            isResizingV.current = false;
            setIsResizing(false);
            document.body.style.cursor = 'default';
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(f => f.style.pointerEvents = 'auto');
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const startResizingH = () => {
        isResizingH.current = true;
        setIsResizing(true);
        document.body.style.cursor = 'col-resize';
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(f => f.style.pointerEvents = 'none');
    };

    const startResizingV = () => {
        isResizingV.current = true;
        setIsResizing(true);
        document.body.style.cursor = 'row-resize';
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(f => f.style.pointerEvents = 'none');
    };

    return (
        <div className={`fixed inset-0 bg-[#0f172a] text-slate-200 flex flex-col font-sans overflow-hidden ${isResizing ? 'select-none' : ''}`}>
            <Head>
                <title>多裝置展示模式 | 同心華德福</title>
            </Head>

            {/* Toolbar */}
            <div className="h-14 bg-[#1e293b]/80 backdrop-blur-xl border-b border-white/5 flex items-center px-4 justify-between z-50">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white">Device Simulator</span>
                    </div>

                    <div className="flex items-center space-x-2 bg-slate-900/50 p-1 rounded-full border border-white/5 pl-4 pr-1">
                        <span className="text-slate-500 text-xs font-mono">/</span>
                        <input
                            type="text"
                            value={currentUrl.startsWith('/') ? currentUrl.slice(1) : currentUrl}
                            onChange={(e) => {
                                const val = e.target.value;
                                setCurrentUrl(val.startsWith('/') ? val : '/' + val);
                            }}
                            className="bg-transparent border-none outline-none px-2 py-1 text-sm w-48 text-indigo-300"
                            placeholder="index"
                        />
                        <button
                            onClick={() => {
                                const iframes = [iframeUltrawide.current, iframeDesktop.current, iframeMobile.current];
                                iframes.forEach(f => { if (f) f.src = currentUrl; });
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1 rounded-full text-xs transition-all font-semibold shadow-md shadow-indigo-600/20 active:scale-95"
                        >
                            GO
                        </button>
                    </div>

                    <label className="flex items-center space-x-3 text-sm cursor-pointer group px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors">
                        <div className={`w-8 h-4 rounded-full relative transition-all duration-300 ${syncEnabled ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-700'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${syncEnabled ? 'left-4.5 translate-x-0' : 'left-0.5'}`} style={{ left: syncEnabled ? 'calc(100% - 14px)' : '2px' }} />
                        </div>
                        <input type="checkbox" className="hidden" checked={syncEnabled} onChange={() => setSyncEnabled(!syncEnabled)} />
                        <span className={`font-medium transition-colors ${syncEnabled ? 'text-indigo-400' : 'text-slate-400'}`}>Sync Navigation</span>
                    </label>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="flex-1 flex relative">
                {/* Left Area: Ultrawide */}
                <div
                    className="relative h-full overflow-hidden flex flex-col"
                    style={{ width: `${horizontalSplit}%` }}
                >
                    <div className="bg-[#1e293b]/50 backdrop-blur-md px-4 py-2 text-[10px] uppercase font-bold tracking-[0.2em] flex justify-between items-center border-b border-white/5 text-slate-400">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span>Ultrawide</span>
                        </div>
                        <div className="flex items-center bg-slate-900/50 rounded-lg p-0.5 border border-white/5">
                            {SCALES.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setScaleUltrawide(s)}
                                    className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${scaleUltrawide === s ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-500'}`}
                                >
                                    {s * 100}%
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 relative bg-slate-950 overflow-hidden">
                        <div
                            style={{
                                width: `${100 / scaleUltrawide}%`,
                                height: `${100 / scaleUltrawide}%`,
                                transform: `scale(${scaleUltrawide})`,
                                transformOrigin: 'top left',
                                position: 'absolute',
                                top: 0,
                                left: 0
                            }}
                        >
                            <iframe
                                ref={iframeUltrawide}
                                src="/"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Horizontal Splitter */}
                <div
                    className="w-1.5 h-full bg-[#1e293b] hover:bg-indigo-500/50 cursor-col-resize transition-all duration-300 z-10 group relative"
                    onMouseDown={startResizingH}
                >
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/5 group-hover:bg-white/20 transition-all" />
                </div>

                {/* Right Area Container */}
                <div
                    className="flex-1 flex flex-col relative"
                    style={{ width: `${100 - horizontalSplit}%` }}
                >
                    {/* Top Right: Desktop */}
                    <div
                        className="relative overflow-hidden flex flex-col"
                        style={{ height: `${verticalSplit}%` }}
                    >
                        <div className="bg-[#1e293b]/50 backdrop-blur-md px-4 py-2 text-[10px] uppercase font-bold tracking-[0.2em] flex justify-between items-center border-b border-white/5 text-slate-400">
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                <span>Desktop</span>
                            </div>
                            <div className="flex items-center bg-slate-900/50 rounded-lg p-0.5 border border-white/5">
                                {SCALES.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setScaleDesktop(s)}
                                        className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${scaleDesktop === s ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-500'}`}
                                    >
                                        {s * 100}%
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 relative bg-slate-950 overflow-hidden">
                            <div
                                style={{
                                    width: `${100 / scaleDesktop}%`,
                                    height: `${100 / scaleDesktop}%`,
                                    transform: `scale(${scaleDesktop})`,
                                    transformOrigin: 'top left',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0
                                }}
                            >
                                <iframe
                                    ref={iframeDesktop}
                                    src="/"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vertical Splitter */}
                    <div
                        className="w-full h-1.5 bg-[#1e293b] hover:bg-indigo-500/50 cursor-row-resize transition-all duration-300 z-10 group relative"
                        onMouseDown={startResizingV}
                    >
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/5 group-hover:bg-white/20 transition-all" />
                    </div>

                    {/* Bottom Right: Mobile */}
                    <div className="flex-1 relative overflow-hidden flex flex-col">
                        <div className="bg-[#1e293b]/50 backdrop-blur-md px-4 py-2 text-[10px] uppercase font-bold tracking-[0.2em] flex justify-between items-center border-b border-white/5 text-slate-400">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
                                    <span>Mobile</span>
                                </div>
                                <div className="h-4 w-px bg-white/10" />
                                <select
                                    className="bg-transparent text-[10px] font-bold text-indigo-400 focus:outline-none cursor-pointer"
                                    value={mobileDevice}
                                    onChange={(e) => setMobileDevice(e.target.value)}
                                >
                                    {Object.entries(DEVICE_PRESETS).map(([key, info]) => (
                                        <option key={key} value={key} className="bg-slate-800">{info.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center bg-slate-900/50 rounded-lg p-0.5 border border-white/5">
                                {SCALES.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setScaleMobile(s)}
                                        className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${scaleMobile === s ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-500'}`}
                                    >
                                        {s * 100}%
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden p-4 lg:p-8 flex items-center justify-center bg-slate-900/40">
                            <div
                                style={{
                                    aspectRatio: `${currentMobilePreset.width} / ${currentMobilePreset.height}`,
                                    margin: '0 auto',
                                    maxHeight: '100%',
                                    maxWidth: '100%',
                                }}
                                className="relative h-full"
                            >
                                {/* Device Frame */}
                                <div className="absolute inset-0 border-[10px] border-[#0f172a] rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/20 bg-white overflow-hidden">

                                    {/* Browser UI Simulation */}
                                    <div className="flex flex-col h-full pointer-events-auto">
                                        {mobileBrowser === 'safari' ? (
                                            <div className="h-full flex flex-col bg-white">
                                                <div className="h-8 bg-white shrink-0 flex items-center justify-between px-8 text-black font-semibold text-[10px]">
                                                    <span>9:41</span>
                                                    <div className="flex items-center space-x-1.5">
                                                        <div className="w-3 h-3 bg-black rounded-full scale-50" />
                                                        <div className="w-3 h-1.5 bg-black rounded-sm" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 overflow-hidden relative">
                                                    <iframe
                                                        ref={iframeMobile}
                                                        src="/"
                                                        style={{
                                                            width: `${100 / scaleMobile}%`,
                                                            height: `${100 / scaleMobile}%`,
                                                            transform: `scale(${scaleMobile})`,
                                                            transformOrigin: 'top left',
                                                            border: 'none',
                                                        }}
                                                        className="absolute top-0 left-0"
                                                    />
                                                </div>
                                                {/* Safari Bottom Bar */}
                                                <div className="h-20 bg-slate-50/95 backdrop-blur-xl border-t border-black/5 flex flex-col items-center shrink-0 p-3">
                                                    <div className="w-full h-8 bg-white shadow-sm border border-black/5 rounded-xl flex items-center px-4 mb-2">
                                                        <svg className="w-3 h-3 text-slate-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                                        <span className="text-[9px] text-slate-500 font-medium truncate">{currentUrl}</span>
                                                    </div>
                                                    <div className="flex w-full justify-between items-center px-2">
                                                        <div className="w-4 h-4 text-indigo-500 flex items-center justify-center text-xs">❮</div>
                                                        <div className="w-4 h-4 text-indigo-500 flex items-center justify-center text-xs">❯</div>
                                                        <div className="w-4 h-4 text-indigo-500 flex items-center justify-center text-xs">↑</div>
                                                        <div className="w-4 h-4 text-indigo-500 flex items-center justify-center text-xs">📖</div>
                                                        <div className="w-4 h-4 text-indigo-500 flex items-center justify-center text-xs">▢</div>
                                                    </div>
                                                </div>
                                                <div className="h-1 w-1/3 bg-black/20 rounded-full mx-auto mb-1" />
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col bg-slate-900">
                                                {/* Chrome Top Bar */}
                                                <div className="h-16 bg-slate-800 flex flex-col pt-4 px-4 shrink-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[9px] text-white">9:41</span>
                                                        <div className="flex space-x-1 items-center">
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full opacity-50" />
                                                            <div className="w-2.5 h-1.5 bg-white rounded-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-1 h-7 bg-slate-700/50 rounded-full flex items-center px-3 border border-white/5">
                                                            <svg className="w-2.5 h-2.5 text-slate-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                                            <span className="text-[9px] text-slate-300 font-medium truncate">{currentUrl}</span>
                                                        </div>
                                                        <div className="w-5 h-5 border border-slate-500 rounded flex items-center justify-center text-[7px] font-bold text-slate-400">1</div>
                                                        <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                                                    </div>
                                                </div>
                                                <div className="flex-1 overflow-hidden relative">
                                                    <iframe
                                                        ref={iframeMobile}
                                                        src="/"
                                                        style={{
                                                            width: `${100 / scaleMobile}%`,
                                                            height: `${100 / scaleMobile}%`,
                                                            transform: `scale(${scaleMobile})`,
                                                            transformOrigin: 'top left',
                                                            border: 'none',
                                                        }}
                                                        className="absolute top-0 left-0"
                                                    />
                                                </div>
                                                {/* Android Nav Bar */}
                                                <div className="h-10 bg-black flex justify-around items-center shrink-0">
                                                    <div className="w-3 h-3 text-white/50 flex items-center justify-center font-bold text-xs">◃</div>
                                                    <div className="w-2.5 h-2.5 rounded-full border border-white/50" />
                                                    <div className="w-2.5 h-2.5 border border-white/50 rounded-sm" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Dynamic Island / Hardware */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[25%] h-6 bg-[#0f172a] rounded-full z-20 flex items-center justify-end px-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
        </div>
    );
}
