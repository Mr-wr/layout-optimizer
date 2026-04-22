import type { CliOptions } from "./types.js";
/**
 * 解析命令行参数。
 *
 * @param argv 原始参数数组。
 * @returns 解析后的 CLI 选项。
 */
export declare function parseCliArgs(argv: string[]): CliOptions;
/**
 * 返回 CLI 帮助文本。
 *
 * @returns 帮助信息。
 */
export declare function getHelpText(): string;
/**
 * CLI 入口。
 *
 * @param argv 原始参数数组。
 */
export declare function runCli(argv?: string[]): Promise<void>;
