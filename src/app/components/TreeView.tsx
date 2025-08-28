"use client";

import { useState, useEffect, useRef } from 'react';
import { FamilyData, Person } from '@/types/family';
import { ChevronDownIcon, ChevronRightIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { highlightMatch } from '@/utils/search';
import { ANIMATION_DELAYS, CSS_CLASSES } from '@/utils/constants';

interface TreeViewProps {
  data: FamilyData;
  searchTerm?: string;
  searchInInfo?: boolean;
}

interface TreeNodeProps {
  person: Person;
  level: number;
  searchTerm?: string;
  searchInInfo?: boolean;
  firstMatchId?: string | null;
}

// 检查是否匹配搜索条件
const isPersonMatch = (person: Person, searchTerm: string, searchInInfo: boolean): boolean => {
  if (!searchTerm) return false;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  const nameMatch = person.name.toLowerCase().includes(lowerSearchTerm);
  const infoMatch = searchInInfo && person.info && person.info.toLowerCase().includes(lowerSearchTerm);
  const yearMatch = (person.birthYear?.toString().includes(lowerSearchTerm) || false) || 
                   (person.deathYear?.toString().includes(lowerSearchTerm) || false);
  
  return nameMatch || !!infoMatch || yearMatch;
};

const TreeNode = ({ person, level, searchTerm, searchInInfo, firstMatchId }: TreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const timeoutRefs = useRef<(NodeJS.Timeout | null)[]>([]);
  const hasChildren = person.children && person.children.length > 0;
  const isFirstMatch = person.id === firstMatchId;
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // 清理所有timeout的函数
  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach(timeout => {
      if (timeout) {
        clearTimeout(timeout);
      }
    });
    timeoutRefs.current = [];
  };

  // 如果是第一个匹配项，滚动到该位置 - 修复内存泄漏
  useEffect(() => {
    if (isFirstMatch && nodeRef.current) {
      // 清理之前的timeout
      clearAllTimeouts();

      const scrollTimeout = setTimeout(() => {
        if (nodeRef.current) {
          nodeRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // 使用React state代替直接DOM操作
          setIsHighlighted(true);
          
          const highlightTimeout = setTimeout(() => {
            setIsHighlighted(false);
          }, ANIMATION_DELAYS.HIGHLIGHT_DURATION);
          
          timeoutRefs.current.push(highlightTimeout);
        }
      }, ANIMATION_DELAYS.SCROLL_TO_MATCH);
      
      timeoutRefs.current.push(scrollTimeout);
    }

    // cleanup函数 - 防止内存泄漏
    return () => {
      clearAllTimeouts();
    };
  }, [isFirstMatch]);

  return (
    <div className="ml-6">
      <div 
        ref={nodeRef}
        className={`flex items-center py-2 hover:bg-gray-50 rounded-md -ml-2 pl-2 cursor-pointer transition-all duration-300 ${
          isHighlighted 
            ? `${CSS_CLASSES.HIGHLIGHT.RING} ${CSS_CLASSES.HIGHLIGHT.RING_COLOR} ${CSS_CLASSES.HIGHLIGHT.BACKGROUND}`
            : ''
        }`}
        onClick={toggleExpand}
      >
        {hasChildren ? (
          <div className="mr-1 text-gray-400">
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </div>
        ) : (
          <div className="w-4 mr-1"></div>
        )}
        
        <div className="flex items-center">
          <div className="bg-blue-50 p-1 rounded-md mr-2 group-hover:bg-blue-100 transition-colors duration-300">
            <UserIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <span className="font-medium text-gray-800">
              <span dangerouslySetInnerHTML={{ 
                __html: searchTerm ? highlightMatch(person.name, searchTerm) : person.name 
              }} />
            </span>
            {person.info && (
              <p className="text-gray-600 text-sm mt-1 max-w-xl">
                <span dangerouslySetInnerHTML={{ 
                  __html: (searchTerm && searchInInfo) ? highlightMatch(person.info, searchTerm) : person.info 
                }} />
              </p>
            )}
            {(person.birthYear || person.deathYear) && (
              <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                <CalendarIcon className="h-3 w-3" />
                <span>
                  {person.birthYear}
                  {person.birthYear && person.deathYear && ' - '}
                  {person.deathYear && (person.birthYear ? person.deathYear : ` - ${person.deathYear}`)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="border-l border-gray-200 ml-2 pl-2">
          {person.children?.map((child, index) => (
            <TreeNode 
              key={index} 
              person={child} 
              level={level + 1} 
              searchTerm={searchTerm} 
              searchInInfo={searchInInfo}
              firstMatchId={firstMatchId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 递归查找所有匹配的人员
const findAllMatches = (person: Person, searchTerm: string, searchInInfo: boolean): Person[] => {
  const matches: Person[] = [];
  
  if (isPersonMatch(person, searchTerm, searchInInfo)) {
    matches.push(person);
  }
  
  if (person.children) {
    person.children.forEach(child => {
      matches.push(...findAllMatches(child, searchTerm, searchInInfo));
    });
  }
  
  return matches;
};

export default function TreeView({ data, searchTerm, searchInInfo }: TreeViewProps) {
  const [firstMatchId, setFirstMatchId] = useState<string | null>(null);
  // 找到第一代人物作为树的根节点
  const rootPeople = data.generations[0]?.people || [];
  
  // 找到第一个匹配项
  useEffect(() => {
    if (searchTerm) {
      const allMatches: Person[] = [];
      rootPeople.forEach(person => {
        allMatches.push(...findAllMatches(person, searchTerm, searchInInfo || false));
      });
      
      if (allMatches.length > 0) {
        setFirstMatchId(allMatches[0].id || null);
      } else {
        setFirstMatchId(null);
      }
    } else {
      setFirstMatchId(null);
    }
  }, [searchTerm, searchInInfo, rootPeople]);
  
  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">家族树状图</h2>
        <div className="overflow-x-auto">
          {rootPeople.map((person, index) => (
            <TreeNode 
              key={index} 
              person={person} 
              level={0} 
              searchTerm={searchTerm} 
              searchInInfo={searchInInfo}
              firstMatchId={firstMatchId}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 