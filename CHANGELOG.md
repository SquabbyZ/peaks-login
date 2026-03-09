# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Support for multiple CAS login server configurations
- Multi-account management with encrypted password storage
- Automatic token injection into target pages
- CORS rule management for cross-origin requests
- Internationalization support (Chinese and English)
- Token key mapping mechanism
- Configuration copy functionality
- Language switching in settings

### Changed
- Improved UI/UX with shadcn-ui components
- Enhanced security with AES-GCM 256-bit encryption
- Optimized token injection mechanism
- Better error handling and user feedback

### Security
- Implemented AES-GCM encryption for password storage
- Added master key generation and management
- Secure data storage in Chrome Storage Local

## [1.0.0] - 2024-01-01

### Added

#### Core Features
- **CAS Single Sign-On Automation**
  - Support for configuring multiple CAS login server addresses
  - Customizable username and password field names
  - Flexible token response key configuration
  - Automatic login workflow without manual credential entry

- **Multi-Account Management**
  - Add and manage multiple login accounts
  - Passwords encrypted with AES-GCM 256-bit encryption
  - Quick account switching
  - Local encrypted storage for privacy protection

- **Automatic Token Injection**
  - Automatically inject tokens into target pages after successful login
  - Support for multiple callback URLs
  - Multiple token key mapping support
  - Automatic page navigation and refresh handling

- **CORS Support**
  - Built-in CORS rule management
  - Enable cross-origin requests for specific callback URLs
  - Implemented using Chrome declarativeNetRequest API
  - Automatic CORS rule updates on configuration changes

- **Internationalization**
  - Support for Chinese and English interfaces
  - One-click language switching
  - Complete translation coverage for all UI elements

#### User Interface
- **Popup Page**
  - CAS address selection dropdown
  - Account selection dropdown
  - Callback address selection dropdown
  - Token key mapping configuration
  - Login button with loading state
  - Success/error status display

- **Options Page**
  - CAS login address management (CRUD operations)
  - Callback address management (CRUD operations)
  - Account management (CRUD operations)
  - Language settings
  - Encryption key initialization
  - Configuration copy functionality

#### Technical Implementation
- **Background Script**
  - Message listener for login requests
  - Password decryption functionality
  - CAS login request handling
  - Token extraction and mapping
  - Token injection using Chrome Scripting API
  - CORS rule management
  - Automatic rule updates on storage changes

- **Encryption Module**
  - AES-GCM 256-bit encryption algorithm
  - Master key generation using Web Crypto API
  - Key export/import functionality
  - Secure password encryption and decryption

- **Storage Module**
  - Chrome Storage Local integration
  - Application settings management
  - Popup state persistence
  - Master key storage
  - Language preference storage

- **UI Components**
  - Built with shadcn-ui component library
  - TailwindCSS styling system
  - Radix UI primitives for accessibility
  - Lucide React icons
  - Responsive design

#### Security Features
- Password encryption using AES-GCM
- Master key management
- Secure storage in Chrome Storage Local
- No password editing for security reasons
- Automatic data cleanup on extension uninstall

#### Developer Experience
- TypeScript strict mode enabled
- No `any` types allowed
- All types must use type annotations
- ESLint and Prettier configuration
- Hot reload support in development
- Source Map support for debugging

### Technical Details

#### Dependencies
- **Framework**: Plasmo 0.90.5
- **UI Library**: React 18.2.0
- **Language**: TypeScript 5.3.3
- **Styling**: TailwindCSS 3.4.17
- **UI Components**: shadcn-ui 2.x
- **Icons**: Lucide React 0.577.0

#### Browser Support
- Chrome (Manifest V3)
- Edge (Chromium-based)
- Brave
- Other Chromium-based browsers

#### Permissions
- `storage`: For storing configuration and encrypted data
- `scripting`: For injecting tokens into pages
- `tabs`: For page navigation and management
- `declarativeNetRequest`: For CORS rule management
- Host permissions for all HTTPS and HTTP sites

### Known Issues
- Passwords cannot be edited after being stored (by design for security)
- Only supports Chromium-based browsers
- Requires manual initialization of encryption key before adding accounts

### Breaking Changes
- None (initial release)

### Migration Guide
- Not applicable (initial release)

---

## Version History

| Version | Release Date | Description |
|---------|--------------|-------------|
| 1.0.0 | 2024-01-01 | Initial release with core features |

---

## Upcoming Features

### Planned for v0.1.0
- [ ] Import/export configuration
- [ ] Account grouping functionality
- [ ] Login history tracking
- [ ] Keyboard shortcuts support
- [ ] Dark mode support

### Planned for v0.2.0
- [ ] OAuth2 protocol support
- [ ] SAML authentication support
- [ ] Custom script execution
- [ ] Advanced token mapping

### Planned for v1.0.0
- [ ] Firefox browser support
- [ ] Team collaboration features
- [ ] Cloud configuration sync
- [ ] Enterprise features
- [ ] API for external integrations

---

## Release Notes

### v1.0.0 - Initial Release

This is the first public release of Peaks Login, a Chrome extension for automating CAS single sign-on workflows.

**Key Highlights**:
- 🚀 One-click CAS login automation
- 🔐 Secure password encryption with AES-GCM
- 👥 Multi-account management
- 🎯 Automatic token injection
- 🌐 CORS support for cross-origin requests
- 🌍 Bilingual interface (Chinese/English)

**Getting Started**:
1. Install the extension from Chrome Web Store
2. Click the extension icon and open settings
3. Initialize the encryption key
4. Configure CAS login addresses
5. Add callback URLs
6. Add your accounts
7. Start using one-click login!

**Feedback**:
We'd love to hear your feedback! Please report any issues or suggestions on our [GitHub Issues](https://github.com/smallMark1912/peaks-login/issues) page.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
