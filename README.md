# Peaks Login

<div align="center">
  <img src="assets/icon.png" alt="Peaks Login" width="120" height="120">
  
  <h3>CAS 单点登录自动化助手</h3>
  
  <p>一个强大的 Chrome 浏览器扩展，简化 CAS 单点登录流程，实现多账号管理和 Token 自动注入</p>

  [![Plasmo](https://img.shields.io/badge/Plasmo-0.90.5-blue)](https://github.com/PlasmoHQ/plasmo)
  [![React](https://img.shields.io/badge/React-18.2.0-61dafb)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178c6)](https://www.typescriptlang.org/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38bdf8)](https://tailwindcss.com/)
</div>

---

## 📖 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [使用指南](#使用指南)
- [核心功能](#核心功能)
- [安全机制](#安全机制)
- [开发指南](#开发指南)
- [构建与部署](#构建与部署)
- [常见问题](#常见问题)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## ✨ 功能特性

### 🔐 CAS 单点登录自动化
- 支持配置多个 CAS 登录服务器地址
- 自动化登录流程，无需手动输入用户名密码
- 支持自定义用户名和密码字段名称
- 灵活的 Token 响应键配置

### 👥 多账号管理
- 支持添加和管理多个登录账号
- 密码采用 AES-GCM 256 位加密存储
- 支持账号快速切换
- 账号信息本地加密存储，保护隐私安全

### 🎯 Token 自动注入
- 登录成功后自动将 Token 注入到目标页面
- 支持配置多个回调地址
- 支持多个 Token Key 映射
- 自动处理页面导航和刷新

### 🌐 CORS 跨域支持
- 内置 CORS 规则管理
- 支持为特定回调地址启用跨域请求
- 使用 Chrome declarativeNetRequest API 实现

### 🌍 国际化支持
- 支持中文和英文界面
- 一键切换语言
- 完整的翻译覆盖

### 🎨 现代化 UI
- 基于 shadcn-ui 组件库
- TailwindCSS 样式系统
- 响应式设计
- 优雅的交互体验

---

## 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [Plasmo](https://www.plasmo.com/) | 0.90.5 | Chrome 扩展开发框架 |
| [React](https://reactjs.org/) | 18.2.0 | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 5.3.3 | 类型安全的 JavaScript |
| [TailwindCSS](https://tailwindcss.com/) | 3.4.17 | CSS 框架 |
| [shadcn-ui](https://ui.shadcn.com/) | 2.x | UI 组件库 |
| [Radix UI](https://www.radix-ui.com/) | Latest | 无障碍组件原语 |
| [Lucide React](https://lucide.dev/) | 0.577.0 | 图标库 |

---

## 📁 项目结构

```
peaks-login/
├── .github/                    # GitHub 配置
│   └── workflows/              # CI/CD 工作流
│       └── submit.yml          # 自动发布配置
├── .trae/                      # Trae 配置
│   ├── rules/                  # 项目规则
│   │   └── token.md            # Token 规则
│   └── skills/                 # 技能配置
│       └── ui-ux-pro-max/      # UI/UX 技能
├── assets/                     # 静态资源
│   └── icon.png                # 扩展图标
├── components/                 # React 组件
│   └── ui/                     # UI 组件
│       ├── alert-dialog.tsx    # 警告对话框
│       ├── button.tsx          # 按钮
│       ├── card.tsx            # 卡片
│       ├── dialog.tsx          # 对话框
│       ├── input.tsx           # 输入框
│       ├── label.tsx           # 标签
│       ├── select.tsx          # 下拉选择
│       ├── switch.tsx          # 开关
│       └── table.tsx           # 表格
├── contents/                   # Content Scripts
│   └── index.ts                # 内容脚本入口
├── design-system/              # 设计系统
│   └── peaks-login/
│       └── MASTER.md           # 设计规范
├── lib/                        # 工具库
│   ├── i18n/                   # 国际化
│   │   └── translations.ts     # 翻译配置
│   ├── crypto.ts               # 加密工具
│   ├── storage.ts              # 存储管理
│   ├── useTranslation.ts       # 翻译 Hook
│   └── utils.ts                # 通用工具
├── options/                    # 选项页面
│   └── index.tsx               # 设置页面组件
├── popup/                      # 弹出窗口
│   └── index.tsx               # 弹出窗口组件
├── types/                      # TypeScript 类型定义
│   ├── images.d.ts             # 图片类型
│   └── index.ts                # 类型定义
├── background.ts               # 后台脚本
├── components.json             # shadcn-ui 配置
├── package.json                # 项目配置
├── postcss.config.js           # PostCSS 配置
├── style.css                   # 全局样式
├── tailwind.config.js          # TailwindCSS 配置
└── tsconfig.json               # TypeScript 配置
```

---

## 🚀 快速开始

### 前置要求

- Node.js >= 16.x
- pnpm >= 8.x (推荐) 或 npm >= 8.x
- Chrome 浏览器

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/smallMark1912/peaks-login.git
cd peaks-login
```

2. **安装依赖**

```bash
pnpm install
# 或
npm install
```

3. **启动开发服务器**

```bash
pnpm dev
# 或
npm run dev
```

4. **在 Chrome 中加载扩展**

   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目根目录下的 `build/chrome-mv3-dev` 文件夹

---

## 📚 使用指南

### 初始化设置

1. **初始化加密密钥**
   - 首次使用时，点击扩展图标
   - 点击"打开设置"进入设置页面
   - 点击"初始化密钥"按钮生成加密密钥

2. **配置 CAS 登录地址**
   - 在设置页面找到"CAS 登录地址"部分
   - 填写 CAS 名称和 URL
   - 配置用户名字段（默认：email）
   - 配置密码字段（默认：password）
   - 配置 Token 响应键（默认：token）
   - 点击"添加 CAS 地址"

3. **配置回调地址**
   - 在设置页面找到"回调地址"部分
   - 填写回调名称和 URL
   - 配置 Token 存储 Keys（可配置多个）
   - 可选：启用 CORS 跨域支持
   - 点击"添加回调地址"

4. **添加账号**
   - 在设置页面找到"账号"部分
   - 填写账号名称、用户名和密码
   - 点击"添加账号"
   - 密码将自动加密存储

### 使用扩展登录

1. 点击浏览器工具栏中的扩展图标
2. 选择 CAS 登录地址
3. 选择账号
4. 选择回调地址
5. 如有需要，配置 Token Key 映射
6. 点击"登录"按钮
7. 等待自动登录和 Token 注入完成

---

## 🔧 核心功能

### 1. CAS 登录流程

```
用户点击登录
    ↓
选择 CAS 配置和账号
    ↓
Background Script 接收登录请求
    ↓
解密账号密码
    ↓
向 CAS 服务器发送登录请求
    ↓
获取 Token
    ↓
导航到回调地址
    ↓
注入 Token 到 localStorage
    ↓
刷新页面使 Token 生效
```

### 2. Token 映射机制

支持将不同 CAS 服务器的 Token 映射到不同的 localStorage Key：

```typescript
// Token Key 映射示例
{
  "callbackId:accessToken": "casId1",
  "callbackId:refreshToken": "casId2"
}
```

### 3. CORS 规则管理

使用 Chrome declarativeNetRequest API 动态管理 CORS 规则：

```typescript
// CORS 规则示例
{
  id: 1000,
  priority: 1,
  action: {
    type: "modifyHeaders",
    responseHeaders: [
      {
        header: "Access-Control-Allow-Origin",
        operation: "set",
        value: "*"
      }
    ]
  },
  condition: {
    urlFilter: "https://app.example.com/*",
    resourceTypes: ["xmlhttprequest"]
  }
}
```

---

## 🔒 安全机制

### 密码加密

- **加密算法**: AES-GCM (256 位)
- **密钥管理**: 使用 Web Crypto API 生成主密钥
- **存储方式**: 密码加密后存储在 Chrome Storage Local

```typescript
// 加密流程
const key = await generateMasterKey()           // 生成主密钥
const encrypted = await encrypt(password, key)  // 加密密码
await setMasterKey(await exportKey(key))        // 存储主密钥
```

### 数据存储

所有敏感数据存储在 Chrome Storage Local，具有以下特点：
- 数据仅存储在用户本地设备
- 与用户的 Chrome 账户同步（如果启用）
- 扩展卸载时数据自动清除

---

## 💻 开发指南

### 开发模式

```bash
pnpm dev
```

开发模式特性：
- 热重载支持
- Source Map 支持
- 详细的控制台日志

### 代码规范

- 使用 TypeScript 严格模式
- 禁止使用 `any` 类型
- 所有类型必须使用类型注解
- 遵循 ESLint 和 Prettier 规则

### 添加新组件

```bash
# 使用 shadcn-ui CLI 添加组件
npx shadcn-ui@latest add [component-name]
```

### 国际化

在 `lib/i18n/translations.ts` 中添加新的翻译：

```typescript
export const translations: Record<Language, Translations> = {
  en: {
    newKey: "New Key",
    // ...
  },
  zh: {
    newKey: "新键",
    // ...
  }
}
```

---

## 📦 构建与部署

### 构建生产版本

```bash
pnpm build
```

构建产物位于 `build/chrome-mv3-prod` 目录。

### 打包扩展

```bash
pnpm package
```

生成 `.zip` 文件用于提交到 Chrome Web Store。

### 自动发布

项目配置了 GitHub Actions 自动发布流程：
1. 推送代码到 GitHub
2. GitHub Actions 自动构建
3. 自动提交到 Chrome Web Store

---

## ❓ 常见问题

### Q: 为什么密码无法编辑？

**A**: 出于安全考虑，密码一旦加密存储后无法修改。如需更改密码，请删除账号后重新添加。

### Q: Token 注入失败怎么办？

**A**: 
1. 检查 CAS 登录是否成功
2. 检查 Token 响应键配置是否正确
3. 查看浏览器控制台的错误日志
4. 确认目标页面支持 localStorage

### Q: 如何启用 CORS 支持？

**A**: 
1. 进入设置页面
2. 编辑回调地址
3. 开启"启用跨域支持"开关
4. 保存配置

### Q: 支持哪些浏览器？

**A**: 目前仅支持基于 Chromium 的浏览器（Chrome、Edge、Brave 等），使用 Manifest V3。

---

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 贡献指南

- 遵循现有的代码风格
- 为新功能编写测试
- 更新相关文档
- 确保 TypeScript 类型检查通过

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- [Plasmo](https://www.plasmo.com/) - 优秀的浏览器扩展开发框架
- [shadcn-ui](https://ui.shadcn.com/) - 精美的 UI 组件库
- [TailwindCSS](https://tailwindcss.com/) - 实用优先的 CSS 框架

---

<div align="center">
  <p>用 ❤️ 由 <a href="https://github.com/smallMark1912">smallMark1912</a> 开发</p>
  <p>如果这个项目对你有帮助，请给一个 ⭐️ Star!</p>
</div>
