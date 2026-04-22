import type { AssetSize, BatchLayoutOptions, BatchLayoutSummary, LayoutAssetOptions, LayoutSuccessResult } from "./types.js";
/**
 * 读取素材原始尺寸。
 *
 * @param inputPath 输入文件路径。
 * @returns 原始尺寸。
 */
export declare function readAssetSize(inputPath: string): Promise<AssetSize>;
/**
 * 将单个素材按目标画布大小进行等比居中排版并输出。
 *
 * @param inputPath 输入文件路径。
 * @param options 排版配置。
 * @returns 单文件处理结果。
 */
export declare function layoutAssetToCanvas(inputPath: string, options: LayoutAssetOptions): Promise<LayoutSuccessResult>;
/**
 * 批量处理目录中的素材文件。
 *
 * @param inputDir 输入目录。
 * @param outputDir 输出目录。
 * @param options 批量处理配置。
 * @returns 批处理摘要。
 */
export declare function batchLayoutAssets(inputDir: string, outputDir: string, options: BatchLayoutOptions): Promise<BatchLayoutSummary>;
