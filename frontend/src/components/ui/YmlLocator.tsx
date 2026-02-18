import { useEffect } from 'react';

/**
 * YmlLocator - 开发环境辅助工具
 * 功能：按住 Option + Shift + 点击页面组件，自动在 VS Code 中打开对应的 YAML 源文件
 */
export default function YmlLocator() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;

        const handleContextMenuInfo = (e: MouseEvent) => {
            // 调试日志：显示当前按下的键
            const isMatch = e.altKey;

            if (isMatch) {
                // 向上查找到带有 data-yml-src 的元素
                const target = e.target as HTMLElement;
                const container = target.closest('[data-yml-src]');

                if (container) {
                    const rawValue = container.getAttribute('data-yml-src');
                    if (rawValue) {
                        e.preventDefault(); // 阻止默认右键菜单
                        e.stopPropagation();

                        // 解析 path:line 格式（例如 /path/to/file.yml:27）
                        // 注意：路径本身可能包含冒号（Windows），所以从最后一个冒号分割
                        const lastColon = rawValue.lastIndexOf(':');
                        let filePath = rawValue;
                        let lineNum = '';
                        if (lastColon > 0 && /^\d+$/.test(rawValue.slice(lastColon + 1))) {
                            filePath = rawValue.slice(0, lastColon);
                            lineNum = rawValue.slice(lastColon + 1);
                        }

                        // antigravity://file/path/to/file.yml:line:col
                        const url = lineNum
                            ? `antigravity://file${filePath}:${lineNum}:1`
                            : `antigravity://file${filePath}`;
                        window.location.href = url;

                        console.log(`[YML Locator] %cOpening: ${url}`, 'color: #10b981; font-weight: bold;');

                        // 增加视觉反馈
                        const el = container as HTMLElement;
                        const originalTransition = el.style.transition;
                        const originalShadow = el.style.boxShadow;
                        const originalZIndex = el.style.zIndex;

                        el.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        el.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)';
                        el.style.transform = 'scale(0.995)';
                        el.style.zIndex = '9999';

                        // 创建一个临时的“打开中”提示标签
                        const badge = document.createElement('div');
                        badge.innerText = 'Opening in VS Code...';
                        badge.style.position = 'fixed';
                        badge.style.top = `${e.clientY}px`;
                        badge.style.left = `${e.clientX}px`;
                        badge.style.transform = 'translate(-50%, -100%)';
                        badge.style.backgroundColor = '#3b82f6';
                        badge.style.color = 'white';
                        badge.style.padding = '4px 12px';
                        badge.style.borderRadius = '99px';
                        badge.style.fontSize = '12px';
                        badge.style.fontWeight = 'bold';
                        badge.style.pointerEvents = 'none';
                        badge.style.zIndex = '10000';
                        badge.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                        badge.style.animation = 'yml-fade-up 0.5s ease-out forwards';

                        document.body.appendChild(badge);

                        setTimeout(() => {
                            el.style.transform = '';
                            el.style.boxShadow = originalShadow;
                            el.style.zIndex = originalZIndex;
                            setTimeout(() => {
                                el.style.transition = originalTransition;
                                if (badge.parentNode) document.body.removeChild(badge);
                            }, 300);
                        }, 500);
                    }
                } else {
                    console.warn('[YML Locator] %cOption + 右键正确，但点击的元素及其祖先没有 data-yml-src 属性', 'color: #f59e0b;');
                }
            }
        };

        // 使用 contextmenu 事件来捕获右键
        window.addEventListener('contextmenu', handleContextMenuInfo, true);

        return () => window.removeEventListener('contextmenu', handleContextMenuInfo, true);
    }, []);

    return (
        <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes yml-fade-up {
                0% { opacity: 0; transform: translate(-50%, -80%); }
                20% { opacity: 1; transform: translate(-50%, -120%); }
                80% { opacity: 1; transform: translate(-50%, -120%); }
                100% { opacity: 0; transform: translate(-50%, -150%); }
            }
        `}} />
    );
}
