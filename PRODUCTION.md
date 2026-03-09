# Peaks Login - 产品文档

## 📋 项目概述

Peaks Login 是一个基于 Plasmo 框架开发的 Chrome 浏览器扩展，旨在简化 CAS（Central Authentication Service）单点登录流程。通过自动化登录和 Token 注入机制，实现多账号管理和快速切换，提升开发和测试效率。

### 核心价值

- **自动化登录**：无需手动输入用户名密码，一键完成 CAS 登录
- **多账号管理**：支持管理多个账号，快速切换不同身份
- **Token 自动注入**：登录成功后自动将 Token 注入到目标应用
- **安全加密**：密码采用 AES-GCM 256 位加密存储
- **跨域支持**：内置 CORS 规则管理，解决跨域请求问题

---

## 🎯 功能特性

### 1. CAS 登录地址管理

在 Options 页面可以配置多个 CAS 登录服务器地址：

- **配置项**：
  - CAS 名称：便于识别的友好名称
  - CAS URL：登录接口地址
  - 用户名字段：请求体中的用户名参数名（默认：email）
  - 密码字段：请求体中的密码参数名（默认：password）
  - Token 响应键：响应数据中 Token 的字段名（默认：token）

- **使用场景**：
  - 开发环境、测试环境、生产环境的不同 CAS 服务器
  - 不同项目的独立认证系统

### 2. 回调地址管理

在 Options 页面可以配置登录成功后的回调地址：

- **配置项**：
  - 回调名称：便于识别的友好名称
  - 回调 URL：登录成功后跳转的目标地址
  - Token 存储 Keys：支持配置多个 Token 键名
  - CORS 支持：可选启用跨域请求支持

- **Token 映射机制**：
  - 支持将不同 CAS 服务器的 Token 映射到不同的 localStorage Key
  - 例如：`accessToken` 来自 CAS-1，`refreshToken` 来自 CAS-2

### 3. 账号管理

在 Options 页面可以配置多组登录账号：

- **配置项**：
  - 账号名称：便于识别的友好名称
  - 用户名：登录账号
  - 密码：登录密码（自动加密存储）

- **安全机制**：
  - 密码使用 AES-GCM 256 位加密
  - 主密钥通过 Web Crypto API 生成
  - 加密数据存储在 Chrome Storage Local

### 4. 快速登录

在 Popup 页面实现一键登录：

- **操作流程**：
  1. 选择 CAS 登录地址
  2. 选择登录账号
  3. 选择回调地址
  4. 配置 Token Key 映射（可选）
  5. 点击登录按钮

- **自动化处理**：
  - Background Script 自动解密密码
  - 向 CAS 服务器发送登录请求
  - 提取 Token 数据
  - 导航到回调地址
  - 注入 Token 到 localStorage
  - 刷新页面使 Token 生效

### 5. CORS 跨域支持

内置 CORS 规则管理功能：

- **实现方式**：使用 Chrome declarativeNetRequest API
- **配置方式**：在回调地址配置中启用 CORS 支持
- **作用范围**：针对特定回调地址的 XHR 请求
- **自动管理**：配置变更时自动更新 CORS 规则

### 6. 国际化支持

完整的中英文界面支持：

- **支持语言**：中文（zh）、英文（en）
- **切换方式**：在 Options 页面一键切换
- **翻译覆盖**：所有界面文本完整翻译

---

## 🏗️ 技术架构

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Plasmo | 0.90.5 | Chrome 扩展开发框架 |
| React | 18.2.0 | UI 框架 |
| TypeScript | 5.3.3 | 类型安全 |
| TailwindCSS | 3.4.17 | CSS 框架 |
| shadcn-ui | 2.x | UI 组件库 |
| Radix UI | Latest | 无障碍组件 |
| Lucide React | 0.577.0 | 图标库 |

