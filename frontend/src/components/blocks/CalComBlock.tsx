import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import { CalComBlock as CalComBlockType } from "../../types/content";

/**
 * CalComBlock Component
 * 渲染 Cal.com 預約嵌入組件
 * 
 * 註：由於 @calcom/atoms 在本地環境安裝遭遇 package manager 協議相容性問題 (workspace:*)，
 * 目前暫時維持使用 embed-react (Iframe) 方式，但透過樣式與高度優化來達到接近原生組件的效果。
 */
export default function CalComBlock({ data }: { data: CalComBlockType }) {
    useEffect(() => {
        (async function () {
            const cal = await getCalApi({ namespace: data.namespace });
            cal("ui", {
                theme: "light",
                cssVarsPerTheme: {
                    light: { "cal-brand": "#e79320" },
                    dark: { "cal-brand": "#e79320" }
                },
                hideEventTypeDetails: true,
                layout: "column_view"
            });
        })();
    }, [data.namespace]);

    return (
        <div
            className="w-full rounded-2xl overflow-hidden shadow-xl bg-white"
            style={{
                // 調整高度以適應內容，避免觸發 iframe 內部的滾動條
                height: data.config?.height || '650px',
                minHeight: '500px'
            }}
        >
            <Cal
                namespace={data.namespace}
                calLink={data.calLink}
                // 強制隱藏 iframe 自身的滾動條以解決雙滾動條問題
                style={{ width: "100%", height: "100%", overflow: "hidden" }}
                config={{
                    layout: "column_view",
                    useSlotsViewOnSmallScreen: "true",
                    ...data.config
                }}
            />
        </div>
    );
}
