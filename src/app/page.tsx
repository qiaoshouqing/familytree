"use client";

import { useState, useEffect } from 'react';
import FamilyTree from './components/FamilyTree';
import TreeView from './components/TreeView';
import Footer from './components/Footer';
import LoginForm from './components/LoginForm';
import SearchBar, { SearchFilters } from './components/SearchBar';
import { useFamilyData } from '../data/familyDataWithIds';
import { QueueListIcon, Squares2X2Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { getPublicConfig, getFamilyFullName } from '@/utils/config';
import { FamilyData } from '@/types/family';
import { searchFamilyData, createFilteredFamilyData, SearchResult } from '@/utils/search';

export default function Home() {
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const { data: familyData, loading: dataLoading, error: dataError } = useFamilyData();
  
  // Search related state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: '',
    searchInInfo: true,
    selectedGenerations: [],
    yearRange: {}
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [filteredFamilyData, setFilteredFamilyData] = useState<FamilyData>(familyData);
  
  // 从配置中获取是否需要登录的设置和姓氏
  const publicConfig = getPublicConfig();
  const requireAuth = publicConfig.isAuthRequired;
  const familyFullName = getFamilyFullName();

  // 创建空的默认树结构
  const emptyTreeData: FamilyData = {
    generations: [
      {
        title: "家族树",
        people: []
      }
    ]
  };

  // 创建树状结构数据
  const [treeData, setTreeData] = useState(emptyTreeData);
  
  // 当家族数据加载完成后，重新构建树状结构
  useEffect(() => {
    if (!dataLoading && !dataError) {
      try {
        // 创建一个映射，用于快速查找人物
        const personMap = new Map();
        
        // 首先将所有人物添加到映射中
        familyData.generations.forEach(generation => {
          generation.people.forEach(person => {
            personMap.set(person.id, { ...person, children: [] });
          });
        });
        
        // 根据 fatherId 建立父子关系
        familyData.generations.forEach(generation => {
          generation.people.forEach(person => {
            if (person.fatherId && personMap.has(person.fatherId)) {
              const father = personMap.get(person.fatherId);
              if (father) {
                father.children = [...(father.children || []), personMap.get(person.id)];
              }
            }
          });
        });
        
        // 找到第一代人物（没有 fatherId 的人）
        const rootPeople = familyData.generations[0].people.map(person => personMap.get(person.id));
        
        // 创建树状结构的个人数据
        setTreeData({
          generations: [
            {
              title: "家族树",
              people: rootPeople
            }
          ]
        });
      } catch (error) {
        console.error('构建树状结构出错:', error);
      }
    }
  }, [familyData, dataLoading, dataError]);

  // Search effect - update filtered data when search changes
  useEffect(() => {
    if (!dataLoading && !dataError && familyData) {
      if (searchTerm || searchFilters.selectedGenerations.length > 0 || 
          searchFilters.yearRange.start || searchFilters.yearRange.end) {
        const results = searchFamilyData(familyData, searchTerm, searchFilters);
        setSearchResults(results);
        setFilteredFamilyData(createFilteredFamilyData(familyData, results));
      } else {
        setSearchResults([]);
        setFilteredFamilyData(familyData);
      }
    }
  }, [familyData, searchTerm, searchFilters, dataLoading, dataError]);

  // Search handler
  const handleSearch = (term: string, filters: SearchFilters) => {
    setSearchTerm(term);
    setSearchFilters(filters);
  };

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
          <div className="mt-6 flex justify-center">
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
        
        <div className="max-w-7xl mx-auto px-4 mb-6">
          {/* 搜索框 */}
          <div className="flex justify-end mb-4">
            <SearchBar 
              onSearch={handleSearch}
              generations={familyData.generations.map(g => g.title)}
            />
          </div>
          
          {/* 搜索结果提示 */}
          {searchResults.length === 0 && (searchTerm || searchFilters.selectedGenerations.length > 0 || 
           searchFilters.yearRange.start || searchFilters.yearRange.end) && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg">未找到匹配的家族成员</p>
              <p className="text-sm">请尝试修改搜索条件</p>
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="text-sm text-gray-600 text-center mb-4">
              找到 <span className="font-medium text-blue-600">{searchResults.length}</span> 个匹配结果
            </div>
          )}
        </div>
        
        {viewMode === 'list' ? (
          <FamilyTree 
            familyData={filteredFamilyData} 
            searchTerm={searchTerm}
            searchInInfo={searchFilters.searchInInfo}
          />
        ) : (
          <TreeView 
            data={treeData} 
            searchTerm={searchTerm}
            searchInInfo={searchFilters.searchInInfo}
          />
        )}
      </div>
      
      <Footer />
    </main>
  );
}