### 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    Chrome Extension                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Popup     │  │   Options    │  │  Background  │  │
│  │   (UI 层)    │  │   (UI 层)    │  │  (Service    │  │
│  │              │  │              │  │   Worker)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                             │
│                    ┌───────▼───────┐                     │
│                    │ Chrome Storage│                     │
│                    │     Local     │                     │
│                    └───────────────┘                     │
│                            │                             │
│         ┌──────────────────┼──────────────────┐          │
│         │                  │                  │          │
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼──────┐  │
│  │   Crypto    │  │    Storage      │  │    i18n    │  │
│  │   Module    │  │    Manager      │  │   Module   │  │
│  └─────────────┘  └─────────────────┘  └────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 核心模块

#### 1. Background Script (background.ts)

**职责**：
- 监听来自 Popup 的登录请求
- 解密账号密码
- 向 CAS 服务器发送登录请求
- 提取和映射 Token
- 管理 CORS 规则
- 注入 Token 到目标页面

**关键功能**：
- `handleLoginRequest()`：处理登录请求
- `performCasLogin()`：执行 CAS 登录
- `injectTokensToPage()`：注入 Token 到页面
- `updateCorsRules()`：更新 CORS 规则

#### 2. Popup (popup/index.tsx)

**职责**：
- 提供用户交互界面
- 展示配置选项
- 发送登录请求
- 显示登录状态

**关键功能**：
- CAS 地址选择
- 账号选择
- 回调地址选择
- Token Key 映射配置
- 登录状态反馈

#### 3. Options (options/index.tsx)

**职责**：
- 提供配置管理界面
- CAS 地址管理
- 回调地址管理
- 账号管理
- 语言设置

**关键功能**：
- 增删改查配置项
- 初始化加密密钥
- 密码加密存储
- 配置复制功能

#### 4. Crypto Module (lib/crypto.ts)

**职责**：
- 提供加密解密功能
- 密钥管理

**关键功能**：
- `generateMasterKey()`：生成主密钥
- `encrypt()`：加密数据
- `decrypt()`：解密数据
- `exportKey()` / `importKey()`：密钥导入导出

**加密算法**：
- 算法：AES-GCM
- 密钥长度：256 位
- IV 长度：12 字节

#### 5. Storage Module (lib/storage.ts)

**职责**：
- 封装 Chrome Storage API
- 管理应用配置和状态

**关键功能**：
- `getAppSettings()` / `setAppSettings()`：应用配置管理
- `getPopupState()` / `setPopupState()`：Popup 状态管理
- `getMasterKey()` / `setMasterKey()`：主密钥管理
- `getLanguage()` / `setLanguage()`：语言设置管理

#### 6. i18n Module (lib/i18n/translations.ts)

**职责**：
- 提供国际化支持
- 管理多语言翻译

**关键功能**：
- 中英文翻译配置
- 翻译 Hook (`useTranslation`)

---

## 🔄 工作流程

### 完整登录流程

```
┌─────────────┐
│ 用户操作    │
│ (Popup UI)  │
└──────┬──────┘
       │
       │ 1. 选择 CAS、账号、回调地址
       │
       ▼
┌─────────────────┐
│ 点击登录按钮    │
│ 发送消息到      │
│ Background      │
└────────┬────────┘
         │
         │ 2. LOGIN_REQUEST 消息
         │
         ▼
┌──────────────────────┐
│ Background Script    │
│ 接收登录请求         │
└──────────┬───────────┘
           │
           │ 3. 解密密码
           │
           ▼
┌──────────────────────┐
│ 从 Storage 获取      │
│ 主密钥并解密密码     │
└──────────┬───────────┘
           │
           │ 4. 发送登录请求
           │
           ▼
┌──────────────────────┐
│ 向 CAS 服务器        │
│ 发送 POST 请求       │
└──────────┬───────────┘
           │
           │ 5. 获取响应
           │
           ▼
┌──────────────────────┐
│ 提取 Token 数据      │
│ 根据 Token Key       │
│ 映射关系处理         │
└──────────┬───────────┘
           │
           │ 6. 导航到回调地址
           │
           ▼
┌──────────────────────┐
│ 更新 Tab URL 或      │
│ 在当前页面注入       │
└──────────┬───────────┘
           │
           │ 7. 注入 Token
           │
           ▼
┌──────────────────────┐
│ 使用 Scripting API   │
│ 在 MAIN world        │
│ 注入 Token 到        │
│ localStorage         │
└──────────┬───────────┘
           │
           │ 8. 刷新页面
           │
           ▼
┌──────────────────────┐
│ 页面重新加载         │
│ 应用读取 Token       │
│ 登录成功             │
└──────────────────────┘
```

