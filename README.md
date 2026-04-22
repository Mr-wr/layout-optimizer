# 优化排版

## 项目作用

这是一个基于 `Node.js + TypeScript + sharp` 的批量排版工具。

它的核心目标是：

- 读取输入目录中的 `png/jpg/jpeg/webp/svg` 素材
- 按指定的目标画布尺寸把多张素材合并排到同一页
- 默认不缩放素材，只允许 `90` 度旋转
- 当单页排不下时自动分页输出
- 优先使用精细化搜索，超过时间预算后自动切换为快速装箱继续输出
- 输出 `psd` 时，每个素材会作为独立图层写入，便于在 Photoshop 中移动和编辑

当前项目既支持：

- 单素材居中输出
- 批量素材自动分页合版输出

主入口代码位于：

- `src/cli.ts`
- `src/layout.ts`
- `src/packing.ts`

## 安装与使用

### npm 安装

```bash
npm install layout-optimizer
```

### CLI 使用

不安装到项目也可以直接通过 `npx` 运行：

```bash
npx layout-optimizer --input ./in --output ./out --width 300 --height 500 --format png --gapX 0.2 --gapY 0.2 --packingTimeLimitMinutes 1
```

如果希望全局使用命令，可以先全局安装：

```bash
npm install -g layout-optimizer
```

安装后直接执行：

```bash
layout-optimizer --input ./in --output ./out --width 300 --height 500 --format png --gapX 0.2 --gapY 0.2 --packingTimeLimitMinutes 1
```

### API 使用

项目也支持在 Node.js 代码中通过 ESM 方式调用：

```ts
import { batchLayoutAssets, layoutAssetToCanvas, readAssetSize } from "layout-optimizer";

const summary = await batchLayoutAssets("./in", "./out", {
  width: 300,
  height: 500,
  format: "png",
  gapX: 0.2,
  gapY: 0.2,
  packingTimeLimitMinutes: 1,
});

console.log(summary);

const assetSize = await readAssetSize("./in/example.png");
console.log(assetSize);

await layoutAssetToCanvas("./in/example.png", "./out/example.png", {
  width: 300,
  height: 500,
  format: "png",
});
```

## 目录说明

### `src/cli.ts`

命令行入口，负责：

- 解析 CLI 参数
- 打印帮助文本
- 调用批量排版主流程

### `src/layout.ts`

批量排版主流程，负责：

- 读取输入文件
- 读取素材尺寸
- 分页
- 当前页素材选择
- 调用装箱算法
- 渲染输出结果
- 生成最终摘要

### `src/packing.ts`

装箱算法核心，负责：

- 快速装箱
- 精细化装箱
- 搜索剪枝
- 超时后降级策略

### `src/utils.ts`

通用工具，负责：

- 时间戳生成
- 输出文件名生成
- 毫米转像素
- 单图 contain 布局计算

### `src/svg.ts`

SVG 尺寸解析，负责：

- 从 `width/height` 提取尺寸
- 从 `viewBox` 回退提取尺寸

### `src/constants.ts`

默认配置与全局常量，负责：

- 默认背景色
- 默认 DPI
- 默认精细化搜索时长
- PSD 尺寸限制

### `src/types.ts`

类型定义，负责：

- CLI 参数类型
- 批量输出摘要类型
- 单图与批量结果类型

## 当前命令行参数

示例：

```bash
node dist/cli.js --input ./in --output ./out --width 300 --height 500 --format png --gapX 0.2 --gapY 0.2
```

主要参数说明：

- `--input`
  输入目录
- `--output`
  输出目录
- `--width`
  目标画布宽度，单位 `mm`
- `--height`
  目标画布高度，单位 `mm`
- `--format`
  输出格式，支持 `png/jpg/jpeg/webp/svg/psd`
- `--background`
  背景色，默认 `#ffffff`
- `--gapX`
  左右间距，单位 `mm`
- `--gapY`
  上下间距，单位 `mm`
