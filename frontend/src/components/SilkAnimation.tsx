/* eslint-disable react/no-unknown-property */
import { useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useRef, useMemo, useLayoutEffect, useState } from 'react';
import { Color, Mesh } from 'three';

// Helper to resolve CSS variables or RGB strings to hex for Three.js
const resolveColor = (colorStr: string): string => {
    if (typeof window === 'undefined') return '#8D7B68';
    if (colorStr.startsWith('#')) return colorStr;
    const temp = document.createElement('div');
    temp.style.color = colorStr;
    document.body.appendChild(temp);
    const computed = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    return computed;
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;
uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;
  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);
  float pattern = 0.6 + 0.4 * sin(5.0 * (tex.x + tex.y + cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * tOffset) + sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));
  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

const SilkPlane = forwardRef<Mesh, { uniforms: any }>(function SilkPlane({ uniforms }, ref) {
    const { viewport } = useThree();
    useLayoutEffect(() => {
        if (ref && 'current' in ref && ref.current) {
            ref.current.scale.set(viewport.width, viewport.height, 1);
        }
    }, [ref, viewport]);

    useFrame((_, delta) => {
        if (ref && 'current' in ref && ref.current) {
            (ref.current.material as any).uniforms.uTime.value += 0.1 * delta;
        }
    });

    return (
        <mesh ref={ref}>
            <planeGeometry args={[1, 1, 1, 1]} />
            <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent={true} />
        </mesh>
    );
});

interface SilkAnimationProps {
    speed?: number;
    scale?: number;
    color?: string;
    noiseIntensity?: number;
    rotation?: number;
}

const SilkAnimation = ({ speed = 5, scale = 1, color = '#8D7B68', noiseIntensity = 0.5, rotation = 0 }: SilkAnimationProps) => {
    const meshRef = useRef<Mesh>(null);
    const [resolvedColor, setResolvedColor] = useState('#8D7B68');

    useLayoutEffect(() => {
        setResolvedColor(resolveColor(color));
    }, [color]);

    const uniforms = useMemo(() => ({
        uSpeed: { value: speed },
        uScale: { value: scale },
        uNoiseIntensity: { value: noiseIntensity },
        uColor: { value: new Color(resolvedColor) },
        uRotation: { value: rotation },
        uTime: { value: 0 }
    }), [speed, scale, noiseIntensity, resolvedColor, rotation]);

    return <SilkPlane ref={meshRef} uniforms={uniforms} />;
};

export default SilkAnimation;
