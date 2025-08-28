import { Person, Generation, FamilyData } from '@/types/family';
import { SearchFilters } from '@/app/components/SearchBar';

export interface SearchResult {
    person: Person;
    generation: string;
    matchType: 'name' | 'info' | 'year' | 'id';
    matchText?: string;
}

// 简单的模糊匹配函数
function fuzzyMatch(text: string, searchTerm: string): boolean {
    if (!text || !searchTerm) return false;
    
    const normalizedText = text.toLowerCase();
    const normalizedSearchTerm = searchTerm.toLowerCase();
    
    // 完全匹配
    if (normalizedText.includes(normalizedSearchTerm)) {
        return true;
    }
    
    // 拆分搜索词进行部分匹配
    const searchWords = normalizedSearchTerm.split(/\s+/);
    return searchWords.every(word => normalizedText.includes(word));
}

// 检查年份是否在范围内
function isYearInRange(year: number | undefined, start?: number, end?: number): boolean {
    if (!year) return false;
    if (start && year < start) return false;
    if (end && year > end) return false;
    return true;
}

// 检查人员是否匹配搜索条件
function matchesPerson(person: Person, searchTerm: string, filters: SearchFilters): SearchResult | null {
    const { searchInInfo, yearRange } = filters;
    
    // 如果有年份范围过滤，检查是否匹配
    if (yearRange.start || yearRange.end) {
        const birthMatch = isYearInRange(person.birthYear, yearRange.start, yearRange.end);
        const deathMatch = isYearInRange(person.deathYear, yearRange.start, yearRange.end);
        
        if (!birthMatch && !deathMatch) {
            return null;
        }
        
        // 如果只是年份匹配且没有搜索词，返回年份匹配
        if (!searchTerm) {
            return {
                person,
                generation: '',
                matchType: 'year',
                matchText: `${person.birthYear || ''}-${person.deathYear || ''}`
            };
        }
    }
    
    // 如果没有搜索词但有年份过滤，在上面已经处理了
    if (!searchTerm) {
        return yearRange.start || yearRange.end ? null : {
            person,
            generation: '',
            matchType: 'name'
        };
    }
    
    // 姓名匹配
    if (fuzzyMatch(person.name, searchTerm)) {
        return {
            person,
            generation: '',
            matchType: 'name',
            matchText: person.name
        };
    }
    
    // ID匹配（用于精确查找）
    if (person.id && person.id.toLowerCase().includes(searchTerm.toLowerCase())) {
        return {
            person,
            generation: '',
            matchType: 'id',
            matchText: person.id
        };
    }
    
    // 个人信息匹配
    if (searchInInfo && person.info && fuzzyMatch(person.info, searchTerm)) {
        // 找到匹配的片段
        const lowerInfo = person.info.toLowerCase();
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchIndex = lowerInfo.indexOf(lowerSearchTerm);
        
        let matchText = person.info;
        if (matchIndex !== -1) {
            const start = Math.max(0, matchIndex - 20);
            const end = Math.min(person.info.length, matchIndex + searchTerm.length + 20);
            matchText = (start > 0 ? '...' : '') + 
                       person.info.substring(start, end) + 
                       (end < person.info.length ? '...' : '');
        }
        
        return {
            person,
            generation: '',
            matchType: 'info',
            matchText
        };
    }
    
    // 年份文本匹配
    if (person.birthYear && searchTerm.includes(person.birthYear.toString())) {
        return {
            person,
            generation: '',
            matchType: 'year',
            matchText: person.birthYear.toString()
        };
    }
    
    if (person.deathYear && searchTerm.includes(person.deathYear.toString())) {
        return {
            person,
            generation: '',
            matchType: 'year',
            matchText: person.deathYear.toString()
        };
    }
    
    return null;
}

// 主搜索函数
export function searchFamilyData(familyData: FamilyData, searchTerm: string, filters: SearchFilters): SearchResult[] {
    const results: SearchResult[] = [];
    
    familyData.generations.forEach(generation => {
        // 如果指定了世代过滤，检查当前世代是否被选中
        if (filters.selectedGenerations.length > 0 && 
            !filters.selectedGenerations.includes(generation.title)) {
            return;
        }
        
        generation.people.forEach(person => {
            const match = matchesPerson(person, searchTerm, filters);
            if (match) {
                match.generation = generation.title;
                results.push(match);
            }
        });
    });
    
    // 按匹配类型排序：姓名 > ID > 年份 > 信息
    const matchTypePriority = { 'name': 1, 'id': 2, 'year': 3, 'info': 4 };
    results.sort((a, b) => {
        const aPriority = matchTypePriority[a.matchType];
        const bPriority = matchTypePriority[b.matchType];
        if (aPriority !== bPriority) {
            return aPriority - bPriority;
        }
        // 同类型按姓名排序
        return a.person.name.localeCompare(b.person.name, 'zh-CN');
    });
    
    return results;
}

// 高亮匹配文本
export function highlightMatch(text: string, searchTerm: string): string {
    if (!text || !searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
}

// 创建搜索结果的过滤后家族数据
export function createFilteredFamilyData(familyData: FamilyData, searchResults: SearchResult[]): FamilyData {
    if (searchResults.length === 0) {
        return { generations: [] };
    }
    
    // 按世代分组搜索结果
    const generationMap = new Map<string, Person[]>();
    
    searchResults.forEach(result => {
        const generationTitle = result.generation;
        if (!generationMap.has(generationTitle)) {
            generationMap.set(generationTitle, []);
        }
        generationMap.get(generationTitle)!.push(result.person);
    });
    
    // 创建过滤后的世代数据
    const filteredGenerations: Generation[] = [];
    
    // 保持原始世代顺序
    familyData.generations.forEach(originalGeneration => {
        if (generationMap.has(originalGeneration.title)) {
            filteredGenerations.push({
                title: originalGeneration.title,
                people: generationMap.get(originalGeneration.title)!
            });
        }
    });
    
    return { generations: filteredGenerations };
}