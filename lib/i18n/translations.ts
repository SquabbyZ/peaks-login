export type Language = "en" | "zh"

export interface Translations {
  appName: string
  appDescription: string
  loading: string
  settings: string
  save: string
  cancel: string
  delete: string
  add: string
  edit: string
  copy: string
  copySuccess: string
  copyCasTitle: string
  copyCallbackTitle: string
  copyAccountTitle: string
  retry: string
  settingsTitle: string
  settingsDescription: string
  language: string
  languageDescription: string
  initEncryptionKey: string
  initEncryptionKeyDescription: string
  initializeKey: string
  casLoginAddresses: string
  casLoginDescription: string
  casName: string
  casUrl: string
  casNamePlaceholder: string
  casUrlPlaceholder: string
  addCasAddress: string
  editCasTitle: string
  editCasDescription: string
  deleteCasTitle: string
  deleteCasDescription: string
  callbackAddresses: string
  callbackDescription: string
  callbackName: string
  callbackUrl: string
  callbackNamePlaceholder: string
  callbackUrlPlaceholder: string
  addCallbackAddress: string
  editCallbackTitle: string
  editCallbackDescription: string
  deleteCallbackTitle: string
  deleteCallbackDescription: string
  accounts: string
  accountsDescription: string
  callbacks: string
  accountName: string
  accountUsername: string
  accountPassword: string
  accountNamePlaceholder: string
  accountUsernamePlaceholder: string
  accountPasswordPlaceholder: string
  addAccount: string
  editAccountTitle: string
  editAccountDescription: string
  deleteAccountTitle: string
  deleteAccountDescription: string
  passwordEncrypted: string
  passwordCannotEdit: string
  passwordCannotEditDescription: string
  actions: string
  configurationRequired: string
  configurationRequiredDescription: string
  openSettings: string
  selectCasAddress: string
  selectAccount: string
  selectCallbackAddress: string
  login: string
  loggingIn: string
  loginSuccessful: string
  pleaseSelectAllOptions: string
  pleaseSelectCas: string
  pleaseSelectAccount: string
  pleaseSelectCallback: string
  invalidConfiguration: string
  usernameField: string
  passwordField: string
  tokenResponseKey: string
  tokenResponseKeyPlaceholder: string
  tokenKey: string
  tokenKeyPlaceholder: string
  tokenKeys: string
  addTokenKey: string
  tokenKeyMapping: string
  tokenKeyMappingDescription: string
  selectTokenSource: string
  enableCors: string
  enableCorsDescription: string
  theme: string
  themeDescription: string
  lightTheme: string
  darkTheme: string
  systemTheme: string
  importExport: string
  importExportDescription: string
  exportConfig: string
  importConfig: string
  exportSuccess: string
  importSuccess: string
  importError: string
  selectFile: string
  importWarning: string
  importWarningDescription: string
  success: string
  error: string
  casAddedSuccess: string
  casUpdatedSuccess: string
  casDeletedSuccess: string
  callbackAddedSuccess: string
  callbackUpdatedSuccess: string
  callbackDeletedSuccess: string
  accountAddedSuccess: string
  accountDeletedSuccess: string
  keyInitializedSuccess: string
  configCopiedSuccess: string
  yes: string
  no: string
  quickNavigation: string
  jumpToSection: string

  // Combos section
  combos: string
  combosDescription: (count: number) => string
  combosRequiredFirstConfig: string
  newCombo: string
  editCombo: string
  comboName: string
  comboNamePlaceholder: string
  comboNameRequired: string
  comboRequiredFields: string
  comboTag: string
  tag: string
  comboCas: string
  comboAccount: string
  comboCallback: string
  comboCasPlaceholder: string
  comboAccountPlaceholder: string
  comboCallbackPlaceholder: string
  comboTokenKeyMapping: string
  comboTokenKeyMappingCount: (count: number) => string
  comboSelectCallbackFirst: string
  comboNoTokenKeys: string
  comboSelectTokenSource: string
  comboTokenKeyDefaultHint: string
  comboSearchPlaceholder: string
  clearSearch: string
  pinnedAria: string
  configDeleted: string
  pin: string
  unpin: string
  deleteComboTitle: string
  deleteComboDescription: (name: string) => string
  combosNoMatch: string
  combosEmpty: string

