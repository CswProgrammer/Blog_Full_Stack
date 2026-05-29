export type Locale = 'zh' | 'en';

export const locales: Locale[] = ['zh', 'en'];

export function normalizeLocale(locale: string): Locale {
  return locale === 'en' ? 'en' : 'zh';
}

export function apiLocale(locale: Locale) {
  return locale === 'en' ? 'en-US' : 'zh-CN';
}

export const dict = {
  zh: {
    home: '首页',
    about: '关于',
    projects: '项目',
    posts: '文章',
    contact: '联系',
    login: '登录',
    menu: '菜单',
    close: '关闭',
    adminLogin: '管理登录',
    switchLanguage: 'EN',
    featured: '主项目',
    projectArchive: '项目档案',
    writing: '文章笔记',
    contactTitle: '联系入口',
    footer: '准备开始下一次构建。',
    repo: '代码仓库 / 邮箱 / 订阅',
    admin: '管理'
  },
  en: {
    home: 'Home',
    about: 'About',
    projects: 'Projects',
    posts: 'Writing',
    contact: 'Contact',
    login: 'Login',
    menu: 'Menu',
    close: 'Close',
    adminLogin: 'Admin Login',
    switchLanguage: '中文',
    featured: 'Featured',
    projectArchive: 'Project Archive',
    writing: 'Writing',
    contactTitle: 'Contact',
    footer: 'Keep building the idea.',
    repo: 'GitHub / Email / RSS',
    admin: 'Admin'
  }
};
