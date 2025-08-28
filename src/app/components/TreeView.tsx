"use client";

import { useState } from 'react';
import { FamilyData, Person } from '@/types/family';
import { ChevronDownIcon, ChevronRightIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { highlightMatch } from '@/utils/search';

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
}

const TreeNode = ({ person, level, searchTerm, searchInInfo }: TreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = person.children && person.children.length > 0;
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="ml-6">
      <div 
        className="flex items-center py-2 hover:bg-gray-50 rounded-md -ml-2 pl-2 cursor-pointer"
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
            <TreeNode key={index} person={child} level={level + 1} searchTerm={searchTerm} searchInInfo={searchInInfo} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function TreeView({ data, searchTerm, searchInInfo }: TreeViewProps) {
  // 找到第一代人物作为树的根节点
  const rootPeople = data.generations[0]?.people || [];
  
  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">家族树状图</h2>
        <div className="overflow-x-auto">
          {rootPeople.map((person, index) => (
            <TreeNode key={index} person={person} level={0} searchTerm={searchTerm} searchInInfo={searchInInfo} />
          ))}
        </div>
      </div>
    </div>
  );
} 