  // Tags section
  tagManagement: string
  tagManagementDescription: (count: number) => string
  newTag: string
  editTag: string
  tagName: string
  tagNamePlaceholder: string
  tagNameRequired: string
  tagNameTooLong: string
  tagColor: string
  tagPreview: string
  tagPreviewLabel: string
  deleteTagTitle: string
  deleteTagDescription: (name: string) => string
  tagEmpty: string

  copied: string

  // All-config export/import buttons
  exportAllConfig: string
  importAllConfig: string
  exportAllDescription: string
  importAllDescription: string
  exportAllSuccess: string
  importAllSuccess: string
  clearTab: string
  clear: string
  clearConfirmTitle: string
  clearConfirmDescriptionPrefix: string
  clearConfirmDescriptionSuffix: string
  clearConfirmCombos: string
  clearConfirmCas: string
  clearConfirmCallback: string
  clearConfirmTags: string
  clearConfirmAccounts: string
  clearConfirmAction: string
  tagCreatedSuccess: string
  tagUpdatedSuccess: string
  tagDeletedSuccess: string
  resetSuccess: (label: string) => string

  // Popup-specific
  loggingInAria: string
  failure: string
  unconfigured: string
  popupComboCount: (count: number) => string
  popupEmptyDescription: string
  popupSearchPlaceholder: string
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "Peaks Login",
    appDescription: "Auto Login Assistant",
    loading: "Loading...",
    settings: "Settings",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    add: "Add",
    edit: "Edit",
    copy: "Copy",
    copySuccess: "Copied to clipboard",
    copyCasTitle: "Copy CAS Address",
    copyCallbackTitle: "Copy Callback Address",
    copyAccountTitle: "Copy Account",
    retry: "Retry",
    settingsTitle: "Peaks Login Settings",
    settingsDescription: "Configure CAS login, callbacks, and accounts",
    language: "Language",
    languageDescription: "Select display language",
    initEncryptionKey: "Initialize Encryption Key",
    initEncryptionKeyDescription:
      "Please initialize the encryption key before adding accounts",
    initializeKey: "Initialize Key",
    casLoginAddresses: "CAS Addr.",
    casLoginDescription: "Config multiple CAS login server addr.",
    casName: "Name",
    casUrl: "URL",
    casNamePlaceholder: "Production CAS",
    casUrlPlaceholder: "https://cas.example.com/login",
    addCasAddress: "Add CAS Addr.",
    editCasTitle: "Edit CAS Addr.",
    editCasDescription: "Modify the CAS addr. details",
    deleteCasTitle: "Delete CAS Addr.?",
    deleteCasDescription: "This will permanently delete",
    callbackAddresses: "Callback Addr.",
    callbackDescription: "Config login success callback addr.",
    callbackName: "Name",
    callbackUrl: "URL",
    callbackNamePlaceholder: "Main App",
    callbackUrlPlaceholder: "https://app.example.com/dashboard",
    addCallbackAddress: "Add Callback Addr.",
    editCallbackTitle: "Edit Callback Addr.",
    editCallbackDescription: "Modify the callback addr. details",
    deleteCallbackTitle: "Delete Callback Addr.?",
    deleteCallbackDescription: "This will permanently delete",
    accounts: "Accounts",
    accountsDescription: "Config login accounts (pwd encrypted)",
    callbacks: "Callbacks",
    accountName: "Name",
    accountUsername: "Username",
    accountPassword: "Password",
    accountNamePlaceholder: "Admin Account",
    accountUsernamePlaceholder: "admin",
    accountPasswordPlaceholder: "••••••••",
    addAccount: "Add Account",
    editAccountTitle: "Edit Account",
    editAccountDescription: "Modify the account details",
    deleteAccountTitle: "Delete Account?",
    deleteAccountDescription: "This will permanently delete",
    passwordEncrypted: "•••••••• (encrypted)",
    passwordCannotEdit: "Password cannot be modified",
    passwordCannotEditDescription:
      "For security reasons, passwords cannot be edited. Please delete and re-add the account if you need to change the password.",
    actions: "Actions",
    configurationRequired: "Config Required",
    configurationRequiredDescription:
      "Please config CAS addr., callbacks, and accounts in settings.",
    openSettings: "Open Settings",
    selectCasAddress: "Select CAS addr.",
    selectAccount: "Select account",
    selectCallbackAddress: "Select callback addr.",
    login: "Login",
    loggingIn: "Logging in...",
    loginSuccessful: "Login successful! Tokens injected.",
    pleaseSelectAllOptions: "Please select all options",
    pleaseSelectCas: "Please select a CAS login addr.",
    pleaseSelectAccount: "Please select an account",
    pleaseSelectCallback: "Please select a callback addr.",
    invalidConfiguration: "Invalid config",
    usernameField: "Username Field",
    passwordField: "Password Field",
    tokenResponseKey: "Token Response Key",
    tokenResponseKeyPlaceholder: "token",
    tokenKey: "Token Storage Key",
    tokenKeyPlaceholder: "accessToken",
    tokenKeys: "Token Storage Keys",
    addTokenKey: "Add Token Key",
    tokenKeyMapping: "Token Key Mapping",
    tokenKeyMappingDescription:
      "Select which CAS response key to use for this callback's token",
    selectTokenSource: "Select token source",
    enableCors: "Enable CORS",
    enableCorsDescription:
      "Enable cross-origin request support for this callback addr.",
    theme: "Theme",
    themeDescription: "Select display theme",
    lightTheme: "Light",
    darkTheme: "Dark",
    systemTheme: "System",
    importExport: "Import/Export",
    importExportDescription: "Import or export CAS and callback configs",
    exportConfig: "Export Config",
    importConfig: "Import Config",
    exportSuccess: "Config exported successfully",
    importSuccess: "Config imported successfully",
    importError: "Failed to import config",
    selectFile: "Select File",
    importWarning: "Import Warning",
    importWarningDescription:
      "Importing will overwrite existing CAS and callback configs. Cannot undo.",
    success: "Success",
    error: "Error",
    casAddedSuccess: "CAS addr. added",
    casUpdatedSuccess: "CAS addr. updated",
    casDeletedSuccess: "CAS addr. deleted",
    callbackAddedSuccess: "Callback addr. added",
    callbackUpdatedSuccess: "Callback addr. updated",
    callbackDeletedSuccess: "Callback addr. deleted",
    accountAddedSuccess: "Account added",
    accountDeletedSuccess: "Account deleted",
    keyInitializedSuccess: "Encryption key initialized",
    configCopiedSuccess: "Config copied",
    yes: "YES",
    no: "NO",
    quickNavigation: "Quick Nav",
    jumpToSection: "Jump to section",

