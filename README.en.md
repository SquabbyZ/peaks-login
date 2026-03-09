# Peaks Login

<div align="center">
  <img src="assets/icon.png" alt="Peaks Login" width="120" height="120">
  
  <h3>CAS Single Sign-On Automation Assistant</h3>
  
  <p>A powerful Chrome extension that simplifies CAS single sign-on workflows with multi-account management and automatic token injection</p>

  [![Plasmo](https://img.shields.io/badge/Plasmo-0.90.5-blue)](https://github.com/PlasmoHQ/plasmo)
  [![React](https://img.shields.io/badge/React-18.2.0-61dafb)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178c6)](https://www.typescriptlang.org/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38bdf8)](https://tailwindcss.com/)
</div>

---

## 📖 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [User Guide](#user-guide)
- [Core Features](#core-features)
- [Security](#security)
- [Development](#development)
- [Build & Deployment](#build--deployment)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 🔐 CAS Single Sign-On Automation
- Support for multiple CAS login server configurations
- Automated login workflow without manual credential entry
- Customizable username and password field names
- Flexible token response key configuration

### 👥 Multi-Account Management
- Add and manage multiple login accounts
- Passwords encrypted with AES-GCM 256-bit encryption
- Quick account switching
- Local encrypted storage for privacy protection

### 🎯 Automatic Token Injection
- Automatically inject tokens into target pages after successful login
- Support for multiple callback URLs
- Multiple token key mapping support
- Automatic page navigation and refresh handling

### 🌐 CORS Support
- Built-in CORS rule management
- Enable cross-origin requests for specific callback URLs
- Implemented using Chrome declarativeNetRequest API

### 🌍 Internationalization
- Support for Chinese and English interfaces
- One-click language switching
- Complete translation coverage

### 🎨 Modern UI
- Built with shadcn-ui component library
- TailwindCSS styling system
- Responsive design
- Elegant user experience

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Plasmo](https://www.plasmo.com/) | 0.90.5 | Chrome extension development framework |
| [React](https://reactjs.org/) | 18.2.0 | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.3.3 | Type-safe JavaScript |
| [TailwindCSS](https://tailwindcss.com/) | 3.4.17 | CSS framework |
| [shadcn-ui](https://ui.shadcn.com/) | 2.x | UI component library |
| [Radix UI](https://www.radix-ui.com/) | Latest | Accessible component primitives |
| [Lucide React](https://lucide.dev/) | 0.577.0 | Icon library |

---

## 📁 Project Structure

```
peaks-login/
├── .github/                    # GitHub configuration
│   └── workflows/              # CI/CD workflows
│       └── submit.yml          # Auto-publish configuration
├── .trae/                      # Trae configuration
│   ├── rules/                  # Project rules
│   │   └── token.md            # Token rules
│   └── skills/                 # Skills configuration
│       └── ui-ux-pro-max/      # UI/UX skills
├── assets/                     # Static assets
│   └── icon.png                # Extension icon
├── components/                 # React components
│   └── ui/                     # UI components
│       ├── alert-dialog.tsx    # Alert dialog
│       ├── button.tsx          # Button
│       ├── card.tsx            # Card
│       ├── dialog.tsx          # Dialog
│       ├── input.tsx           # Input
│       ├── label.tsx           # Label
│       ├── select.tsx          # Select
│       ├── switch.tsx          # Switch
│       └── table.tsx           # Table
├── contents/                   # Content Scripts
│   └── index.ts                # Content script entry
├── design-system/              # Design system
│   └── peaks-login/
│       └── MASTER.md           # Design specifications
├── lib/                        # Utility libraries
│   ├── i18n/                   # Internationalization
│   │   └── translations.ts     # Translation configuration
│   ├── crypto.ts               # Encryption utilities
│   ├── storage.ts              # Storage management
│   ├── useTranslation.ts       # Translation hook
│   └── utils.ts                # General utilities
├── options/                    # Options page
│   └── index.tsx               # Settings page component
├── popup/                      # Popup window
│   └── index.tsx               # Popup window component
├── types/                      # TypeScript type definitions
│   ├── images.d.ts             # Image types
│   └── index.ts                # Type definitions
├── background.ts               # Background script
├── components.json             # shadcn-ui configuration
├── package.json                # Project configuration
├── postcss.config.js           # PostCSS configuration
├── style.css                   # Global styles
├── tailwind.config.js          # TailwindCSS configuration
└── tsconfig.json               # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.x
- pnpm >= 8.x (recommended) or npm >= 8.x
- Chrome browser

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/smallMark1912/peaks-login.git
cd peaks-login
```

2. **Install dependencies**

```bash
pnpm install
# or
npm install
```

3. **Start development server**

```bash
pnpm dev
# or
npm run dev
```

4. **Load extension in Chrome**

   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked"
   - Select the `build/chrome-mv3-dev` folder in the project root directory

---

## 📚 User Guide

### Initial Setup

1. **Initialize Encryption Key**
   - Click the extension icon on first use
   - Click "Open Settings" to enter the settings page
   - Click "Initialize Key" button to generate an encryption key

2. **Configure CAS Login Addresses**
   - Find the "CAS Login Addresses" section in settings
   - Fill in CAS name and URL
   - Configure username field (default: email)
   - Configure password field (default: password)
   - Configure token response key (default: token)
   - Click "Add CAS Address"

3. **Configure Callback Addresses**
   - Find the "Callback Addresses" section in settings
   - Fill in callback name and URL
   - Configure token storage keys (multiple supported)
   - Optional: Enable CORS support
   - Click "Add Callback Address"

4. **Add Accounts**
   - Find the "Accounts" section in settings
   - Fill in account name, username, and password
   - Click "Add Account"
   - Password will be automatically encrypted and stored

### Using the Extension

1. Click the extension icon in the browser toolbar
2. Select a CAS login address
3. Select an account
4. Select a callback address
5. Configure token key mapping if needed
6. Click the "Login" button
7. Wait for automatic login and token injection to complete

---

## 🔧 Core Features

### 1. CAS Login Workflow

```
User clicks login
    ↓
Select CAS configuration and account
    ↓
Background Script receives login request
    ↓
Decrypt account password
    ↓
Send login request to CAS server
    ↓
Retrieve token
    ↓
Navigate to callback URL
    ↓
Inject token into localStorage
    ↓
Refresh page to apply token
```

### 2. Token Mapping Mechanism

Support mapping tokens from different CAS servers to different localStorage keys:

```typescript
// Token key mapping example
{
  "callbackId:accessToken": "casId1",
  "callbackId:refreshToken": "casId2"
}
```

### 3. CORS Rule Management

Dynamically manage CORS rules using Chrome declarativeNetRequest API:

```typescript
// CORS rule example
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

## 🔒 Security

### Password Encryption

- **Encryption Algorithm**: AES-GCM (256-bit)
- **Key Management**: Master key generated using Web Crypto API
- **Storage Method**: Passwords encrypted and stored in Chrome Storage Local

```typescript
// Encryption workflow
const key = await generateMasterKey()           // Generate master key
const encrypted = await encrypt(password, key)  // Encrypt password
await setMasterKey(await exportKey(key))        // Store master key
```

### Data Storage

All sensitive data is stored in Chrome Storage Local with the following characteristics:
- Data is stored only on the user's local device
- Syncs with user's Chrome account (if enabled)
- Data is automatically cleared when extension is uninstalled

---

## 💻 Development

### Development Mode

```bash
pnpm dev
```

Development mode features:
- Hot reload support
- Source Map support
- Detailed console logging

### Code Standards

- Use TypeScript strict mode
- No `any` types allowed
- All types must use type annotations
- Follow ESLint and Prettier rules

### Adding New Components

```bash
# Add components using shadcn-ui CLI
npx shadcn-ui@latest add [component-name]
```

### Internationalization

Add new translations in `lib/i18n/translations.ts`:

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

## 📦 Build & Deployment

### Build for Production

```bash
pnpm build
```

Build output is located in the `build/chrome-mv3-prod` directory.

### Package Extension

```bash
pnpm package
```

Generates a `.zip` file for submission to Chrome Web Store.

### Automatic Publishing

The project is configured with GitHub Actions for automatic publishing:
1. Push code to GitHub
2. GitHub Actions automatically builds
3. Automatically submits to Chrome Web Store

---

## ❓ FAQ

### Q: Why can't passwords be edited?

**A**: For security reasons, passwords cannot be modified once encrypted and stored. To change a password, delete the account and add it again.

### Q: What should I do if token injection fails?

**A**: 
1. Check if CAS login was successful
2. Verify token response key configuration is correct
3. Check browser console for error logs
4. Confirm the target page supports localStorage

### Q: How do I enable CORS support?

**A**: 
1. Go to settings page
2. Edit the callback address
3. Enable the "Enable CORS" toggle
4. Save configuration

### Q: Which browsers are supported?

**A**: Currently only supports Chromium-based browsers (Chrome, Edge, Brave, etc.) using Manifest V3.

---

## 🤝 Contributing

Contributions are welcome! Feel free to submit code, report issues, or make suggestions!

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow existing code style
- Write tests for new features
- Update relevant documentation
- Ensure TypeScript type checking passes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- [Plasmo](https://www.plasmo.com/) - Excellent browser extension development framework
- [shadcn-ui](https://ui.shadcn.com/) - Beautiful UI component library
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/smallMark1912">smallMark1912</a></p>
  <p>If this project helps you, please give it a ⭐️ Star!</p>
</div>
