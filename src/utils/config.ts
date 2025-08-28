import { FamilyData } from '../types/family';

// 定义配置类型
export interface AuthConfig {
  requireAuth: boolean;
  authMode: 'all' | 'specific';
  specificName: string;
  familyName: string;
}

// 客户端公开配置类型（不包含敏感信息）
export interface PublicConfig {
  familyName: string;
  isAuthRequired: boolean; // 只公开是否需要认证，不公开具体验证细节
}

// 默认空的家族数据
const defaultFamilyData: FamilyData = {
  generations: []
};

// 缓存配置数据
let authConfigCache: AuthConfig | null = null;
let familyDataCache: FamilyData | null = null;

// 在服务器端加载配置文件
async function loadConfigOnServer<T>(filename: string, defaultConfig: T): Promise<T> {
  // 检查是否在服务器端
  if (typeof window !== 'undefined') {
    console.warn(`Cannot load ${filename} in browser environment, using default config`);
    return defaultConfig;
  }

  try {
    // 动态导入fs和path模块(仅在服务器端)
    const [fs, path] = await Promise.all([
      import('fs').then(m => m.default),
      import('path').then(m => m.default)
    ]);
    
    const configDir = path.join(process.cwd(), 'config');
    const filePath = path.join(configDir, filename);
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent) as T;
    }
  } catch (error) {
    console.warn(`Error loading config file ${filename}:`, error);
  }
  
  return defaultConfig;
}

// 从环境变量读取服务器端认证配置
function getAuthConfigOnServerFromEnv(): AuthConfig {
  return {
    requireAuth: process.env.NEXT_PUBLIC_REQUIRE_AUTH === 'true',
    authMode: (process.env.AUTH_MODE as 'all' | 'specific') || 'specific',
    specificName: process.env.SPECIFIC_NAME || '',
    familyName: process.env.NEXT_PUBLIC_FAMILY_NAME || '姓氏'
  };
}

// 从环境变量读取客户端公开配置
function getPublicConfigFromEnv(): PublicConfig {
  return {
    familyName: process.env.NEXT_PUBLIC_FAMILY_NAME || '姓氏',
    isAuthRequired: process.env.NEXT_PUBLIC_REQUIRE_AUTH === 'true'
  };
}

// 导出配置访问函数 - 仅用于服务器端组件
export async function getAuthConfigOnServer(): Promise<AuthConfig> {
  if (authConfigCache) return authConfigCache;
  
  // 直接从环境变量读取配置
  const config = getAuthConfigOnServerFromEnv();
  authConfigCache = config;
  return config;
}

// 在客户端用于获取完整的姓氏名称（带"氏"字）
export function getFamilyFullName(): string {
  const config = getPublicConfigFromEnv();
  return `${config.familyName}氏`;
}

export async function getFamilyDataOnServer(): Promise<FamilyData> {
  if (familyDataCache) return familyDataCache;
  
  const data = await loadConfigOnServer<FamilyData>('family-data.json', defaultFamilyData);
  familyDataCache = data;
  return data;
}

// 客户端公开配置（只包含可以在客户端公开的信息）
export function getPublicConfig(): PublicConfig {
  return getPublicConfigFromEnv();
}

// 对于familyData，我们需要通过API获取，因为这个数据量可能很大
export function getFamilyData(): FamilyData {
  return defaultFamilyData; // 这只是一个默认值，实际数据将通过API加载
} 