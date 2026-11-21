// 界面文案。家族数据（人名、世代、事迹）不在这里，按 config/family-data.json 原样显示。
// family 参数是 getFamilyFullName(lang) 的结果：中文「白氏」，英文「The Bai」。

export const LOCALES = ['zh', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE = 'lang';
export const HTML_LANG: Record<Locale, string> = { zh: 'zh-CN', en: 'en' };

const zh = {
  metaTitle: (family: string) => `${family}族谱`,
  metaDescription: (family: string) => `${family}家族族谱记录`,

  // 页头
  siteTitle: (family: string) => `${family}族谱`,
  tagline: '传承历史 · 延续文化',
  welcome: ({ family }: { family: string; user: string }) => `欢迎您，${family}族人`,
  logout: '退出',
  listView: '列表视图',
  treeView: '树状视图',
  switchTo: 'English',
  switchToLabel: 'Switch to English',

  // 数据和搜索
  dataError: '加载家族数据失败，使用默认数据',
  noMatchTitle: '未找到匹配的家族成员',
  noMatchHint: '请尝试修改搜索条件',
  matchBefore: '找到 ',
  matchAfter: ' 个匹配结果',
  matchAfterOne: ' 个匹配结果',
  search: '搜索',
  includeDetails: '包含详细信息',
  generation: '世代',
  years: '年份',
  yearFrom: '起始',
  yearTo: '结束',
  clearFilters: '清除所有筛选',

  // 列表和树
  father: '父亲：',
  children: '子嗣：',
  childSeparator: { text: '、', className: 'mx-1' },
  treeTitle: '家族树状图',

  // 登录
  loginTitle: (family: string) => `${family}家谱`,
  loginSubtitle: '请输入姓名进行验证',
  nameLabel: '姓名',
  checking: '验证中...',
  enter: '进入家谱',
  needHelp: '需要帮助？',
  helpHint: '请输入家谱中的人名登录',
  loginOk: (name: string) => `登录成功！欢迎 ${name}`,
  // 以下三条由 /api/auth 按请求里的 lang 返回
  authWrongSpecific: '请输入正确的姓名',
  authWrongAll: '姓名不正确',
  authServerError: '验证失败，请重试',
  loginFailed: '验证失败，请检查姓名',
  loginError: '验证过程中出现错误，请重试',
  openSourcePrefix: '这是一个开源项目，访问我们的',
  githubRepo: 'GitHub仓库',

  // 页脚
  aboutTitle: '关于族谱',
  aboutText: (family: string) => `${family}族谱是一个记录${family}家族历史和传承的网站，旨在保存家族记忆，传承家族文化。`,
  openSourceTitle: '开源信息',
  openSourceText: '本项目是开源的家族谱系软件，欢迎在GitHub上查看。',
  linksTitle: '友情链接',
  fateMasterDesc: 'AI八字算命网站，提供智能化命理分析服务',
  copyright: '家族谱系项目 - MIT开源协议',
};

export type Messages = typeof zh;

// 英文措辞沿用 2026-11 英文推广视频里的界面，视频画面和真实网站保持一致。
const en: Messages = {
  metaTitle: (family) => `${family} Family Tree`,
  metaDescription: (family) => `${family} Family Tree: our family history and records`,

  siteTitle: (family) => `${family} Family Tree`,
  tagline: 'Our history · Our heritage',
  welcome: ({ user }) => `Welcome, ${user}`,
  logout: 'Log out',
  listView: 'List view',
  treeView: 'Tree view',
  switchTo: '中文',
  switchToLabel: '切换到中文',

  dataError: 'Could not load family data - using default data',
  noMatchTitle: 'No matching family members',
  noMatchHint: 'Try a different search',
  matchBefore: 'Found ',
  matchAfter: ' matches',
  matchAfterOne: ' match',
  search: 'Search',
  includeDetails: 'Include details',
  generation: 'Generation',
  years: 'Years',
  yearFrom: 'From',
  yearTo: 'To',
  clearFilters: 'Clear all filters',

  father: 'Father:',
  children: 'Children:',
  childSeparator: { text: ',', className: 'mr-1' },
  treeTitle: 'Family tree',

  loginTitle: (family) => `${family} Family Tree`,
  loginSubtitle: 'Enter your name to continue',
  nameLabel: 'Name',
  checking: 'Checking...',
  enter: 'Enter',
  needHelp: 'Need help?',
  helpHint: 'Enter a name from the family tree',
  loginOk: (name) => `Logged in. Welcome, ${name}`,
  authWrongSpecific: 'Name not recognized',
  authWrongAll: 'Name not recognized',
  authServerError: 'Login failed, please try again',
  loginFailed: 'Name not recognized',
  loginError: 'Something went wrong, please try again',
  openSourcePrefix: 'This is an open-source project. Visit our',
  githubRepo: 'GitHub repo',

  aboutTitle: 'About',
  aboutText: (family) => `${family} Family Tree keeps a record of our family's history, so the stories get passed down.`,
  openSourceTitle: 'Open source',
  openSourceText: 'This is open-source family tree software. Find it on GitHub.',
  linksTitle: 'Links',
  fateMasterDesc: 'AI BaZi readings',
  copyright: 'Family Tree project · MIT License',
};

export const MESSAGES: Record<Locale, Messages> = { zh, en };

export function isLocale(v: unknown): v is Locale {
  return v === 'zh' || v === 'en';
}

// 按 Accept-Language 的先后顺序取第一个支持的语言。
// 没有这个头时保持原来的中文；有头但既不是中文也不是英文时给英文。
export function pickLocale(cookie: string | undefined, acceptLanguage: string | null): Locale {
  if (isLocale(cookie)) return cookie;
  if (!acceptLanguage) return 'zh';
  const tags = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().toLowerCase().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { tag, q: q ? parseFloat(q.trim().slice(2)) || 0 : 1 };
    })
    .filter((x) => x.tag && x.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of tags) {
    if (tag.startsWith('zh')) return 'zh';
    if (tag.startsWith('en')) return 'en';
  }
  return 'en';
}
