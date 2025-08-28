"use client";

import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
    onSearch: (searchTerm: string, filters: SearchFilters) => void;
    generations: string[];
}

export interface SearchFilters {
    searchTerm: string;
    searchInInfo: boolean;
    selectedGenerations: string[];
    yearRange: {
        start?: number;
        end?: number;
    };
}

export default function SearchBar({ onSearch, generations }: SearchBarProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({
        searchTerm: '',
        searchInInfo: true,
        selectedGenerations: [],
        yearRange: {}
    });
    
    const filtersPanelRef = useRef<HTMLDivElement>(null);

    const handleSearch = (newSearchTerm?: string, newFilters?: Partial<SearchFilters>) => {
        const currentSearchTerm = newSearchTerm !== undefined ? newSearchTerm : searchTerm;
        const currentFilters = { ...filters, ...newFilters, searchTerm: currentSearchTerm };
        setFilters(currentFilters);
        onSearch(currentSearchTerm, currentFilters);
    };

    const clearSearch = () => {
        setSearchTerm('');
        const clearedFilters = {
            searchTerm: '',
            searchInInfo: true,
            selectedGenerations: [],
            yearRange: {}
        };
        setFilters(clearedFilters);
        setShowFilters(false);
        onSearch('', clearedFilters);
    };

    const toggleGeneration = (generation: string) => {
        const newSelectedGenerations = filters.selectedGenerations.includes(generation)
            ? filters.selectedGenerations.filter(g => g !== generation)
            : [...filters.selectedGenerations, generation];
        
        handleSearch(undefined, { selectedGenerations: newSelectedGenerations });
    };

    // 判断是否有活动的筛选器
    const hasActiveFilters = filters.selectedGenerations.length > 0 || 
                            filters.yearRange.start || 
                            filters.yearRange.end || 
                            !filters.searchInInfo;

    // 点击外部关闭筛选面板
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filtersPanelRef.current && !filtersPanelRef.current.contains(event.target as Node)) {
                setShowFilters(false);
            }
        };

        if (showFilters) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFilters]);

    return (
        <div className="relative flex items-center" ref={filtersPanelRef}>
            {/* 与按钮组统一风格的搜索框 */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="w-48 pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-200 shadow-sm transition-colors"
                    placeholder="搜索"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        handleSearch(e.target.value);
                    }}
                />
                {searchTerm && (
                    <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                )}
            </div>
            
            {/* 筛选按钮 - 与视图按钮风格一致 */}
            <button
                onClick={() => setShowFilters(!showFilters)}
                className={`ml-1 px-3 py-2 text-sm font-medium border rounded-md flex items-center shadow-sm transition-colors ${
                    showFilters || hasActiveFilters
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
            >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                {hasActiveFilters && (
                    <div className="ml-1 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                )}
            </button>

            {/* 筛选面板 */}
            {showFilters && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="p-4 space-y-3">
                        {/* 搜索选项 */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">包含详细信息</span>
                            <input
                                type="checkbox"
                                checked={filters.searchInInfo}
                                onChange={(e) => handleSearch(undefined, { searchInInfo: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </div>

                        {/* 世代筛选 */}
                        {generations.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">世代</h4>
                                <div className="flex flex-wrap gap-1">
                                    {generations.map((generation) => (
                                        <button
                                            key={generation}
                                            onClick={() => toggleGeneration(generation)}
                                            className={`px-2 py-1 rounded text-xs transition-colors ${
                                                filters.selectedGenerations.includes(generation)
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {generation}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 年份范围 */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">年份</h4>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="起始"
                                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                                    value={filters.yearRange.start || ''}
                                    onChange={(e) => handleSearch(undefined, { 
                                        yearRange: { ...filters.yearRange, start: e.target.value ? parseInt(e.target.value) : undefined }
                                    })}
                                />
                                <span className="text-gray-400 text-xs">-</span>
                                <input
                                    type="number"
                                    placeholder="结束"
                                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                                    value={filters.yearRange.end || ''}
                                    onChange={(e) => handleSearch(undefined, { 
                                        yearRange: { ...filters.yearRange, end: e.target.value ? parseInt(e.target.value) : undefined }
                                    })}
                                />
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <div className="pt-2 border-t border-gray-100">
                                <button
                                    onClick={clearSearch}
                                    className="text-xs text-gray-600 hover:text-gray-800 underline"
                                >
                                    清除所有筛选
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}