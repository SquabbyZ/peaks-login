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
    initEncryptionKeyDescription: "Please initialize the encryption key before adding accounts",
    initializeKey: "Initialize Key",
    casLoginAddresses: "CAS Login Addresses",
    casLoginDescription: "Configure multiple CAS login server addresses",
    casName: "Name",
    casUrl: "URL",
    casNamePlaceholder: "Production CAS",
    casUrlPlaceholder: "https://cas.example.com/login",
    addCasAddress: "Add CAS Address",
    editCasTitle: "Edit CAS Address",
    editCasDescription: "Modify the CAS address details",
    deleteCasTitle: "Delete CAS Address?",
    deleteCasDescription: "This will permanently delete",
    callbackAddresses: "Callback Addresses",
    callbackDescription: "Configure login success callback addresses",
    callbackName: "Name",
    callbackUrl: "URL",
    callbackNamePlaceholder: "Main App",
    callbackUrlPlaceholder: "https://app.example.com/dashboard",
    addCallbackAddress: "Add Callback Address",
    editCallbackTitle: "Edit Callback Address",
    editCallbackDescription: "Modify the callback address details",
    deleteCallbackTitle: "Delete Callback Address?",
    deleteCallbackDescription: "This will permanently delete",
    accounts: "Accounts",
    accountsDescription: "Configure login accounts (passwords are encrypted)",
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
    passwordCannotEditDescription: "For security reasons, passwords cannot be edited. Please delete and re-add the account if you need to change the password.",
    actions: "Actions",
    configurationRequired: "Configuration Required",
    configurationRequiredDescription: "Please configure CAS addresses, callbacks, and accounts in settings.",
    openSettings: "Open Settings",
    selectCasAddress: "Select CAS address",
    selectAccount: "Select account",
    selectCallbackAddress: "Select callback address",
    login: "Login",
    loggingIn: "Logging in...",
    loginSuccessful: "Login successful! Tokens injected.",
    pleaseSelectAllOptions: "Please select all options",
    invalidConfiguration: "Invalid configuration",
    usernameField: "Username Field",
    passwordField: "Password Field",
    tokenResponseKey: "Token Response Key",
    tokenResponseKeyPlaceholder: "token",
    tokenKey: "Token Storage Key",
    tokenKeyPlaceholder: "accessToken",
    tokenKeys: "Token Storage Keys",
    addTokenKey: "Add Token Key",
    tokenKeyMapping: "Token Key Mapping",
    tokenKeyMappingDescription: "Select which CAS response key to use for this callback's token",
    selectTokenSource: "Select token source",
    enableCors: "Enable CORS",
    enableCorsDescription: "Enable cross-origin request support for this callback address",
    theme: "Theme",
    themeDescription: "Select display theme",
    lightTheme: "Light",
    darkTheme: "Dark",
    systemTheme: "System",
    importExport: "Import/Export",
    importExportDescription: "Import or export CAS and callback configurations",
    exportConfig: "Export Config",
    importConfig: "Import Config",
    exportSuccess: "Configuration exported successfully",
    importSuccess: "Configuration imported successfully",
    importError: "Failed to import configuration",
    selectFile: "Select File",
    importWarning: "Import Warning",
    importWarningDescription: "Importing will overwrite existing CAS and callback configurations. This action cannot be undone.",
    success: "Success",
    error: "Error",
    casAddedSuccess: "CAS address added successfully",
    casUpdatedSuccess: "CAS address updated successfully",
    casDeletedSuccess: "CAS address deleted successfully",
    callbackAddedSuccess: "Callback address added successfully",
    callbackUpdatedSuccess: "Callback address updated successfully",
    callbackDeletedSuccess: "Callback address deleted successfully",
    accountAddedSuccess: "Account added successfully",
    accountDeletedSuccess: "Account deleted successfully",
    keyInitializedSuccess: "Encryption key initialized successfully",
    configCopiedSuccess: "Configuration copied successfully",
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
    passwordCannotEditDescription: "出于安全考虑，密码无法编辑。如需更改密码，请删除后重新添加账号。",
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
    importWarningDescription: "导入将覆盖现有的 CAS 和回调配置。此操作无法撤销。",
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
  },
}
