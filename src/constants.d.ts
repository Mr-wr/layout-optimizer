import type { OutputFormat } from "./types.js";
export declare const SUPPORTED_INPUT_EXTENSIONS: Set<string>;
export declare const SUPPORTED_OUTPUT_FORMATS: Set<OutputFormat>;
export declare const DEFAULT_BACKGROUND = "#ffffff";
export declare const DEFAULT_INPUT_UNIT = "mm";
export declare const DEFAULT_DPI = 300;
/**
 * 单次精细装箱的最大搜索节点数。
 * 只在已经拿到一份可用摆放结果后生效，用于避免中等尺寸素材导致搜索树爆炸。
 */
export declare const DEFAULT_EXACT_PACKING_NODE_BUDGET = 6200000;
/**
 * 默认精细化搜索的总时长上限，单位分钟。
 * 达到上限后不再继续做精细化搜索，后续页面自动降级为快速装箱。
 */
export declare const DEFAULT_PACKING_TIME_LIMIT_MINUTES = 3;
/**
 * 默认精细化搜索的总时长上限（毫秒）。
 * 该值会换算成同一个全局截止时间，供整个任务共享。
 */
export declare const DEFAULT_EXACT_PACKING_TIME_BUDGET_MS: number;
/**
 * PSD 标准文件的单边尺寸上限。
 * 超过该值需要使用 PSB 大文档格式，当前输出格式只实现 PSD。
 */
export declare const MAX_PSD_EDGE = 30000;
