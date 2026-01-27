import React, { Suspense, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import ShaderGradient and its canvas to avoid SSR issues with Three.js
const ShaderGradientCanvas = dynamic(
    () => import('shadergradient').then((mod) => mod.ShaderGradientCanvas),
    { ssr: false }
);

const ShaderGradient = dynamic(
    () => import('shadergradient').then((mod) => mod.ShaderGradient),
    { ssr: false }
);

const ShaderGradientBackground = () => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Wait for shader simulation to stabilize (fix for initial fast movement artifact)
        const timer = setTimeout(() => {
            setLoaded(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        >
            <ShaderGradientCanvas
                pointerEvents="none"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                }}
            >
                <Suspense fallback={null}>
                    <ShaderGradient
                        animate="on"
                        axesHelper="off"
                        brightness={1.1}
                        cAzimuthAngle={170}
                        cDistance={4.4}
                        cPolarAngle={70}
                        cameraZoom={1}
                        color1="#f2a154"
                        color2="#eb8129"
                        color3="#b94c18"
                        destination="onCanvas"
                        embedMode="off"
                        envPreset="city"
                        format="gif"
                        fov={45}
                        frameRate={10}
                        gizmoHelper="hide"
                        grain="off"
                        lightType="3d"
                        pixelDensity={1}
                        positionX={0}
                        positionY={0.9}
                        positionZ={-0.3}
                        range="disabled"
                        rangeEnd={40}
                        rangeStart={0}
                        reflection={0.1}
                        rotationX={45}
                        rotationY={0}
                        rotationZ={0}
                        shader="defaults"
                        type="waterPlane"
                        uAmplitude={0.4}
                        uDensity={1.2}
                        uFrequency={3.5}
                        uSpeed={0.2}
                        uStrength={2.5}
                        uTime={0}
                        wireframe={false}
                        zoomOut={false}
                    />
                </Suspense>
            </ShaderGradientCanvas>
            {/* Overlay to ensure text readability - subtle dark tint for white text contrast */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </motion.div>
    );
};

export default ShaderGradientBackground;
