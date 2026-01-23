import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the heavy 3D components to avoid initial bundle bloat
// This matches the CTA (ShaderGradient) design of lazy-loading 3DJS only when needed.

const Canvas = dynamic(
    () => import('@react-three/fiber').then((mod) => mod.Canvas),
    { ssr: false }
);

const SilkAnimation = dynamic(
    () => import('./SilkAnimation'),
    { ssr: false }
);

interface SilkBackgroundProps {
    speed?: number;
    scale?: number;
    color?: string;
    noiseIntensity?: number;
    rotation?: number;
    className?: string;
}

const SilkBackground = (props: SilkBackgroundProps) => {
    const { className = "", ...rest } = props;

    return (
        <div className={`absolute inset-0 z-0 pointer-events-none overflow-hidden ${className}`}>
            <Canvas dpr={[1, 2]} frameloop="always">
                <Suspense fallback={null}>
                    <SilkAnimation {...rest} />
                </Suspense>
            </Canvas>
            {/* Subtle overlay to ensure content readability */}
            <div className="absolute inset-0 bg-white/10 dark:bg-black/20 pointer-events-none" />
        </div>
    );
};

export default SilkBackground;