    // Combos
    combos: "Login Combos",
    combosDescription: (count) =>
      `Bundle a CAS addr. + account + callback into a named preset. One-click login from popup. ${count} combo${count === 1 ? "" : "s"} currently.`,
    combosRequiredFirstConfig:
      "Need at least 1 entry in each of 'CAS Addr.', 'Accounts', 'Callbacks' before creating a combo.",
    newCombo: "New Combo",
    editCombo: "Edit Combo",
    comboName: "Name",
    comboNamePlaceholder: "e.g. Dev / Prod / Test",
    comboNameRequired: "Please enter a combo name",
    comboRequiredFields: "Please select CAS / Account / Callback",
    comboTag: "Tag",
    tag: "Tag",
    comboCas: "CAS",
    comboAccount: "Account",
    comboCallback: "Callback",
    comboCasPlaceholder: "Select CAS",
    comboAccountPlaceholder: "Select account",
    comboCallbackPlaceholder: "Select callback",
    comboTokenKeyMapping: "Token Key Mapping",
    comboTokenKeyMappingCount: (count) => `(${count})`,
    comboSelectCallbackFirst: "Select a callback first",
    comboNoTokenKeys: "This callback has no tokenKey",
    comboSelectTokenSource: "Select CAS source",
    comboTokenKeyDefaultHint:
      "When not configured, the CAS selected above is used",
    comboSearchPlaceholder: "Search...",
    clearSearch: "Clear search",
    pinnedAria: "Pinned",
    configDeleted: "Deleted",
    pin: "Pin",
    unpin: "Unpin",
    deleteComboTitle: "Delete Login Combo",
    deleteComboDescription: (name) =>
      `Confirm delete combo "${name}"? This cannot be undone.`,
    combosNoMatch: "No matching combos",
    combosEmpty: 'No combos yet. Click "New Combo" at top-right to start.',

