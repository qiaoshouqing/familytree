// 动画和延时相关常量
export const ANIMATION_DELAYS = {
  SCROLL_TO_MATCH: 100, // 滚动到匹配项的延时
  HIGHLIGHT_DURATION: 2000, // 高亮显示持续时间
  SEARCH_DEBOUNCE: 300, // 搜索防抖延时
} as const;

// 认证相关常量
export const AUTH_CONFIG = {
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24小时
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    AUTH_TIME: 'auth_time',
  },
} as const;

// UI相关常量
export const UI_CONFIG = {
  SEARCH_INPUT_WIDTH: 'w-48',
  FILTER_PANEL_WIDTH: 'w-80',
  MAX_SEARCH_RESULTS_DISPLAY: 50, // 最多显示的搜索结果数量
} as const;

// 搜索相关常量
export const SEARCH_CONFIG = {
  MIN_SEARCH_LENGTH: 1, // 最小搜索长度
  MAX_SEARCH_RESULTS: 100, // 最大搜索结果数量
  SEARCH_FIELDS: {
    NAME: 'name',
    INFO: 'info',
    YEAR: 'year',
  },
} as const;

// CSS类名常量
export const CSS_CLASSES = {
  HIGHLIGHT: {
    RING: 'ring-2',
    RING_COLOR: 'ring-blue-400',
    BACKGROUND: 'bg-blue-50',
  },
  SEARCH_HIGHLIGHT: 'bg-yellow-200 px-1 rounded',
} as const;