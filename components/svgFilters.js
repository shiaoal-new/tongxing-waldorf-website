/**
 * SVG Filters Component
 * 包含可重用的 SVG 滤镜定义
 */
export default function SvgFilters() {
    return (
        <svg
            style={{ position: 'absolute', width: 0, height: 0 }}
            aria-hidden="true"
        >
            <defs>
                {/* Watercolor V2 Filter - 水彩效果滤镜 */}
                <filter id="watercolor-v2">
                    <title>watercolor</title>
                    {/* 程序化纹理 - Procedural Textures */}
                    <feTurbulence
                        result="noise-lg"
                        type="fractalNoise"
                        baseFrequency=".04"
                        numOctaves="2"
                        seed="1458"
                    />
                    <feTurbulence
                        result="noise-md"
                        type="fractalNoise"
                        baseFrequency=".2"
                        numOctaves="3"
                        seed="7218"
                    />

                    {/* 基础图形合成 */}
                    <feComposite
                        result="BaseGraphic"
                        in="SourceGraphic"
                        in2="noise-lg"
                        operator="arithmetic"
                        k1="0.5"
                        k2="0.6"
                        k4="-.07"
                    />

                    {/* 第一层 - Layer 1 */}
                    <feMorphology
                        id="water"
                        result="layer-1"
                        in="BaseGraphic"
                        operator="dilate"
                        radius="1"
                    />

                    {/* 位移映射序列 - Displacement Maps */}
                    <feDisplacementMap
                        result="displacement-map-0"
                        in="layer-1"
                        in2="noise-lg"
                        xChannelSelector="R"
                        yChannelSelector="B"
                        scale="2"
                    />
                    <feDisplacementMap
                        result="displacement-map-1"
                        in="displacement-map-0"
                        in2="noise-md"
                        xChannelSelector="R"
                        yChannelSelector="B"
                        scale="4"
                    />
                    <feDisplacementMap
                        result="mask"
                        in="displacement-map-1"
                        in2="noise-lg"
                        xChannelSelector="A"
                        yChannelSelector="A"
                        scale="6"
                    />

                    {/* 高斯模糊和合成 */}
                    <feGaussianBlur
                        result="gaussian-blur-0"
                        in="mask"
                        stdDeviation="1"
                    />
                    <feComposite
                        result="composite-0"
                        in="displacement-map-1"
                        in2="gaussian-blur-0"
                        operator="arithmetic"
                        k1="1.2"
                        k2="-.25"
                        k3="-.25"
                        k4="0"
                    />

                    {/* 第二层 - Layer 2 */}
                    <feDisplacementMap
                        result="layer-2"
                        in="BaseGraphic"
                        in2="noise-lg"
                        xChannelSelector="G"
                        yChannelSelector="R"
                        scale="4"
                    />
                    <feDisplacementMap
                        result="displacement-map-2"
                        in="layer-2"
                        in2="noise-md"
                        xChannelSelector="A"
                        yChannelSelector="G"
                        scale="2"
                    />

                    {/* 发光效果 - Glow Effect */}
                    <feDisplacementMap
                        result="glow"
                        in="BaseGraphic"
                        in2="noise-lg"
                        xChannelSelector="R"
                        yChannelSelector="A"
                        scale="16"
                    />
                    <feMorphology
                        result="glow-diff"
                        in="glow"
                        operator="erode"
                        radius="1"
                    />
                    <feComposite
                        result="composite-1"
                        in="glow"
                        in2="glow-diff"
                        operator="out"
                    />
                    <feGaussianBlur
                        result="gaussian-blur-1"
                        in="composite-1"
                        stdDeviation="1.6"
                    />

                    {/* 最终合成 - Final Composites */}
                    <feComposite
                        id="color"
                        result="composite-2"
                        in="displacement-map-2"
                        in2="gaussian-blur-1"
                        operator="arithmetic"
                        k1="1.5"
                        k2="0"
                        k3=".3"
                    />
                    <feComposite
                        in="composite-0"
                        in2="composite-2"
                        operator="arithmetic"
                        k1="-0.8"
                        k2="0.8"
                        k3="1.4"
                        result="composite-3"
                    />
                </filter>

                {/* Paper Texture Filter - 纸张纹理滤镜 */}
                <filter id="paper-texture">
                    <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="5" result="noise" />
                    <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="1">
                        <feDistantLight azimuth="45" elevation="60" />
                    </feDiffuseLighting>
                </filter>
            </defs>
        </svg>
    );
}
