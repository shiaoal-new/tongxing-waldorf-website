import { Block } from "../../types/content";
import { BlockPolicy, DefaultPolicy } from "./interfaces";
import { timelinePolicy } from "./TimelineBlock";
import { listPolicy } from "./ListBlock";

/**
 * 區塊策略註冊表 (Registry)
 * 將區塊類型映射到具體的行為策略 (Strategy Pattern)
 */
const policyMap: Record<string, BlockPolicy> = {
    timeline_block: timelinePolicy,
    list_block: listPolicy,
};

/**
 * These types are always considered wide (no max-width limit)
 */
const wideBlockTypes = [
    "schedule_block",
    "curriculum_block",
    "visit_process_block",
    "spacing_demo_block",
    "typography_demo_block",
    "micro_interactions_block"
];

/**
 * 解析區塊的行為：是否忽略 Padding
 * 模仿虛擬函數調用: "block.shouldIgnorePadding()"
 */
export function shouldBlockIgnorePadding(block: Block): boolean | string {
    const policy = policyMap[block.type] || DefaultPolicy;
    return policy.shouldIgnorePadding(block);
}

/**
 * 解析區塊的行為：是否為寬版區塊 (取消 Section Limit)
 */
export function isBlockSectionWide(block: Block): boolean | string {
    if (wideBlockTypes.includes(block.type)) return true;
    const policy = policyMap[block.type] || DefaultPolicy;
    return policy.isSectionWide(block);
}
