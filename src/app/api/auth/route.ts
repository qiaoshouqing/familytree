import { NextResponse } from 'next/server';
import { getAuthConfigOnServer, getFamilyDataOnServer } from '@/utils/config';
import { isLocale, MESSAGES } from '@/i18n/messages';

export async function POST(request: Request) {
  let t = MESSAGES.zh;
  try {
    const body = await request.json();
    const { name, lang } = body;
    if (isLocale(lang)) t = MESSAGES[lang];
    
    console.log('收到验证请求:', { name });
    
    // 获取验证模式
    const authConfig = await getAuthConfigOnServer();
    const authMode = authConfig.authMode;
    
    // 在 specific 模式下，只允许输入配置的特定名称
    if (authMode === 'specific') {
      const isValid = name === authConfig.specificName;
      
      console.log('验证模式: specific, 验证结果:', isValid);
      
      if (isValid) {
        const tokenData = JSON.stringify({
          name,
          exp: Date.now() + 24 * 60 * 60 * 1000
        });
        
        const token = Buffer.from(tokenData).toString('base64');
        
        return NextResponse.json({ 
          success: true, 
          token 
        });
      }
      
      return NextResponse.json({ 
        success: false, 
        message: t.authWrongSpecific 
      }, { status: 401 });
    }
    
    // all 模式下，允许所有家族成员登录
    const familyData = await getFamilyDataOnServer();
    const allNames = new Set<string>();
    familyData.generations.forEach(generation => {
      generation.people.forEach(person => {
        allNames.add(person.name);
      });
    });
    
    const isValid = allNames.has(name);
    
    console.log('验证模式: all, 验证结果:', isValid);
    
    if (isValid) {
      const tokenData = JSON.stringify({
        name,
        exp: Date.now() + 24 * 60 * 60 * 1000
      });
      
      const token = Buffer.from(tokenData).toString('base64');
      
      return NextResponse.json({ 
        success: true, 
        token 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: t.authWrongAll 
    }, { status: 401 });
    
  } catch (error) {
    console.error('验证过程中出错:', error);
    return NextResponse.json({ 
      success: false, 
      message: t.authServerError 
    }, { status: 500 });
  }
} 