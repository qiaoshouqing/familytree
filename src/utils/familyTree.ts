import { FamilyData, Person } from '@/types/family';

// 构建家族树的核心算法
export function buildFamilyTree(familyData: FamilyData): FamilyData {
  if (!familyData.generations.length) {
    return {
      generations: [
        {
          title: "家族树",
          people: []
        }
      ]
    };
  }

  try {
    // 创建一个映射，用于快速查找人物 - O(n) 时间复杂度
    const personMap = new Map<string, Person & { children: Person[] }>();
    
    // 首先将所有人物添加到映射中
    familyData.generations.forEach(generation => {
      generation.people.forEach(person => {
        if (person.id) {
          personMap.set(person.id, { ...person, children: [] });
        }
      });
    });
    
    // 根据 fatherId 建立父子关系 - O(n) 时间复杂度
    familyData.generations.forEach(generation => {
      generation.people.forEach(person => {
        if (person.fatherId && personMap.has(person.fatherId)) {
          const father = personMap.get(person.fatherId);
          const child = personMap.get(person.id!);
          if (father && child) {
            father.children.push(child);
          }
        }
      });
    });
    
    // 找到第一代人物（没有 fatherId 的人）
    const rootPeople: Person[] = [];
    if (familyData.generations[0]) {
      familyData.generations[0].people.forEach(person => {
        const personWithChildren = personMap.get(person.id!);
        if (personWithChildren) {
          rootPeople.push(personWithChildren);
        }
      });
    }
    
    return {
      generations: [
        {
          title: "家族树",
          people: rootPeople
        }
      ]
    };
  } catch (error) {
    console.error('构建树状结构出错:', error);
    // 返回空的安全结构
    return {
      generations: [
        {
          title: "家族树",
          people: []
        }
      ]
    };
  }
}

// 优化的搜索索引构建 - 为了提升搜索性能
export interface SearchIndex {
  nameIndex: Map<string, Person[]>;
  infoIndex: Map<string, Person[]>;
  yearIndex: Map<number, Person[]>;
}

export function buildSearchIndex(familyData: FamilyData): SearchIndex {
  const nameIndex = new Map<string, Person[]>();
  const infoIndex = new Map<string, Person[]>();
  const yearIndex = new Map<number, Person[]>();

  familyData.generations.forEach(generation => {
    generation.people.forEach(person => {
      // 构建姓名索引 - 按字符分割
      const nameChars = person.name.toLowerCase().split('');
      nameChars.forEach(char => {
        if (!nameIndex.has(char)) {
          nameIndex.set(char, []);
        }
        nameIndex.get(char)!.push(person);
      });

      // 构建信息索引 - 按词分割
      if (person.info) {
        const infoWords = person.info.toLowerCase().split(/\s+/);
        infoWords.forEach(word => {
          if (word.length > 1) { // 忽略单字符
            if (!infoIndex.has(word)) {
              infoIndex.set(word, []);
            }
            infoIndex.get(word)!.push(person);
          }
        });
      }

      // 构建年份索引
      if (person.birthYear) {
        if (!yearIndex.has(person.birthYear)) {
          yearIndex.set(person.birthYear, []);
        }
        yearIndex.get(person.birthYear)!.push(person);
      }
      if (person.deathYear) {
        if (!yearIndex.has(person.deathYear)) {
          yearIndex.set(person.deathYear, []);
        }
        yearIndex.get(person.deathYear)!.push(person);
      }
    });
  });

  return { nameIndex, infoIndex, yearIndex };
}