- `--dpi`
  毫米转像素使用的 DPI，默认 `300`
- `--fastPacking`
  强制全部流程直接使用快速装箱
- `--packingTimeLimitMinutes`
  精细化搜索总时长上限，单位分钟；达到上限后自动切换为快速装箱继续输出
- `--recursive`
  递归处理子目录

## 整体执行流程

整个批量排版的主流程入口是 `batchLayoutAssets()`，位于 `src/layout.ts`。

逻辑顺序如下：

1. 解析输入参数
2. 把毫米尺寸转换成像素
3. 收集输入目录内所有受支持文件
4. 读取每个素材的原始尺寸
5. 把可处理素材转换成内部记录结构
6. 进入分页流程
7. 为每一页选择一组最合适的素材
8. 对该页素材执行装箱
9. 渲染整页并写出文件
10. 汇总所有页面结果，输出摘要 JSON

可以简化理解成：

```text
CLI -> batchLayoutAssets
    -> collectInputFiles
    -> readAssetSize
    -> paginateAndRenderAssets
        -> selectPageAssets
            -> packSelectedAssets
                -> findOptimalPacking / findFastPackingSubset
        -> renderPackedPage
    -> summary
```

## 输入读取逻辑

### 1. 文件收集

`collectInputFiles()` 会遍历输入目录。

行为规则：

- 只收集受支持后缀
- 默认只处理当前目录
- 传入 `--recursive` 时递归子目录
- 最终按路径排序，保证输出稳定

### 2. 尺寸读取

`readAssetSize()` 负责读取素材原始宽高。

处理方式：

- `svg` 使用 `extractSvgSize()`
- 位图格式使用 `sharp(...).metadata()`

`extractSvgSize()` 的优先级：

1. 优先读 `<svg width height>`
2. 如果没有，再回退读 `viewBox`
3. 两者都不合法则抛错

## 单图排版逻辑

`layoutAssetToCanvas()` 用于单素材输出。

处理步骤：

1. 规范化 `dpi/width/height`
2. 把毫米转成像素
3. 根据输出格式校验尺寸；`psd` 单边不能超过 PSD 标准限制
4. 读取素材原始尺寸
5. 调用 `calculateContainLayout()` 计算等比缩放后的绘制区域
6. 使用 `sharp.resize()` 生成缩放后的素材缓冲区
7. 创建目标画布
8. 使用 `composite()` 把素材贴到画布中央
9. 根据目标格式写出文件

这个流程和批量排版不同的地方在于：

- 单图排版允许缩放
- 批量装箱默认不缩放

## 批量排版主流程

### 1. 参数标准化

`batchLayoutAssets()` 先做统一规范化：

- `normalizeDpi()`
- `normalizeMillimeterValue()`
- `millimetersToPixels()`
- `normalizeOutputFormat()`

这里得到的关键结果包括：

- `targetWidth`
- `targetHeight`
- `gapX`
- `gapY`
- `fastPacking`
- `packingTimeLimitMinutes`
- `packingDeadlineAt`

其中 `packingDeadlineAt` 非常关键。

它表示：

- 整个精细化搜索共用同一个截止时间
- 超过这个截止时间后，不再继续做精细化搜索
- 后续页面自动降级为快速装箱

### 2. 素材预处理

对输入目录中的每个文件，主流程都会构建一个 `BatchAssetRecord`：

```ts
{
  assetId,
  sourcePath,
  width,
  height,
  sourceWidth,
  sourceHeight,
  area,
  cacheKey
}
```

这些字段的作用：

- `assetId`
  用于位掩码缓存
- `sourcePath`
  用于最终渲染和结果输出
- `width/height`
  当前装箱用尺寸
- `area`
  用于排序和剪枝
- `cacheKey`
  用于稳定比较和缓存 key

### 3. 分页

`paginateAndRenderAssets()` 负责把所有素材拆成若干页。

它的工作方式是：

