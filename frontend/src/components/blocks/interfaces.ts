import { Block } from "../../types/content";

/**
 * 定義區塊的行為策略 (Block Policy)
 * 這模仿了 OOP 中的 "虛擬函數" (Virtual Function) 表
 */
export interface BlockPolicy {
    /**
     * 判斷是否應該忽略容器的預設內邊距 (Padding)
     * @returns boolean 或 Tailwind Class 字串
     */
    shouldIgnorePadding(block: Block): boolean | string;

    /**
     * 判斷是否應該取消 Section 的最大寬度限制
     * @returns boolean 或 Tailwind Class 字串
     */
    isSectionWide(block: Block): boolean | string;
}

/**
 * 預設策略：大多數區塊都保留標準 Padding 和寬度限制
 */
export const DefaultPolicy: BlockPolicy = {
    shouldIgnorePadding: () => false,
    isSectionWide: () => false
};
