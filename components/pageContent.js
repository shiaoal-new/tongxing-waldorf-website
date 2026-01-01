/**
 * PageContent Component
 * 
 * 主内容容器组件,使用语义化的 <main> 标签
 * 负责处理:
 * - 导航栏的 padding 偏移
 * - 背景透明度(当有视差背景时)
 * - 阴影效果
 * - 自定义样式类
 */
export default function PageContent({
    children,
    navbarPadding = false,
    backgroundSrc,
    className = ""
}) {
    return (
        <main
            className={`
                ${navbarPadding ? "pt-20" : ""} 
                ${backgroundSrc ? "bg-transparent" : "bg-brand-bg dark:bg-trueGray-900"} 
                relative z-10 
                shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] 
                ${className}
            `.trim().replace(/\s+/g, ' ')}
        >
            {children}
        </main>
    );
}