### Token 注入机制

```javascript
// 使用 Chrome Scripting API 在页面主环境执行
chrome.scripting.executeScript({
  target: { tabId },
  world: "MAIN",
  func: (tokens) => {
    // 在页面主环境中注入 Token
    for (const [key, value] of Object.entries(tokens)) {
      localStorage.setItem(key, value)
    }
    
    // 刷新页面使 Token 生效
    location.reload()
  },
  args: [tokens]
})
```

### CORS 规则管理流程

```
配置变更
    ↓
监听 Storage 变化
    ↓
提取启用 CORS 的回调配置
    ↓
生成 declarativeNetRequest 规则
    ↓
更新动态规则
    ↓
CORS 生效
```

---

## 🔐 安全机制

### 密码加密存储

#### 加密流程

```
用户输入密码
    ↓
生成主密钥 (AES-GCM 256-bit)
    ↓
生成随机 IV (12 bytes)
    ↓
使用主密钥加密密码
    ↓
导出主密钥为 Base64
    ↓
存储加密数据和主密钥
```

#### 解密流程

```
从 Storage 获取加密数据
    ↓
从 Storage 获取主密钥
    ↓
导入主密钥
    ↓
使用主密钥解密密码
    ↓
返回明文密码
```

#### 代码实现

```typescript
// 加密
export async function encrypt(plaintext: string, key: CryptoKey): Promise<EncryptResult> {
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext)
  )
  
  return {
    encrypted: bufferToBase64(encrypted),
    iv: bufferToBase64(iv),
  }
}

// 解密
export async function decrypt(params: DecryptParams, key: CryptoKey): Promise<string> {
  const { encrypted, iv } = params
  const decoder = new TextDecoder()
  
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBuffer(iv) },
    key,
    base64ToBuffer(encrypted)
  )
  
  return decoder.decode(decrypted)
}
```

### 数据存储安全

- **存储位置**：Chrome Storage Local
- **存储特点**：
  - 数据仅存储在用户本地设备
  - 与用户 Chrome 账户同步（如果启用）
  - 扩展卸载时自动清除
  - 其他扩展无法访问

### 密码不可编辑

出于安全考虑，密码一旦加密存储后无法修改：

- **原因**：避免密码在编辑过程中泄露
- **解决方案**：删除账号后重新添加

---

## 📦 部署说明

### 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 在 Chrome 中加载
# 1. 访问 chrome://extensions/
# 2. 启用开发者模式
# 3. 加载 build/chrome-mv3-dev 目录
```

### 生产构建

```bash
# 构建生产版本
pnpm build

# 打包扩展
pnpm package

# 生成的 zip 文件位于 build/ 目录
```

### 发布到 Chrome Web Store

#### 手动发布

1. 构建生产版本：`pnpm build`
2. 打包扩展：`pnpm package`
3. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
4. 上传 zip 文件
5. 填写商店信息
6. 提交审核

#### 自动发布（GitHub Actions）

项目已配置自动发布流程：

```yaml
# .github/workflows/submit.yml
name: Submit to Chrome Web Store
on:
  push:
    tags:
      - v*
