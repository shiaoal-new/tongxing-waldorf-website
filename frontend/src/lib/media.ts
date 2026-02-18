export const IMAGEKIT_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_ENDPOINT || "";

const VIDEO_EXTENSIONS = /\.(mp4|mov|webm|ogv|m4v|mpeg|3gp|ogg|hevc)$/i;
const NON_MP4_VIDEO = /\.(webm|ogv|m4v|mpeg|3gp|ogg|hevc)$/i;

/**
 * 將 ImageKit 網址加上優化參數
 * - 影片：加上 /ik-video.mp4 後綴（讓 ImageKit 識別為影片）
 * - 圖片：加上 ?tr=f-auto,q-auto
 * - 其他網址或本地路徑：原樣返回
 */
export function getOptimizedUrl(
    path: string | undefined,
    imageTransformations: string = "f-auto,q-auto"
): string | undefined {
    if (!path) return undefined;

    try {
        if (!path.includes("imagekit.io")) {
            // 本地路徑或其他 CDN，原樣返回
            return path;
        }

        // 已經有轉換參數，不再重複處理
        if (path.includes("?tr=") || path.includes("/tr:") || path.includes("/ik-video.mp4")) {
            return path;
        }

        const isVideo = VIDEO_EXTENSIONS.test(path);

        if (isVideo) {
            // 影片：f-auto/q-auto 是圖片專用參數，影片不支援
            // 對非 .mp4/.mov 格式，加上 /ik-video.mp4 讓 ImageKit 識別為影片
            if (NON_MP4_VIDEO.test(path)) {
                return `${path}/ik-video.mp4`;
            }
            // .mp4 / .mov 本身已可被識別，直接返回
            return path;
        }

        // 圖片：加上查詢參數優化
        const separator = path.includes("?") ? "&" : "?";
        return `${path}${separator}tr=${imageTransformations}`;

    } catch (e) {
        console.error("ImageKit optimization failed:", e);
        return path;
    }
}
