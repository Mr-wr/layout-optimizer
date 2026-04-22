import type { LayoutMetrics, OutputFormat } from "./types.js";
/**
 * 将日期格式化为适合文件名的批次时间戳。
 *
 * @param date 批次时间。
 * @returns 时间戳字符串。
 */
export declare function formatTimestamp(date?: Date): string;
/**
 * 生成安全且可读的输出文件名，避免覆盖原文件。
 *
 * @param inputPath 输入文件路径。
 * @param width 目标宽度。
 * @param height 目标高度。
 * @param format 输出格式。
 * @param batchTimestamp 批次时间戳。
 * @returns 输出文件名。
 */
export declare function buildOutputFileName(inputPath: string, width: number, height: number, format: OutputFormat, batchTimestamp: string): string;
/**
 * 为批量合成结果生成统一输出文件名。
 *
 * @param inputDir 输入目录。
 * @param width 目标宽度。
 * @param height 目标高度。
 * @param format 输出格式。
 * @param batchTimestamp 批次时间戳。
 * @param packingTimeLimitMinutes 精细化搜索总时长上限，单位分钟。
 * @returns 输出文件名。
 */
export declare function buildBatchOutputFileName(inputDir: string, width: number, height: number, format: OutputFormat, batchTimestamp: string, packingTimeLimitMinutes?: number, pageNumber?: number): string;
/**
 * 计算素材在目标画布上的 contain 布局。
 *
 * @param sourceWidth 原始宽度。
 * @param sourceHeight 原始高度。
 * @param targetWidth 目标宽度。
 * @param targetHeight 目标高度。
 * @returns 绘制结果。
 */
export declare function calculateContainLayout(sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number): LayoutMetrics;
/**
 * 将输入值转为正整数。
 *
 * @param value 原始值。
 * @param field 字段名。
 * @returns 解析后的正整数。
 */
export declare function toPositiveInteger(value: string | number, field: string): number;
/**
 * 将毫米值规范化为保留两位小数的数字。
 *
 * @param value 原始毫米值。
 * @param field 字段名。
 * @param allowZero 是否允许为 0。
 * @returns 规范化后的毫米值。
 */
export declare function normalizeMillimeterValue(value: string | number, field: string, allowZero?: boolean): number;
/**
 * 将毫米转换为像素，并按图像处理要求四舍五入为整数像素。
 *
 * @param millimeters 毫米值。
 * @param dpi 输出 DPI。
 * @param field 字段名。
 * @returns 像素值。
 */
export declare function millimetersToPixels(millimeters: number, dpi: number, field: string): number;
