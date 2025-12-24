import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const DEVICE_PRESETS = {
    iphone16e: { name: 'iPhone 16e', width: 390, height: 844, browser: 'safari', bezelType: 'notch' },
    iphone17promax: { name: 'iPhone 17 Pro Max', width: 440, height: 956, browser: 'safari', bezelType: 'island-wide' },
    pixel7: { name: 'Pixel 7', width: 412, height: 915, browser: 'chrome' },
    s23ultra: { name: 'S23 Ultra', width: 384, height: 854, browser: 'chrome' },
};

const DESKTOP_WIDTHS = [960, 1024, 1200, 1440, 1920];

export default function DeviceSimulator() {
    const router = useRouter();
    const [currentUrl, setCurrentUrl] = useState('/');
    const [syncEnabled, setSyncEnabled] = useState(true);

    // Splitter position (percentage)
    const [horizontalSplit, setHorizontalSplit] = useState(70);

    // Target widths
    const [widthDesktop, setWidthDesktop] = useState(1280);

    // Track actual panel sizes in pixels
    const [panelSizes, setPanelSizes] = useState({
        desktop: { w: 0, h: 0 },
        mobile: { w: 0, h: 0 }
    });

    const containerRefDesktop = useRef(null);
    const containerRefMobile = useRef(null);

    // Persistence
    useEffect(() => {
        document.documentElement.classList.add('is-simulator');
        return () => document.documentElement.classList.remove('is-simulator');
    }, []);

    useEffect(() => {
        const savedH = localStorage.getItem('simulator_h_split_v2');
        const savedWD = localStorage.getItem('simulator_w_desktop_v2');
        if (savedH) setHorizontalSplit(parseFloat(savedH));
        if (savedWD) setWidthDesktop(parseInt(savedWD));
    }, []);

    useEffect(() => {
        localStorage.setItem('simulator_h_split_v2', horizontalSplit);
        localStorage.setItem('simulator_w_desktop_v2', widthDesktop);
    }, [horizontalSplit, widthDesktop]);

    // Update panel sizes on resize or split change
    useEffect(() => {
        const updateSizes = () => {
            const getDims = (ref) => ref.current ? { w: ref.current.clientWidth, h: ref.current.clientHeight } : { w: 0, h: 0 };
            setPanelSizes({
                desktop: getDims(containerRefDesktop),
                mobile: getDims(containerRefMobile),
            });
        };
        updateSizes();
        window.addEventListener('resize', updateSizes);
        return () => window.removeEventListener('resize', updateSizes);
    }, [horizontalSplit]);

    // Mobile settings
    const [mobileDevice, setMobileDevice] = useState('iphone17promax');
    const currentMobilePreset = DEVICE_PRESETS[mobileDevice];
    const mobileBrowser = currentMobilePreset.browser;

    const iframeDesktop = useRef(null);
    const iframeMobile = useRef(null);

    // Polling interval for URL sync
    useEffect(() => {
        if (!syncEnabled) return;

        const interval = setInterval(() => {
            const iframes = [
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

        const iframes = [iframeDesktop.current, iframeMobile.current];
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
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isResizingH.current) {
                e.preventDefault();
                const newSplit = (e.clientX / window.innerWidth) * 100;
                setHorizontalSplit(Math.min(Math.max(newSplit, 20), 80));
            }
        };

        const handleMouseUp = () => {
            isResizingH.current = false;
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

    // --- Mobile Touch Emulation ---
    const [isMobileMouseDown, setIsMobileMouseDown] = useState(false);
    const lastMobilePos = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
    const pressedElementRef = useRef(null);

    const proxyToMobile = (e, type) => {
        const iframe = iframeMobile.current;
        if (!iframe || !iframe.contentDocument) return;

        const rect = iframe.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scaleM;
        const y = (e.clientY - rect.top) / scaleM;

        const target = iframe.contentDocument.elementFromPoint(x, y);
        if (!target) return;

        const event = new CustomEvent(type, {
            bubbles: true,
            cancelable: true,
        });

        const touch = {
            identifier: Date.now(),
            target: target,
            clientX: x,
            clientY: y,
            screenX: e.screenX,
            screenY: e.screenY,
            pageX: x + (iframe.contentWindow?.scrollX || 0),
            pageY: y + (iframe.contentWindow?.scrollY || 0),
        };

        // Populate touch lists
        event.touches = [touch];
        event.targetTouches = [touch];
        event.changedTouches = [touch];

        target.dispatchEvent(event);
        return target;
    };

    const onMobileMouseDown = (e) => {
        setIsMobileMouseDown(true);
        lastMobilePos.current = {
            x: e.clientX,
            y: e.clientY,
            startX: e.clientX,
            startY: e.clientY
        };
        const target = proxyToMobile(e, 'touchstart');
        if (target && target.classList) {
            target.classList.add('simulator-pressed');
            pressedElementRef.current = target;
        }
    };

    const onMobileMouseMove = (e) => {
        if (!isMobileMouseDown) return;

        const dx = lastMobilePos.current.x - e.clientX;
        const dy = lastMobilePos.current.y - e.clientY;

        const iframe = iframeMobile.current;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.scrollBy(dx, dy);
        }

        lastMobilePos.current.x = e.clientX;
        lastMobilePos.current.y = e.clientY;

        proxyToMobile(e, 'touchmove');
    };

    const cleanupPressed = () => {
        setIsMobileMouseDown(false);
        if (pressedElementRef.current) {
            try {
                pressedElementRef.current.classList.remove('simulator-pressed');
            } catch (e) { }
            pressedElementRef.current = null;
        }
    };

    const onMobileMouseUp = (e) => {
        if (!isMobileMouseDown) return;
        cleanupPressed();

        proxyToMobile(e, 'touchend');

        // click detection
        const dist = Math.sqrt(
            Math.pow(e.clientX - lastMobilePos.current.startX, 2) +
            Math.pow(e.clientY - lastMobilePos.current.startY, 2)
        );

        if (dist < 10) {
            const iframe = iframeMobile.current;
            if (iframe && iframe.contentDocument) {
                const rect = iframe.getBoundingClientRect();
                const x = (e.clientX - rect.left) / scaleM;
                const y = (e.clientY - rect.top) / scaleM;
                const target = iframe.contentDocument.elementFromPoint(x, y);
                if (target && typeof target.click === 'function') {
                    target.click();
                    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.contentEditable === 'true') {
                        target.focus();
                    }
                }
            }
        }
    };

    const onMobileWheel = (e) => {
        const iframe = iframeMobile.current;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.scrollBy({
                left: e.deltaX,
                top: e.deltaY,
                behavior: 'auto'
            });
        }
    };
    // ------------------------------

    // Calculate scale
    const scaleD = panelSizes.desktop.w / widthDesktop || 1;
    const paddingM = 40; // Saftey margin for mobile view
    const scaleM = Math.min(
        (panelSizes.mobile.w - paddingM) / currentMobilePreset.width,
        (panelSizes.mobile.h - paddingM) / currentMobilePreset.height
    ) || 1;

    const mobileCursor = React.useMemo(() => {
        const baseSize = 40;
        const size = Math.max(10, Math.round(baseSize * scaleM));
        const center = size / 2;
        const r1 = (15 / 40) * size;
        const r2 = (14 / 40) * size;
        const sw1 = (2 / 40) * size;
        const sw2 = (1.5 / 40) * size;

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${center}" cy="${center}" r="${r1}" fill="rgba(128, 128, 128, 0.3)" stroke="rgba(0, 0, 0, 0.3)" stroke-width="${sw1}"/><circle cx="${center}" cy="${center}" r="${r2}" fill="none" stroke="rgba(255, 255, 255, 0.7)" stroke-width="${sw2}"/></svg>`;

        return {
            url: `data:image/svg+xml;base64,${typeof btoa !== 'undefined' ? btoa(svg) : ''}`,
            center: center
        };
    }, [scaleM]);

    const injectMobileCursor = (iframe) => {
        if (!iframe || !iframe.contentWindow || !mobileCursor.url) return;
        try {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            if (!doc) return;
            const styleId = 'simulator-cursor-style';
            let style = doc.getElementById(styleId);
            if (!style) {
                style = doc.createElement('style');
                style.id = styleId;
                doc.head.appendChild(style);
            }
            const css = `
                * {
                    cursor: url('${mobileCursor.url}') ${mobileCursor.center} ${mobileCursor.center}, auto !important;
                    -webkit-tap-highlight-color: rgba(128, 128, 128, 0.2) !important;
                }
                
                /* Hover effect is now blocked by the overlay layer in the simulator. */
                /* We keep simple active feedback here. */
                a, button, [role="button"], input, select, textarea {
                    cursor: url('${mobileCursor.url}') ${mobileCursor.center} ${mobileCursor.center}, auto !important;
                }

                a, button, [role="button"], input, select, textarea {
                    cursor: url('${mobileCursor.url}') ${mobileCursor.center} ${mobileCursor.center}, auto !important;
                }

                /* 保持點擊時的 active 饋送 */
                *:active, .simulator-pressed {
                    opacity: 0.7 !important;
                    transition: opacity 0.1s !important;
                }
            `;
            if (style.textContent !== css) {
                style.textContent = css;
            }
        } catch (e) {
            // Cross-origin issues
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            injectMobileCursor(iframeMobile.current);
        }, 1000);
        return () => clearInterval(interval);
    }, [currentUrl, mobileDevice, mobileCursor]);

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
                                const iframes = [iframeDesktop.current, iframeMobile.current];
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
                {/* Desktop Area */}
                <div
                    className="relative h-full overflow-hidden flex flex-col"
                    style={{ width: `${horizontalSplit}%` }}
                >
                    <div className="bg-[#1e293b]/50 backdrop-blur-md px-4 py-2 text-[10px] uppercase font-bold tracking-[0.2em] flex justify-between items-center border-b border-white/5 text-slate-400">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            <span>Desktop Viewport</span>
                        </div>
                        <div className="flex items-center bg-slate-900/50 rounded-lg p-0.5 border border-white/5">
                            {DESKTOP_WIDTHS.map(w => (
                                <button
                                    key={w}
                                    onClick={() => setWidthDesktop(w)}
                                    className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${widthDesktop === w ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-500'}`}
                                >
                                    {w}px
                                </button>
                            ))}
                        </div>
                    </div>
                    <div ref={containerRefDesktop} className="flex-1 relative bg-slate-950 overflow-hidden">
                        <div
                            style={{
                                width: `${widthDesktop}px`,
                                height: `${panelSizes.desktop.h / scaleD}px`,
                                transform: `scale(${scaleD})`,
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

                {/* Horizontal Splitter */}
                <div
                    className="w-1.5 h-full bg-[#1e293b] hover:bg-indigo-500/50 cursor-col-resize transition-all duration-300 z-10 group relative"
                    onMouseDown={startResizingH}
                >
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/5 group-hover:bg-white/20 transition-all" />
                </div>

                {/* Mobile Area */}
                <div
                    className="relative h-full overflow-hidden flex flex-col bg-slate-900/40"
                    style={{ width: `${100 - horizontalSplit}%` }}
                >
                    <div className="bg-[#1e293b]/50 backdrop-blur-md px-4 py-2 text-[10px] uppercase font-bold tracking-[0.2em] flex justify-between items-center border-b border-white/5 text-slate-400">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
                                <span>Mobile</span>
                            </div>
                            <div className="h-4 w-px bg-white/10" />
                            <select
                                className="bg-transparent text-[10px] font-bold text-indigo-400 focus:outline-none cursor-point-reset"
                                value={mobileDevice}
                                onChange={(e) => setMobileDevice(e.target.value)}
                            >
                                {Object.entries(DEVICE_PRESETS).map(([key, info]) => (
                                    <option key={key} value={key} className="bg-slate-800">{info.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center bg-slate-900/50 rounded-lg py-1 px-3 border border-white/5">
                            <span className="text-[9px] text-slate-500 uppercase font-bold">Auto-Fit Viewport</span>
                        </div>
                    </div>

                    <div ref={containerRefMobile} className="flex-1 relative overflow-hidden bg-slate-950 mobile-simulator-viewport">
                        <div
                            style={{
                                width: `${currentMobilePreset.width}px`,
                                height: `${currentMobilePreset.height}px`,
                                transform: `scale(${scaleM}) translate(-50%, -50%)`,
                                transformOrigin: 'top left',
                                position: 'absolute',
                                top: '50%',
                                left: '50%'
                            }}
                            className="transition-transform duration-300"
                        >
                            {/* Device Frame */}
                            <div className="absolute inset-0 border-[8px] border-[#0f172a] rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/20 bg-white overflow-hidden">
                                <div className="flex flex-col h-full pointer-events-auto">
                                    {mobileBrowser === 'safari' ? (
                                        <div className="h-full flex flex-col bg-white">
                                            <div className="h-8 bg-white shrink-0 flex items-center justify-between px-6 text-black font-bold text-[10px]">
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
                                                    onLoad={(e) => injectMobileCursor(e.target)}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        border: 'none',
                                                    }}
                                                    className="absolute top-0 left-0"
                                                />
                                                {/* Touch Emulation Overlay */}
                                                <div
                                                    className={`absolute inset-0 z-30 ${isResizing ? 'pointer-events-none' : 'pointer-events-auto'}`}
                                                    onMouseDown={onMobileMouseDown}
                                                    onMouseMove={onMobileMouseMove}
                                                    onMouseUp={onMobileMouseUp}
                                                    onMouseLeave={cleanupPressed}
                                                    onWheel={onMobileWheel}
                                                    style={{ cursor: `url('${mobileCursor.url}') ${mobileCursor.center} ${mobileCursor.center}, auto` }}
                                                />
                                            </div>
                                            <div className="h-20 bg-slate-50/95 backdrop-blur-xl border-t border-black/5 flex flex-col items-center shrink-0 p-3">
                                                <div className="w-full h-8 bg-white shadow-sm border border-black/5 rounded-xl flex items-center px-4 mb-2">
                                                    <svg className="w-3 h-3 text-slate-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                                    <span className="text-[9px] text-slate-500 font-medium truncate">{currentUrl}</span>
                                                </div>
                                                <div className="flex w-full justify-between items-center px-2">
                                                    <div className="w-4 h-4 text-indigo-500 flex items-center justify-center text-xs cursor-pointer">❮</div>
                                                    <div className="w-4 h-4 text-indigo-500 flex items-center justify-center text-xs cursor-pointer">❯</div>
                                                    <div className="w-4 h-4 text-indigo-500 flex items-center justify-center text-xs cursor-pointer">↑</div>
                                                    <div className="w-4 h-4 text-indigo-500 flex items-center justify-center text-xs cursor-pointer">📖</div>
                                                    <div className="w-4 h-4 text-indigo-500 flex items-center justify-center text-xs cursor-pointer">▢</div>
                                                </div>
                                            </div>
                                            <div className="h-1 w-1/3 bg-black/20 rounded-full mx-auto mb-1" />
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col bg-slate-900">
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
                                                    onLoad={(e) => injectMobileCursor(e.target)}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        border: 'none',
                                                    }}
                                                    className="absolute top-0 left-0"
                                                />
                                                {/* Touch Emulation Overlay */}
                                                <div
                                                    className={`absolute inset-0 z-30 ${isResizing ? 'pointer-events-none' : 'pointer-events-auto'}`}
                                                    onMouseDown={onMobileMouseDown}
                                                    onMouseMove={onMobileMouseMove}
                                                    onMouseUp={onMobileMouseUp}
                                                    onMouseLeave={cleanupPressed}
                                                    onWheel={onMobileWheel}
                                                    style={{ cursor: `url('${mobileCursor.url}') ${mobileCursor.center} ${mobileCursor.center}, auto` }}
                                                />
                                            </div>
                                            <div className="h-10 bg-black flex justify-around items-center shrink-0">
                                                <div className="w-3 h-3 text-white/50 flex items-center justify-center font-bold text-xs">◃</div>
                                                <div className="w-2.5 h-2.5 rounded-full border border-white/50" />
                                                <div className="w-2.5 h-2.5 border border-white/50 rounded-sm" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {currentMobilePreset.bezelType === 'notch' && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[52%] h-[28px] bg-[#0f172a] rounded-b-[1rem] z-20 flex flex-col items-center shadow-md">
                                    {/* Concave Corner Transitions */}
                                    <div className="absolute top-0 -left-2.5 w-2.5 h-2.5 rounded-tr-[10px] shadow-[4px_0_0_0_#0f172a]" />
                                    <div className="absolute top-0 -right-2.5 w-2.5 h-2.5 rounded-tl-[10px] shadow-[-4px_0_0_0_#0f172a]" />

                                    {/* Speaker Grille */}
                                    <div className="w-12 h-[3px] bg-slate-800/40 rounded-full mt-1.5 border border-black/10" />

                                    {/* Camera/Sensor area */}
                                    <div className="absolute right-[25%] top-[8px] w-2.5 h-2.5 rounded-full bg-[#1a1f2e] shadow-inner flex items-center justify-center border border-white/5">
                                        <div className="w-1 h-1 rounded-full bg-blue-900/30" />
                                    </div>
                                </div>
                            )}

                            {currentMobilePreset.bezelType?.startsWith('island') && (
                                <div
                                    className={`absolute top-2.5 left-1/2 -translate-x-1/2 h-[22px] bg-[#0f172a] rounded-full z-20 flex items-center justify-end px-3 transition-all duration-500 shadow-lg ${currentMobilePreset.bezelType === 'island-wide' ? 'w-[32%]' : 'w-[22%]'
                                        }`}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#1e293b]" />
                                </div>
                            )}
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

                .mobile-simulator-viewport, 
                .mobile-simulator-viewport * {
                    cursor: url('${mobileCursor.url}') ${mobileCursor.center} ${mobileCursor.center}, auto !important;
                }

                .cursor-point-reset {
                    cursor: pointer !important;
                }
            `}</style>
        </div>
    );
}