1. 先把所有剩余素材按面积从大到小排序
2. 每轮为当前页选出一组素材
3. 渲染这一页
4. 从剩余素材列表中删除已经成功排入该页的素材
5. 继续下一页，直到没有剩余素材

这里的关键点是：

- 每页不是简单“按顺序塞”
- 而是先做“当前页素材选择”
- 然后再做“当前页内部装箱”

这两个问题是分开的。

## 当前页素材选择逻辑

当前页素材选择由 `selectPageAssets()` 完成。

这个函数解决的问题是：

> 从当前剩余素材中，选哪些图放进这一页最合适

它不是直接求摆放坐标，而是先求“这一页放哪些素材”。

### 选择流程

#### 第一步：先跑贪心结果

`selectPageAssetsGreedy()` 会先调用 `findFastPackingSubset()`。

这一步的意义是：

- 很快给出一个可行解
- 作为精细化搜索的初始下界
- 如果已经超时，直接拿这个结果继续走

#### 第二步：判断是否继续精细化选择

如果满足以下任一条件，会直接返回贪心结果：

- 用户传了 `--fastPacking`
- 当前已经达到精细化搜索截止时间

#### 第三步：如果贪心已经能把全部素材放进一页

`buildFullSelectionResult()` 会直接对“整页素材集合”做一次装箱，不再枚举子集。

这是一个非常重要的优化点。

因为如果已经确定：

- 当前所有素材都能装入这一页

那么继续枚举“各种子集组合”就没有意义。

#### 第四步：否则进入子集搜索

`searchBestPageSubset()` 会用回溯方式搜索更优的页面素材组合。

它的目标优先级由 `isBetterPageSelection()` 决定：

1. 优先装下更多素材
2. 素材数量相同时，优先总占用面积更小
3. 面积相同时，优先总高度更小
4. 再相同时，优先总宽度更小
5. 最后按稳定 key 比较，保证结果可重复

### 子集搜索中的剪枝

`searchBestPageSubset()` 不是暴力穷举，而是有多层剪枝：

- 如果理论上剩余素材全加上也追不上当前最优素材数量，直接停止
- 如果素材数量最多只能持平，但理论面积已经不会更优，直接停止
- 如果“当前选择 + 剩余全部素材”的理论面积不超过画布面积，会优先尝试整包评估
- 如果已经达到精细化截止时间，直接停止递归

### 子集评估缓存

`evaluatePageSubsetMetrics()` 会把同一个素材子集的装箱结果缓存到 `fitCache`。

缓存内容包括：

- `packingArea`
- `packingWidth`
- `packingHeight`
- `packing`

缓存的作用是：

- 避免同一组素材被重复装箱评估
- 降低分页搜索阶段的重复计算成本

## 页内装箱逻辑

页内装箱由 `packSelectedAssets()` 完成。

它解决的问题是：

> 已经决定这一页放哪些图之后，这些图在页内应该怎么摆

这一步才真正调用 `src/packing.ts` 里的装箱算法。

### `packSelectedAssets()` 的分支逻辑

#### 分支一：快速模式

如果当前 `fastPacking = true`：

- 直接调用 `findFastPackingSubset()`
- 要求该页所有素材都必须装下
- 如果装不下就抛错

#### 分支二：精细模式

如果当前不是快速模式：

1. 计算距离截止时间还剩多少毫秒
2. 如果已经没有剩余时间，直接改走快速模式
3. 如果还有剩余时间，则调用 `findOptimalPacking()`
4. 传入 `timeBudgetMs = min(总预算, 剩余时间)`

这意味着当前实现不是“每次装箱都给完整预算”，而是：

- 全部精细化装箱共享同一个总时限

## 快速装箱逻辑

快速装箱主要由以下函数组成：

- `findFastPackingSubset()`
- `tryPackFastSubset()`
- `pickBestFastPackingSubset()`
- `packFastSubsetFromSearchItems()`

### 核心思想

快速装箱使用的是启发式矩形装箱思路：

