import { Block } from "../../types/content";

/**
 * 定義區塊的行為策略 (Block Policy)
 * 這模仿了 OOP 中的 "虛擬函數" (Virtual Function) 表
 */
export interface BlockPolicy {
    /**
     * 判斷是否應該忽略容器的預設內邊距 (Padding)
     * @returns true 如果區塊應該貼齊視窗邊緣
     */
    shouldIgnorePadding(block: Block): boolean;

    /**
     * 判斷是否應該取消 Section 的最大寬度限制
     * @returns true 如果區塊應該即使在寬螢幕下也佔滿寬度
     */
    isSectionWide(block: Block): boolean;
}

/**
 * 預設策略：大多數區塊都保留標準 Padding 和寬度限制
 */
export const DefaultPolicy: BlockPolicy = {
    shouldIgnorePadding: () => false,
    isSectionWide: () => false
};
