import type { AssetSize } from "./types.js";
/**
 * 从 SVG 文本中提取尺寸信息。
 * 优先使用 width/height，其次回退到 viewBox。
 *
 * @param svgContent SVG 文本。
 * @returns 解析出的尺寸。
 */
export declare function extractSvgSize(svgContent: string): AssetSize;