1. 把素材转成搜索项 `SearchItem`
2. 生成两种朝向
   - 原始方向
   - 旋转 90 度
3. 用多个排序策略尝试装箱
4. 每次基于当前空闲矩形列表选择一个候选位置
5. 放入后拆分空闲区域并裁剪冗余区域

### 多排序策略

为了避免单一排序导致结果太差，代码会尝试多种顺序：

- `area`
- `longSide`
- `width`
- `height`
- `perimeter`
- `shortSide`

`pickBestFastPackingSubset()` 会比较这些策略的结果，选最优的一份。

### 空闲区域更新

快速装箱的核心数据结构是 `freeRects`。

当放入一个矩形后：

1. `splitFreeRects()` 把与已占用区域相交的空闲矩形切开
2. `pruneFreeRects()` 删除被完全包含的冗余矩形

这样就能持续维护“当前还能放的位置”。

## 精细化装箱逻辑

精细化装箱由 `findOptimalPacking()` -> `tryPackExactly()` -> `searchBestPacking()` 完成。

这个算法本质上是：

- 带旋转的分支限界搜索
- 在已有快速可行解基础上继续搜索更优布局

### 第一步：预处理

`buildSearchItems()` 会为每个素材生成：

- 原始尺寸
- 带间隔后的 packed 尺寸
- 面积
- 两种方向 `orientations`

### 第二步：快速解打底

`tryPackExactly()` 不会一开始就盲搜，而是先跑一次 `tryPackFast()`。

如果快速装箱成功：

- 这份结果会作为当前 `best`
- 后续精细搜索就能用它做上界
- 搜索会更容易剪枝

### 第三步：建立搜索控制器

`createPackingSearchControl()` 会生成搜索预算控制器：

- `nodeBudget`
- `timeBudgetMs`
- `deadlineAt`
- `nodesVisited`

这里的两个关键点：

- 节点预算会根据素材数量和当前快速解质量做放大
- 时间预算由上层传入，已经是“共享总时限下的本次剩余时间”

### 第四步：搜索最优布局

`searchBestPacking()` 是精细化装箱的核心递归函数。

它的基本流程是：

1. 检查是否应该停止搜索
2. 如果没有剩余素材，计算当前解评分并尝试更新最优解
3. 检查剩余面积是否超过所有空闲区域总面积
4. 根据空闲区域状态和剩余素材掩码构造状态 key
5. 如果该状态已经确认无解，直接返回
6. 如果当前理论下界已经不可能优于最优解，直接剪枝
7. 选择最受约束的下一个素材
8. 枚举其候选位置并递归搜索

### 最受约束素材选择

`pickMostConstrainedItem()` 会优先选择：

- 候选位置数量最少的素材

如果候选数相同：

- 优先面积更大的素材

这样做的原因是：

- 越难放的素材越应该先决策
- 越早暴露死路，越能减少搜索树规模

### 候选位置生成

`generatePlacementCandidates()` 会为每个素材生成可放位置。

每个空闲矩形 + 每个方向组合下，会尝试 4 个角点：

- 左上
- 右上
- 左下
- 右下

每个候选都会计算一个 `score`，分数越低越优。

`computeCandidateScore()` 的核心思想是：

- 尽量优先使用更贴边、更紧凑的位置

### 搜索剪枝

精细化搜索能跑得动，核心靠的是剪枝。

当前主要剪枝包括：

#### 1. 时间 / 节点预算剪枝

`shouldStopPackingSearch()` 会在已有可行解时检查：

- 是否超过节点预算
- 是否超过时间预算

注意这里有一个非常重要的设计：

- 只有已经存在可行摆放解时，才允许预算中断搜索

这样可以避免“其实能放下，但因为太早停止被误判为放不下”。

#### 2. 面积剪枝

如果剩余素材面积已经超过所有空闲区域面积总和，直接返回。

#### 3. 状态去重

`buildStateKey()` 把：

- 当前空闲矩形集合
- 剩余素材位掩码

拼成状态 key。

