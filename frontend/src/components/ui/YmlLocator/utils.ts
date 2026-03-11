// 取得元素真實可見邊界，即使它是 display: contents 或 wrapper
export function getVisualRect(el: HTMLElement): DOMRect {
    let rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0 && el.children.length > 0) {
        // 嘗試往下找第一個有寬高的子元素，適用於 inline wrapper 或 display: contents
        for (let i = 0; i < el.children.length; i++) {
            const childRect = (el.children[i] as HTMLElement).getBoundingClientRect();
            if (childRect.width > 0 || childRect.height > 0) {
                return childRect;
            }
        }
    }
    return rect;
}

export function jumpToYml(ymlSrc: string) {
    const rawValue = ymlSrc;
    // 解析 path:line 格式
    const lastColon = rawValue.lastIndexOf(':');
    let filePath = rawValue;
    let lineNum = '';
    if (lastColon > 0 && /^\d+$/.test(rawValue.slice(lastColon + 1))) {
        filePath = rawValue.slice(0, lastColon);
        lineNum = rawValue.slice(lastColon + 1);
    }

    const url = lineNum
        ? `antigravity://file${filePath}:${lineNum}:1`
        : `antigravity://file${filePath}`;
    window.location.href = url;

    console.log(`[YML Locator] %cOpening: ${url}`, 'color: #10b981; font-weight: bold;');
}

export const STORAGE_KEY = 'antigravity-yml-notes';
