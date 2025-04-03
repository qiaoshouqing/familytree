import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), 'config', 'family-data.json');
    
    // 检查文件是否存在
    if (!fs.existsSync(configPath)) {
      console.warn('family-data.json not found, returning empty data');
      return NextResponse.json({
        generations: []
      });
    }

    // 读取并解析文件
    const fileContent = fs.readFileSync(configPath, 'utf8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading family data:', error);
    return NextResponse.json(
      { error: 'Failed to load family data' },
      { status: 500 }
    );
  }
} 