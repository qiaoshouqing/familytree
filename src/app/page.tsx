"use client";

import { useState, useEffect } from 'react';
import FamilyTree from './components/FamilyTree';
import TreeView from './components/TreeView';
import Footer from './components/Footer';
import LoginForm from './components/LoginForm';
import { useFamilyData } from '../data/familyDataWithIds';
import {
    QueueListIcon,
    Squares2X2Icon,
    ArrowRightOnRectangleIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { getPublicConfig, getFamilyFullName } from '@/utils/config';
import { FamilyData, Person } from '@/types/family';

const buildTreeStructure = (people: Person[], searchText?: string) => {
  // 创建一个映射，用于快速查找人物
  const personMap = new Map();

  // 首先将所有人物添加到映射中
  people.forEach(person => {
      personMap.set(person.id, { ...person, children: [] });
  });  

  // 根据 fatherId 建立父子关系
  people.forEach(person => {
      if (person.fatherId && personMap.has(person.fatherId)) {
          const father = personMap.get(person.fatherId);
          if (father) {
              father.children = [
                  ...(father.children || []),
                  personMap.get(person.id),
              ];
          }
      }
  });

  if (searchText) {
      // 搜索模式下只返回匹配的节点
      const searchPerson = (person: Person) => {
          return person.name.includes(searchText.trim()) ? { ...person, children: [] } : null;
      };

      // 在所有节点中搜索匹配的节点
      const matchingPeople = Array.from(personMap.values())
          .map(person => searchPerson(person))
          .filter(Boolean);

      return matchingPeople;
  }

  // 非搜索模式下，直接返回根节点
  return people
      .filter(person => !person.fatherId)
      .map(person => personMap.get(person.id));
};

export default function Home() {
    const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<FamilyData | null>(null);
    const {
        data: familyData,
        loading: dataLoading,
        error: dataError,
    } = useFamilyData();

    // 从配置中获取是否需要登录的设置和姓氏
    const publicConfig = getPublicConfig();
    const requireAuth = publicConfig.isAuthRequired;
    const familyFullName = getFamilyFullName();

    // 创建空的默认树结构
    const emptyTreeData: FamilyData = {
        generations: [
            {
                title: "家族树",
                people: [],
            },
        ],
    };

    // 创建树状结构数据
    const [treeData, setTreeData] = useState(emptyTreeData);

    // 当家族数据加载完成后，重新构建树状结构
    useEffect(() => {
      if (!dataLoading && !dataError) {
          try {
              const rootPeople = buildTreeStructure(
                  familyData.generations.flatMap(g => g.people)
              );
              
              setTreeData({
                  generations: [
                      {
                          title: "家族树",
                          people: rootPeople,
                      },
                  ],
              });
          } catch (error) {
              console.error('构建树状结构出错:', error);
          }
      }
  }, [familyData, dataLoading, dataError]);

    useEffect(() => {
        // 始终假设需要登录验证 - 真实的验证会在服务器端处理

        // 检查是否已经验证过
        const token = localStorage.getItem('auth_token');
        const authTime = localStorage.getItem('auth_time');

        if (token && authTime) {
            try {
                // 使用Buffer解码token
                const tokenData = Buffer.from(token, 'base64').toString();
                const parsedToken = JSON.parse(tokenData);
                const expirationTime = parsedToken.exp;
                const currentTime = Date.now();

                // 检查token是否过期（24小时）
                if (currentTime < expirationTime) {
                    setIsAuthenticated(true);
                    setUserName(parsedToken.name || '');
                } else {
                    // 清除过期的token
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_time');
                }
            } catch (error) {
                console.error('Token解析错误:', error);
                // token解析错误，清除
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_time');
            }
        }

        setLoading(false);
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        // 清除验证信息
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_time');
        setIsAuthenticated(false);
    };

    const search = () => {
        if (!searchText.trim()) {
            setSearchResults(null);
            return;
        }

        const results = {
            generations: [
                {
                    title: '搜索结果',
                    people: [],
                },
            ],
        } as FamilyData;

        if (viewMode === 'tree') {
          const rootPeople = buildTreeStructure(
            familyData.generations.flatMap(g => g.people),searchText
        );
          results.generations[0].people = rootPeople;
        } else {
            familyData.generations.forEach(generation => {
                generation.people.forEach(person => {
                    if (person.name.includes(searchText.trim())) {                      
                        results.generations[0].title = generation.title;
                        results.generations[0].people.push(person);
                    }
                });
            });
        }

        setSearchResults(results ? results : null);
    };

    // 显示加载状态
    if (loading || dataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // 如果需要登录且未验证，显示登录表单
    if (requireAuth && !isAuthenticated) {
        return <LoginForm onLoginSuccess={handleLoginSuccess} />;
    }

    // 已验证或不需要登录，显示家谱内容
    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm mb-4">
                <div className="max-w-7xl mx-auto px-4 py-6 relative">
                    {/* 只有在需要登录且已登录的情况下才显示退出按钮 */}
                    {requireAuth && isAuthenticated && (
                        <div className="absolute right-4 top-4">
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                                退出
                            </button>
                        </div>
                    )}

                    <h1 className="text-3xl font-bold text-gray-900 text-center">
                        {familyFullName}族谱
                    </h1>
                    <p className="mt-2 text-gray-500 text-center text-sm tracking-wide">
                        传承历史 · 延续文化
                    </p>
                    {requireAuth && userName && (
                        <p className="mt-1 text-blue-500 text-center text-xs">
                            欢迎您，{familyFullName}族人
                        </p>
                    )}

                    <div className="pt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
                        {/* 搜索框 */}
                        <div className="inline-flex rounded-md">
                            <input
                                className="border border-blue-300 shadow-sm rounded-md pl-2"
                                type="text"
                                placeholder="请输入搜索的名字"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />

                            <button
                                type="button"
                                className={`ml-2 px-4 py-2 text-sm font-medium shadow-sm    rounded-md flex items-center cursor-pointer 
                bg-blue-50 text-blue-700 border border-blue-200
                }`}
                                onClick={() => search()}
                            >
                                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                                搜索
                            </button>
                        </div>

                        {/* 视图切换按钮 */}
                        <div className="inline-flex rounded-md shadow-sm">
                            <button
                                type="button"
                                className={`px-4 py-2 text-sm font-medium rounded-l-md flex items-center ${
                                    viewMode === 'list'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                                onClick={() => setViewMode('list')}
                            >
                                <QueueListIcon className="h-4 w-4 mr-2" />
                                列表视图
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-2 text-sm font-medium rounded-r-md flex items-center ${
                                    viewMode === 'tree'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                                onClick={() => setViewMode('tree')}
                            >
                                <Squares2X2Icon className="h-4 w-4 mr-2" />
                                树状视图
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-grow">
                {dataError && (
                    <div className="text-center text-red-500 mb-4">
                        {dataError} - 使用默认数据
                    </div>
                )}

                {viewMode === 'list' ? (
                    <FamilyTree familyData={searchResults || familyData} />
                ) : (
                    <TreeView data={searchResults || treeData} />
                )}
            </div>

            <Footer />
        </main>
    );
}
