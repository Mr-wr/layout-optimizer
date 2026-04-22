import type { AssetSize } from "./types.js";
export interface PackingInputItem extends AssetSize {
    sourcePath: string;
}
export interface PackedPlacement {
    sourcePath: string;
    sourceWidth: number;
    sourceHeight: number;
    x: number;
    y: number;
    width: number;
    height: number;
    contentX: number;
    contentY: number;
    contentWidth: number;
    contentHeight: number;
    scale: number;
    rotated: boolean;
}
export interface OptimalPackingOptions {
    fastPacking?: boolean;
    timeBudgetMs?: number;
    nodeBudget?: number;
}
/**
 * 在固定画布内按原始尺寸搜索精确装箱结果。
 * 不进行缩放，只允许 90 度旋转；如果当前页放不下，应由上层逻辑分页。
 *
 * @param items 待排版素材。
 * @param binWidth 画布宽度。
 * @param binHeight 画布高度。
 * @param gapX 左右间隔。
 * @param gapY 上下间隔。
 * @returns 当前页装箱结果。
 */
export declare function findOptimalPacking(items: PackingInputItem[], binWidth: number, binHeight: number, gapX: number, gapY: number, options?: OptimalPackingOptions): {
    placements: PackedPlacement[];
    scale: number;
    usedWidth: number;
    usedHeight: number;
    utilization: number;
};
export declare function findFastPackingSubset(items: PackingInputItem[], binWidth: number, binHeight: number, gapX: number, gapY: number): {
    placements: PackedPlacement[];
    scale: number;
    usedWidth: number;
    usedHeight: number;
    utilization: number;
};
