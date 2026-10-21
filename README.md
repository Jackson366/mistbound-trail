# 雾境行旅 · Mistbound Trail

一个使用 **Vue 3 + TypeScript + Vite** 构建的中文单人六角沙盒冒险游戏。灵感来自 Sandbox Generator 的分层世界生成方法，场景插画、剧情和行动规则为原创。

## 本地开发

需要 Node.js **20.19+**（或 22.12+ / 24）与 npm。

```bash
npm ci
npm run dev
```

打开终端输出的地址，默认端口 `4173`。VS Code 可直接使用「启动雾境行旅」调试配置。

```bash
npm run typecheck # TypeScript 与 Vue 模板严格检查
npm test          # 游戏规则、存档、Vue 状态与组件交互测试
npm run build     # 类型检查 + 静态生产构建，输出 dist/
npm run preview   # 本地预览生产构建
```

## 玩法

从烛溪村出发，在 19 格地图上移动，揭开迷雾。每步消耗补给；进入地点后可免费交谈或查看物件。正式调查会消耗时段，并可能触发掷骰或谨慎绕行的选择。取回祭坛、墓窟、孤塔的三枚印记后返回村庄，即可完成远征。

19 个地点包含 59 个可交互对象。地点有独立的氛围、开场描述与线索，场景采用原创 SVG 绘制。七位人物提供分支对话，每轮最多三个选项；离开后可以续聊，交谈记录默认折叠。向玛拉购买补给会明确列出价格与成交结果，金币不足也可继续问话或离开。当前版本没有后端、账号系统或大模型调用；势力提供世界背景，尚无外交或战争玩法。

## 目录

```text
src/
  App.vue                 应用入口与顶层视图
  types.ts                地图、游戏状态、地点与行动类型
  components/             地图、详情、场景、资源条与统一弹窗
  composables/useGame.ts   响应式状态、行动编排、持久化与跨页冲突
  engine/game.ts          独立的游戏规则与种子世界生成
  engine/storage.ts       存档读取、校验与写入
  engine/conversation.ts  对话节点、续聊与购买编排
  engine/conversation-memory.ts  对话存档校验
  data/locations.ts       地点、人物、观察结果与线索
  data/dialogues.ts       七位人物的短篇分支剧本
  rendering/              SVG 场景与地图图标
  styles/main.css         主题、地图、场景与移动端样式
 tests/                   Node 测试与 Vue 组件交互测试
```

Vue 组件使用 `<script setup lang="ts">`，通过 Composition API 的 `ref` / `computed` 管理状态，并通过类型安全的 provide/inject 共享一个游戏控制器。规则层不依赖 Vue，可独立调用、测试或迁入未来的服务端。

只将可信的程序生成 SVG 交给 `v-html`，剧情与用户存档内容通过 Vue 模板转义。没有保留旧版的 DOM 拼接与全局变量运行时。

## 存档

保留旧版键 `mistbound-expedition-v1`，已有远征继续可用。每位人物最多保留最近 12 条交谈记录及已聊话题；新旅程会一并清除。存档仅存在当前浏览器；不上传到服务端。损坏或不可用的存档显示提示，不在加载时静默覆盖。另一页面修改存档后，当前页面暂停行动和保存，刷新后可继续。

## 部署

`npm run build` 生成的 `dist/` 可部署到支持静态网站的托管平台。现有站点使用 `.openai/hosting.json` 记录身份；它是部署配置，不包含密钥。

GitHub Actions 在推送和 Pull Request 时执行依赖安装、类型检查、测试和生产构建。构建产物与依赖目录不纳入源码仓库。
