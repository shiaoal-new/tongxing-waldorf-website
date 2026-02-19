export const IMAGEKIT_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_ENDPOINT || "https://ik.imagekit.io/tongxingwaldorf/";

const VIDEO_EXTENSIONS = /\.(mp4|mov|webm|ogv|m4v|mpeg|3gp|ogg|hevc)$/i;
const NON_MP4_VIDEO = /\.(webm|ogv|m4v|mpeg|3gp|ogg|hevc)$/i;

/**
 * 檢查是否為特別標記的 ImageKit 路徑 (以 ik: 開頭)
 */
export function isImageKitPath(path: string | undefined): boolean {
    return !!path && path.startsWith("ik:");
}

/**
 * 從 ik: 前綴的路徑中提取 ImageKit 相對路徑
 * 並自動加上影片所需的後綴
 */
export function getImageKitPath(path: string | undefined): string {
    if (!path) return "";
    let cleanPath = path.replace(/^ik:/, "");

    // 如果是影片且非標准格式，補上後綴讓 ImageKit 識別
    if (VIDEO_EXTENSIONS.test(cleanPath) && NON_MP4_VIDEO.test(cleanPath) && !cleanPath.endsWith("/ik-video.mp4")) {
        return `${cleanPath}/ik-video.mp4`;
    }

    return cleanPath;
}

export function getOptimizedUrl(
    path: string | undefined,
    transformations: string = "f-auto,q-auto"
): string | undefined {
    if (!path) return undefined;

    // If it's an ik: path, return the full ImageKit URL with transformations
    if (isImageKitPath(path)) {
        const cleanPath = getImageKitPath(path);
        const endpoint = IMAGEKIT_ENDPOINT.replace(/\/$/, "");

        if (transformations) {
            const trPrefix = transformations.startsWith("tr:") ? transformations : `tr:${transformations}`;
            return `${endpoint}/${trPrefix}/${cleanPath}`;
        }
        return `${endpoint}/${cleanPath}`;
    }

    try {
        if (!path.includes("imagekit.io")) {
            return path;
        }

        // 如果已經有手動轉換參數或路徑，則尊重原樣（不再重複疊加）
        if (path.includes("?tr=") || path.includes("/tr:") || path.includes("/ik-video.mp4")) {
            return path;
        }

        const isVideo = VIDEO_EXTENSIONS.test(path);

        if (isVideo) {
            if (NON_MP4_VIDEO.test(path)) {
                return `${path}/ik-video.mp4`;
            }
            return path;
        }

        // 圖片：使用標準優化參數
        const separator = path.includes("?") ? "&" : "?";
        return `${path}${separator}tr=${transformations}`;

    } catch (e) {
        console.error("ImageKit optimization failed:", e);
        return path;
    }
}