    // Tags
    tagManagement: "Tag Management",
    tagManagementDescription: (count) => `Currently ${count} tags.`,
    newTag: "New Tag",
    editTag: "Edit Tag",
    tagName: "Name",
    tagNamePlaceholder: "e.g. Prod / Test / Personal",
    tagNameRequired: "Please enter a tag name",
    tagNameTooLong: "Tag name cannot exceed 16 characters",
    tagColor: "Color",
    tagPreview: "Preview",
    tagPreviewLabel: "Tag preview",
    deleteTagTitle: "Delete Tag",
    deleteTagDescription: (name) =>
      `Confirm delete tag "${name}"? This cannot be undone.`,
    tagEmpty: 'No tags yet. Click "New Tag" at top-right to start.',

    copied: "Copied",

    exportAllConfig: "Export All Config",
    importAllConfig: "Import All Config",
    exportAllDescription: "Export all (CAS / Callbacks / Accounts / Combos)",
    importAllDescription: "Import all (overwrite current)",
    exportAllSuccess: "All config exported",
    importAllSuccess: "All config imported",
    clearTab: "Clear current tab",
    clear: "Clear ",
    clearConfirmTitle: "Confirm Clear?",
    clearConfirmDescriptionPrefix: "This will permanently delete ",
    clearConfirmDescriptionSuffix: ". This cannot be undone.",
    clearConfirmCombos: "all login combos",
    clearConfirmCas: "all CAS addrs.",
    clearConfirmCallback: "all callback addrs.",
    clearConfirmTags: "all tags",
    clearConfirmAccounts: "all accounts",
    clearConfirmAction: "Confirm Clear",
    tagCreatedSuccess: "Tag created",
    tagUpdatedSuccess: "Tag updated",
    tagDeletedSuccess: "Tag deleted",
    resetSuccess: (label: string) => `All ${label} reset`,

