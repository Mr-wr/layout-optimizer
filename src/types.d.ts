export type OutputFormat = "png" | "jpg" | "jpeg" | "webp" | "svg" | "psd";
export interface AssetSize {
    width: number;
    height: number;
}
export interface LayoutMetrics {
    scale: number;
    drawWidth: number;
    drawHeight: number;
    offsetX: number;
    offsetY: number;
}
export interface LayoutAssetOptions {
    width: number;
    height: number;
    format: OutputFormat;
    outputDir: string;
    background?: string;
    batchTimestamp?: string;
    dpi?: number;
}
export interface BatchLayoutOptions {
    width: number;
    height: number;
    format: OutputFormat;
    background?: string;
    recursive?: boolean;
    gapX?: number;
    gapY?: number;
    dpi?: number;
    fastPacking?: boolean;
    packingTimeLimitMinutes?: number;
}
export interface LayoutSuccessResult {
    sourcePath: string;
    sourceWidth: number;
    sourceHeight: number;
    targetWidth: number;
    targetHeight: number;
    drawWidth: number;
    drawHeight: number;
    offsetX: number;
    offsetY: number;
    scale: number;
    outputPath: string;
    status: "success";
    error: null;
}
export interface BatchLayoutSuccessResult extends LayoutSuccessResult {
    pageNumber: number;
    packedX: number;
    packedY: number;
    packedWidth: number;
    packedHeight: number;
    gapX: number;
    gapY: number;
    rotated: boolean;
}
export interface LayoutFailureResult {
    sourcePath: string;
    status: "failed";
    error: string;
}
export interface BatchLayoutSummary {
    inputDir: string;
    outputDir: string;
    width: number;
    height: number;
    widthMm: number;
    heightMm: number;
    format: OutputFormat;
    background: string;
    batchTimestamp: string;
    outputPath: string | null;
    outputPaths: string[];
    pageCount: number;
    algorithm: string;
    packedScale: number;
    packedWidth: number;
    packedHeight: number;
    gapX: number;
    gapY: number;
    gapXMm: number;
    gapYMm: number;
    inputUnit: string;
    dpi: number;
    fastPacking: boolean;
    packingTimeLimitMinutes: number;
    deadlineReached: boolean;
    utilization: number;
    notice: string | null;
    total: number;
    successCount: number;
    failureCount: number;
    results: Array<BatchLayoutSuccessResult | LayoutFailureResult>;
    failures: LayoutFailureResult[];
}
export interface CliOptions {
    input?: string;
    output?: string;
    width?: number;
    height?: number;
    format?: OutputFormat;
    background?: string;
    gapX?: number;
    gapY?: number;
    dpi?: number;
    fastPacking?: boolean;
    packingTimeLimitMinutes?: number;
    recursive: boolean;
    help: boolean;
}