```

**使用步骤**：

1. 配置 GitHub Secrets：
   - `CLIENT_ID`: Chrome Web Store API Client ID
   - `CLIENT_SECRET`: Chrome Web Store API Client Secret
   - `REFRESH_TOKEN`: Chrome Web Store API Refresh Token
   - `EXTENSION_ID`: Chrome Extension ID

2. 创建版本标签：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. GitHub Actions 自动构建并发布

---

## 🔧 配置示例

### CAS 配置示例

```json
{
  "id": "cas-001",
  "name": "生产环境 CAS",
  "url": "https://cas.example.com/api/login",
  "usernameField": "email",
  "passwordField": "password",
  "tokenResponseKey": "data.token",
  "createdAt": 1703000000000,
  "updatedAt": 1703000000000
}
```

### 回调配置示例

```json
{
  "id": "callback-001",
  "name": "主应用",
  "url": "https://app.example.com/dashboard",
  "tokenKeys": ["accessToken", "refreshToken"],
  "enableCors": true,
  "createdAt": 1703000000000,
  "updatedAt": 1703000000000
}
```

### 账号配置示例

```json
{
  "id": "account-001",
  "name": "管理员账号",
  "username": "admin@example.com",
  "encryptedPassword": "{\"encrypted\":\"...\",\"iv\":\"...\"}",
  "createdAt": 1703000000000,
  "updatedAt": 1703000000000
}
```

---

## 🐛 常见问题

### 1. Token 注入失败

**原因**：
- CAS 登录失败
- Token 响应键配置错误
- 目标页面不支持 localStorage

**解决方案**：
1. 检查 CAS 登录是否成功（查看控制台日志）
2. 验证 Token 响应键配置是否正确
3. 确认目标页面 URL 是否正确

### 2. 密码解密失败

**原因**：
- 主密钥丢失
- 加密数据损坏

**解决方案**：
1. 重新初始化加密密钥
2. 重新添加账号

### 3. CORS 请求失败

**原因**：
- 未启用 CORS 支持
- CORS 规则未生效

**解决方案**：
1. 在回调配置中启用 CORS 支持
2. 重新加载扩展

### 4. 扩展无法加载

**原因**：
- 构建失败
- Manifest 配置错误

**解决方案**：
1. 检查构建日志
2. 验证 manifest 配置
3. 清除构建缓存重新构建

---

## 📊 性能优化

### 1. 懒加载组件

- 使用 React.lazy 进行代码分割
- 按需加载大型组件

### 2. 缓存策略

- 缓存 CAS 配置和账号信息
- 减少重复的 Storage 读取

### 3. 异步处理

- 使用 async/await 处理异步操作
- 避免阻塞主线程

### 4. 日志优化

- 生产环境禁用详细日志
- 使用条件编译

---

## 🔮 未来规划

### 短期目标

- [ ] 支持更多认证协议（OAuth2、SAML）
- [ ] 添加账号分组功能
- [ ] 支持导入导出配置
- [ ] 添加登录历史记录

### 中期目标

- [ ] 支持多浏览器（Firefox、Edge）
- [ ] 添加团队协作功能
- [ ] 支持自定义脚本执行
- [ ] 添加快捷键支持

### 长期目标

- [ ] 开发配套移动端应用
- [ ] 支持云端配置同步
- [ ] 添加企业级功能
- [ ] 开放 API 接口

---

## 📝 更新日志

### v1.0.0 (2024-01-01)

**新增功能**：
- ✨ CAS 单点登录自动化
- ✨ 多账号管理
- ✨ Token 自动注入
- ✨ CORS 跨域支持
- ✨ 中英文国际化

**技术实现**：
- 🔐 AES-GCM 256 位密码加密
- 🎨 shadcn-ui + TailwindCSS UI
- 📦 Plasmo 框架
- 🌐 Chrome Manifest V3

---

## 👥 贡献者

感谢所有为 Peaks Login 做出贡献的开发者！

- [smallMark1912](https://github.com/smallMark1912) - 项目创建者和主要维护者

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 📞 联系方式

- **GitHub**: [https://github.com/smallMark1912/peaks-login](https://github.com/smallMark1912/peaks-login)
- **Issues**: [https://github.com/smallMark1912/peaks-login/issues](https://github.com/smallMark1912/peaks-login/issues)

---

<div align="center">
  <p>用 ❤️ 开发 | © 2024 Peaks Login</p>
</div>
