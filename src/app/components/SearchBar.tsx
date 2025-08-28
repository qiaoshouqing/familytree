"use client";

import { useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

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
        onSearch('', clearedFilters);
    };

    const toggleGeneration = (generation: string) => {
        const newSelectedGenerations = filters.selectedGenerations.includes(generation)
            ? filters.selectedGenerations.filter(g => g !== generation)
            : [...filters.selectedGenerations, generation];
        
        handleSearch(undefined, { selectedGenerations: newSelectedGenerations });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-4">
                {/* Main search input */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="搜索家族成员姓名、信息或年份..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            handleSearch(e.target.value);
                        }}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="p-2 text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        )}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 mr-1 text-gray-400 hover:text-gray-600 ${showFilters ? 'text-blue-600' : ''}`}
                        >
                            <FunnelIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Advanced filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Search options */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    搜索选项
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={filters.searchInInfo}
                                        onChange={(e) => handleSearch(undefined, { searchInInfo: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">包含个人信息搜索</span>
                                </label>
                            </div>

                            {/* Generation filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    世代筛选
                                </label>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {generations.map((generation) => (
                                        <label key={generation} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={filters.selectedGenerations.includes(generation)}
                                                onChange={() => toggleGeneration(generation)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">{generation}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Year range filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    年份范围
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder="起始年"
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        value={filters.yearRange.start || ''}
                                        onChange={(e) => handleSearch(undefined, { 
                                            yearRange: { ...filters.yearRange, start: e.target.value ? parseInt(e.target.value) : undefined }
                                        })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="结束年"
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        value={filters.yearRange.end || ''}
                                        onChange={(e) => handleSearch(undefined, { 
                                            yearRange: { ...filters.yearRange, end: e.target.value ? parseInt(e.target.value) : undefined }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}