如果某个状态已经证明走不通，下次再遇到直接剪掉。

#### 4. 下界剪枝

`buildLowerBoundScore()` 会构造当前状态的理论最好分数。

如果这个理论最好分数都不可能优于当前最优解，就没必要继续展开。

#### 5. 候选顺序优化

`sortCandidatesForSearch()` 会先探索更有机会收紧包围盒的候选位置，尽快找到更强的上界，进一步帮助后续剪枝。

### 评分规则

当前装箱优劣比较由 `compareScores()` 决定：

1. 优先总包围面积更小
2. 面积相同时优先高度更小
3. 再相同时优先宽度更小

也就是说，这个项目目前的“更省料”主要指：

- 素材整体包围盒更紧凑
- 更少浪费页面可用空间

## 超时降级逻辑

这是当前项目里非常关键的运行策略。

### 当前语义

`--packingTimeLimitMinutes` 现在不是“整个命令硬停止时间”，而是：

- 精细化搜索可使用的总时长

到达这个时间点后：

- 不再继续做精细化搜索
- 后续页面自动改走快速装箱
- 任务仍继续输出，不会直接失败

### 为什么这样设计

因为下面两个目标是冲突的：

- 一定要在严格时间内停止
- 一定要把所有素材都排出来

如果坚持绝对硬停，就会出现：

- 剩余素材直接失败
- 最终一整批图排不出来

所以当前代码选择的是更实用的折中：

- 先尽量追求省料
- 时间到了之后保证结果还能继续出

## 页面渲染与写出逻辑

页面渲染由 `renderPackedPage()` 完成。

### 渲染步骤

1. 根据 `pageSelection.packing` 取出每个素材的摆放结果
2. 对每个素材执行：
   - 如有必要旋转 90 度
   - 按目标内容尺寸 resize
3. 把所有素材缓冲区组合成 `composites`
4. 创建目标画布
5. 使用 `sharp.composite()` 合成整页
6. 调用 `writeCanvas()` 按输出格式写出文件

当输出格式为 `psd` 时，流程不会把所有素材先合成一张位图，而是把每个素材按排版坐标渲染为独立 PSD 图层，再写入同一个 PSD 文档。

### 不同输出格式的处理

`writeCanvas()` 支持：

- `png`
- `jpg`
- `jpeg`
- `webp`
- `svg`
- `psd`

其中：

- 位图格式直接由 `sharp` 输出
- `svg` 不是矢量重排，而是把整页先渲染成 PNG，再以内嵌图片方式包到 SVG 容器里
- `psd` 使用 `ag-psd` 写出，每个素材是独立图层，PSD 文档会保留排版后的画布尺寸和 DPI

这意味着：

- 输出为 `svg` 时，结果本质仍然是位图内容
- 不是保持原始矢量路径的真正矢量拼版
- 输出为 `psd` 时，素材图层可以在 Photoshop 中单独移动；为避免超大文件和内存占用，默认不额外生成整页背景图层

## 摘要输出字段说明

CLI 最终会打印一个 JSON 摘要。

关键字段含义如下：

- `pageCount`
  一共输出了多少页
- `algorithm`
  当前批次的主模式标识
- `fastPacking`
  是否显式使用快速装箱模式
- `packingTimeLimitMinutes`
  精细化搜索总时长上限
- `deadlineReached`
  是否在执行过程中触达精细化搜索总时长上限
- `packedWidth`
  所有页面中最大的已使用宽度
- `packedHeight`
  所有页面中最大的已使用高度
- `utilization`
  页面利用率平均值
- `results`
  每个成功或失败素材的详细记录
- `failures`
  失败项列表
- `notice`
  用户可读提示，例如：
  - 自动分页
  - 已降级为快速装箱

## 当前代码中的几个关键设计点

### 1. 分页选择和页内装箱是两层问题

不要把它理解成一次算法同时做完所有事。

当前实现明确拆成两层：

- 先决定这一页放哪些图
- 再决定这些图怎么摆