    loggingInAria: "Logging in",
    failure: "Failed",
    unconfigured: "Not configured",
    popupComboCount: (count) => `${count} login combo${count === 1 ? "" : "s"}`,
    popupEmptyDescription:
      "Configure CAS, accounts, and callbacks in the options page first, then bundle frequently-used combos for one-click login here.",
    popupSearchPlaceholder: "Search combo name / tag"
  },
  zh: {
    appName: "Peaks Login",
    appDescription: "自动登录助手",
    loading: "加载中...",
    settings: "设置",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    add: "添加",
    edit: "编辑",
    copy: "复制",
    copySuccess: "已复制到剪贴板",
    copyCasTitle: "复制 CAS 地址",
    copyCallbackTitle: "复制回调地址",
    copyAccountTitle: "复制账号",
    retry: "重试",
    settingsTitle: "Peaks Login 设置",
    settingsDescription: "配置 CAS 登录、回调和账号",
    language: "语言",
    languageDescription: "选择显示语言",
    initEncryptionKey: "初始化加密密钥",
    initEncryptionKeyDescription: "请在添加账号前初始化加密密钥",
    initializeKey: "初始化密钥",
    casLoginAddresses: "CAS 登录地址",
    casLoginDescription: "配置多个 CAS 登录服务器地址",
    casName: "名称",
    casUrl: "地址",
    casNamePlaceholder: "生产环境 CAS",
    casUrlPlaceholder: "https://cas.example.com/login",
    addCasAddress: "添加 CAS 地址",
    editCasTitle: "编辑 CAS 地址",
    editCasDescription: "修改 CAS 地址详情",
    deleteCasTitle: "删除 CAS 地址？",
    deleteCasDescription: "将永久删除",
    callbackAddresses: "回调地址",
    callbackDescription: "配置登录成功后的回调地址",
    callbackName: "名称",
    callbackUrl: "地址",
    callbackNamePlaceholder: "主应用",
    callbackUrlPlaceholder: "https://app.example.com/dashboard",
    addCallbackAddress: "添加回调地址",
    editCallbackTitle: "编辑回调地址",
    editCallbackDescription: "修改回调地址详情",
    deleteCallbackTitle: "删除回调地址？",
    deleteCallbackDescription: "将永久删除",
    accounts: "账号",
    accountsDescription: "配置登录账号（密码已加密存储）",
    callbacks: "回调地址",
    accountName: "名称",
    accountUsername: "用户名",
    accountPassword: "密码",
    accountNamePlaceholder: "管理员账号",
    accountUsernamePlaceholder: "admin",
    accountPasswordPlaceholder: "••••••••",
    addAccount: "添加账号",
    editAccountTitle: "编辑账号",
    editAccountDescription: "修改账号详情",
    deleteAccountTitle: "删除账号？",
    deleteAccountDescription: "将永久删除",
    passwordEncrypted: "•••••••• (已加密)",
    passwordCannotEdit: "密码不可修改",
    passwordCannotEditDescription:
      "出于安全考虑，密码无法编辑。如需更改密码，请删除后重新添加账号。",
    actions: "操作",
    configurationRequired: "需要配置",
    configurationRequiredDescription: "请在设置中配置 CAS 地址、回调和账号。",
    openSettings: "打开设置",
    selectCasAddress: "选择 CAS 地址",
    selectAccount: "选择账号",
    selectCallbackAddress: "选择回调地址",
    login: "登录",
    loggingIn: "登录中...",
    loginSuccessful: "登录成功！已注入令牌。",
    pleaseSelectAllOptions: "请选择所有选项",
    pleaseSelectCas: "请选择 CAS 登录地址",
    pleaseSelectAccount: "请选择账号",
    pleaseSelectCallback: "请选择回调地址",
    invalidConfiguration: "配置无效",
    usernameField: "用户名字段",
    passwordField: "密码字段",
    tokenResponseKey: "Token 响应 Key",
    tokenResponseKeyPlaceholder: "token",
    tokenKey: "Token 存储 Key",
    tokenKeyPlaceholder: "accessToken",
    tokenKeys: "Token 存储 Keys",
    addTokenKey: "添加 Token Key",
    tokenKeyMapping: "Token Key 映射",
    tokenKeyMappingDescription: "选择该回调地址的 token 来源于哪个 CAS 响应",
    selectTokenSource: "选择 Token 来源",
    enableCors: "启用跨域支持",
    enableCorsDescription: "为该回调地址启用跨域请求支持",
    theme: "主题",
    themeDescription: "选择显示主题",
    lightTheme: "明亮",
    darkTheme: "暗黑",
    systemTheme: "跟随系统",
    importExport: "导入/导出",
    importExportDescription: "导入或导出 CAS 和回调配置",
    exportConfig: "导出配置",
    importConfig: "导入配置",
    exportSuccess: "配置导出成功",
    importSuccess: "配置导入成功",
    importError: "配置导入失败",
    selectFile: "选择文件",
    importWarning: "导入警告",
    importWarningDescription:
      "导入将覆盖现有的 CAS 和回调配置。此操作无法撤销。",
    success: "成功",
    error: "错误",
    casAddedSuccess: "CAS 地址添加成功",
    casUpdatedSuccess: "CAS 地址更新成功",
    casDeletedSuccess: "CAS 地址删除成功",
    callbackAddedSuccess: "回调地址添加成功",
    callbackUpdatedSuccess: "回调地址更新成功",
    callbackDeletedSuccess: "回调地址删除成功",
    accountAddedSuccess: "账号添加成功",
    accountDeletedSuccess: "账号删除成功",
    keyInitializedSuccess: "加密密钥初始化成功",
    configCopiedSuccess: "配置复制成功",
    yes: "是",
    no: "否",
    quickNavigation: "快速导航",
    jumpToSection: "跳转到指定区域",

    // Combos
    combos: "登录组合",
    combosDescription: (count) =>
      `把 CAS + 账号 + 回调地址打成一个命名预设，popup 里一键登录。当前 ${count} 个。`,
    combosRequiredFirstConfig:
      '需要先在"CAS 登录地址"、"账号"、"回调地址"三个 section 中各至少配 1 项才能新建组合。',
    newCombo: "新建组合",
    editCombo: "编辑组合",
    comboName: "名称",
    comboNamePlaceholder: "如:开发 / 生产 / 测试",
    comboNameRequired: "请输入组合名称",
    comboRequiredFields: "请选择 CAS / 账号 / 回调",
    comboTag: "标签",
    tag: "标签",
    comboCas: "CAS",
    comboAccount: "账号",
    comboCallback: "回调",
    comboCasPlaceholder: "选择 CAS",
    comboAccountPlaceholder: "选择账号",
    comboCallbackPlaceholder: "选择回调",
    comboTokenKeyMapping: "Token Key 映射",
    comboTokenKeyMappingCount: (count) => `(${count} 个)`,
    comboSelectCallbackFirst: "先选择回调地址",
    comboNoTokenKeys: "该回调地址没有 tokenKey",
    comboSelectTokenSource: "选择 CAS 来源",
    comboTokenKeyDefaultHint: "未配置时默认用上方选中的 CAS",
    comboSearchPlaceholder: "搜索...",
    clearSearch: "清除搜索",
    pinnedAria: "已置顶",
    configDeleted: "已删除",
    pin: "置顶",
    unpin: "取消置顶",
    deleteComboTitle: "删除登录组合",
    deleteComboDescription: (name) =>
      `确认要删除组合 "${name}" 吗?此操作不可撤销。`,
    combosNoMatch: "没有匹配的组合",
    combosEmpty: '还没有组合。点右上角"新建组合"开始。',

    // Tags
    tagManagement: "标签管理",
    tagManagementDescription: (count) => `当前 ${count} 个标签。`,
    newTag: "新建标签",
    editTag: "编辑标签",
    tagName: "名称",
    tagNamePlaceholder: "如:生产 / 测试 / 个人",
    tagNameRequired: "请输入标签名称",
    tagNameTooLong: "标签名称不能超过 16 个字符",
    tagColor: "颜色",
    tagPreview: "预览",
    tagPreviewLabel: "标签预览",
    deleteTagTitle: "删除标签",
    deleteTagDescription: (name) =>
      `确认要删除标签 "${name}" 吗?此操作不可撤销。`,
    tagEmpty: '还没有标签。点右上角"新建标签"开始。',

    copied: "已复制",

    exportAllConfig: "导出全部配置",
    importAllConfig: "导入全部配置",
    exportAllDescription: "导出全部 (CAS / 回调 / 账号 / 组合)",
    importAllDescription: "导入全部 (覆盖当前)",
    exportAllSuccess: "已导出全部配置",
    importAllSuccess: "已导入全部配置",
    clearTab: "清空当前 tab",
    clear: "清空",
    clearConfirmTitle: "确认清空?",
    clearConfirmDescriptionPrefix: "将永久删除",
    clearConfirmDescriptionSuffix: "。 此操作不可撤销。",
    clearConfirmCombos: "所有登录组合",
    clearConfirmCas: "所有 CAS 登录地址",
    clearConfirmCallback: "所有回调地址",
    clearConfirmTags: "所有标签",
    clearConfirmAccounts: "所有账号",
    clearConfirmAction: "确认清空",
    tagCreatedSuccess: "标签已创建",
    tagUpdatedSuccess: "标签已更新",
    tagDeletedSuccess: "标签已删除",
    resetSuccess: (label: string) => `已重置${label}`,

    loggingInAria: "登录中",
    failure: "失败",
    unconfigured: "未设置",
    popupComboCount: (count) => `${count} 个登录组合`,
    popupEmptyDescription:
      "先在选项页配好 CAS、账号、回调, 再把常用组合打包, 这里就能一键登录。",
    popupSearchPlaceholder: "搜索组合名称 / 标签"
  }
}