这样的好处是：

- 逻辑更清晰
- 更容易单独优化某一层
- 缓存和剪枝更有效

### 2. 精细化搜索不是纯暴力

虽然有回溯，但已经做了很多限制：

- 快速解打底
- 状态去重
- 下界剪枝
- 面积剪枝
- 候选顺序优化
- 时间和节点预算控制

### 3. 时间预算是共享的

不是每次装箱都重新给满预算，而是：

- 整个批次共享一个截止时间

这样能防止分页阶段反复调用精细装箱时，累计耗时不可控。

### 4. 超时后不是报错，而是降级

这是当前版本最重要的运行策略之一。

如果你看到：

- `deadlineReached = true`

它表示的是：

- 精细化搜索时间已经用完
- 后续输出可能已经部分使用快速装箱

而不是：

- 整个任务失败

## 当前限制与注意事项

### 1. 默认批量装箱不缩放素材

当前批量排版默认：

- 不缩放
- 只允许旋转

所以如果画布太小，某些素材即使单页也放不下，会直接报错。

### 2. `svg` 输出不是纯矢量

当前 `svg` 输出是：

- 位图画布转 base64 PNG
- 再嵌入 SVG 容器

因此它更像“SVG 包裹的图片”，不是矢量保真输出。

### 3. `deadlineReached` 不代表失败

它只表示：

- 精细化搜索预算耗尽
- 后续可能已经降级成快速装箱

### 4. `psd` 输出限制

`psd` 输出用于 Photoshop 图层编辑：

- 每个素材会写成独立图层
- 当前不会生成整页白色背景图层，以避免超大画布额外占用大量内存和文件体积
- PSD 标准单边最大值为 `30000` 像素，超过后需要 PSB 大文档格式，当前工具未实现 PSB

### 5. 渲染时间不属于搜索时间优化对象

当前 `packingTimeLimitMinutes` 控制的是：

- 精细化搜索阶段

而 `sharp` 的图片解码、旋转、缩放、写文件时间仍然存在。

所以如果输入图片很多、分辨率很大，即使装箱很快，整批渲染仍可能消耗明显时间。

## 推荐理解方式

如果要快速理解这个项目，建议按下面顺序看源码：

1. `src/cli.ts`
   先看参数从哪里进来
2. `src/layout.ts`
   看批量流程主干
3. `src/packing.ts`
   看装箱算法细节
4. `src/utils.ts`
   看单位换算和输出文件名
5. `src/svg.ts`
   看 SVG 尺寸解析

如果只想抓核心链路，可以重点看这几个函数：

- `runCli()`
- `batchLayoutAssets()`
- `paginateAndRenderAssets()`
- `selectPageAssets()`
- `packSelectedAssets()`
- `findOptimalPacking()`
- `searchBestPacking()`
- `renderPackedPage()`

## 使用建议

### 想要更省料

使用默认模式，不传 `--fastPacking`，并适当增大：

- `--packingTimeLimitMinutes`

### 想要更快

直接传：

```bash
--fastPacking
```

### 想要兼顾速度和结果

保留默认精细模式，并设置一个合理的分钟数，例如：

```bash
--packingTimeLimitMinutes 1
```

或者：

```bash
--packingTimeLimitMinutes 3
```

这样项目会：

- 前期尽量用精细化搜索
- 时间到后自动切换快速装箱
- 仍然把后续页面继续输出

## 结论

当前项目的核心设计不是单一装箱算法，而是一个完整的批量排版流水线：

- 输入读取
- 尺寸解析
- 单位转换
- 分页选择
- 页内装箱
- 精细化与快速模式切换
- 结果渲染
- 摘要输出

其中最关键的实现点有两个：

1. 分页选择和页内装箱明确分层
2. 精细化搜索使用共享时间预算，并在超时后自动降级为快速装箱

这两个设计决定了当前项目既能追求较好的页面利用率，又不会因为精细化搜索过慢而整批无法输出。
