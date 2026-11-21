# 家族族谱 (Family Tree)

[English](./README.md) | 中文

这是一个基于 [Next.js](https://nextjs.org) 开发的家族谱展示项目，可以用来展示和管理您的家族历史和成员关系。

## 演示网站

您可以通过访问 [https://familytree.pomodiary.com/](https://familytree.pomodiary.com/) 查看本项目的在线演示。

## 功能特点

- 多代家族成员的可视化展示
- 家族成员之间的关系链接
- 个人详细信息记录
- 可选的登录验证机制
- 中英文双语界面（按浏览器语言自动选择，也可以在页面上切换）
- 完全可定制的界面和数据

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
# 或
bun install
```

### 配置项目

1. 复制环境变量模板并进行配置：

```bash
cp .env.local.example .env.local
```

2. 在 `.env.local` 文件中设置您的配置：

```
# 是否需要登录验证 (true/false)
NEXT_PUBLIC_REQUIRE_AUTH=false

# 验证模式 (all: 允许所有家族成员, specific: 只允许输入特定名称)
AUTH_MODE=specific
# 特定用户登录名称
SPECIFIC_NAME=白景琦

# 姓氏配置（用于网站标题、描述和页脚）
NEXT_PUBLIC_FAMILY_NAME=白
# 英文界面用的姓氏，如 The Bai Family Tree（不填就沿用 NEXT_PUBLIC_FAMILY_NAME）
NEXT_PUBLIC_FAMILY_NAME_EN=Bai

# 应用端口号配置
PORT=3000
```

### 添加家族数据

1. 在 `config` 目录中创建您的家族数据文件`family-data.json`，可以参考 `family-data.example.json` 或 `family-data.json`。

2. 按照以下格式添加您的家族成员信息：

```json
{
  "generations": [
    {
      "title": "第一世",
      "people": [
        {
          "id": "person-id",
          "name": "姓名",
          "info": "人物描述",
          "fatherId": "父亲ID",
          "birthYear": 1900,
          "deathYear": 1980
        }
      ]
    }
  ]
}
```

字段说明：
- `id`: 每个人的唯一标识符，用于建立关系
- `name`: 姓名
- `info`: 个人描述、生平简介等
- `fatherId`: 父亲的ID，用于建立代际关系
- `birthYear`: 出生年份（可选）
- `deathYear`: 逝世年份（可选）

### 运行项目

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看您的家族谱。

## 界面语言

界面支持中文和英文：

- 第一次打开时按浏览器语言（`Accept-Language`）选择：中文浏览器显示中文，其他语言显示英文。
- 页面上方（登录页在右上角）有 **English / 中文** 按钮可以切换，选择记在 `lang` cookie 里一年，下次打开时网页标题、`<html lang>` 和描述都跟着这个选择。
- 英文界面的标题是 “The 姓氏 Family Tree”，英文姓氏用 `NEXT_PUBLIC_FAMILY_NAME_EN` 配置，不填就沿用 `NEXT_PUBLIC_FAMILY_NAME`。
- 只翻译界面文字。人名、世代标题、事迹都按 `config/family-data.json` 原样显示；想做英文族谱，直接在这个文件里用英文写自己的家族即可。开启登录时，登录名同样按 `name` 字段（或 `SPECIFIC_NAME`）匹配。
- 界面文案在 `src/i18n/messages.ts`，要加别的语言就在这里加一份词典，并在 `pickLocale` 里加上识别。

## 数据格式详解

家族数据以 JSON 格式存储，按照世代（generations）组织：

- 每个世代有一个标题（title）和一组人员（people）
- 每个人员包含 ID、姓名、信息和父亲ID
- 通过 `fatherId` 建立父子关系
- 可以在信息字段中添加配偶、子女和其他重要信息

示例：
```json
{
  "generations": [
    {
      "title": "第一世",
      "people": [
        {
          "id": "ancestor",
          "name": "始祖",
          "info": "家族创始人，生于1850年",
          "birthYear": 1850
        }
      ]
    },
    {
      "title": "第二世",
      "people": [
        {
          "id": "second-gen-1",
          "name": "长子",
          "info": "生于1880年，妻王氏",
          "fatherId": "ancestor",
          "birthYear": 1880,
          "deathYear": 1950
        },
        {
          "id": "second-gen-2",
          "name": "次子",
          "info": "生于1885年，妻李氏",
          "fatherId": "ancestor",
          "birthYear": 1885,
          "deathYear": 1960
        }
      ]
    }
  ]
}
```

## 利用AI生成家族数据

如果您有大量家族数据需要整理，可以借助AI来帮助您快速生成符合格式的JSON数据：

1. 准备您的家族信息文本，包括各代人物姓名、关系和相关信息
2. 向AI（如DeepSeek、ChatGPT、Claude等）提供以下格式指引：

```
请将我提供的家族信息整理成以下JSON格式：
{
  "generations": [
    {
      "title": "第X世",
      "people": [
        {
          "id": "唯一标识符",
          "name": "姓名",
          "info": "详细信息",
          "fatherId": "父亲ID",
          "birthYear": 出生年份,
          "deathYear": 逝世年份
        }
      ]
    }
  ]
}

要求：
1. 为每个人物生成唯一的id（如first-gen-1, second-gen-2等）
2. 正确设置fatherId以建立父子关系
3. 将人物按世代归类
4. 在info字段包含配偶、事迹等信息
5. 使用birthYear和deathYear分别记录出生和逝世年份（若有）
6. 确保JSON格式有效且可直接导入系统使用
```

3. 将AI生成的JSON复制到`config/family-data.json`文件中
4. 检查并调整生成的数据，确保关系准确、格式正确


这种方式可以快速将非结构化的家族信息转换为系统所需的JSON格式，尤其适合数据量较大的情况。

## 自定义与扩展

- 调整 `config/family-data.json` 中的数据文件更新家族信息
- 编辑 `.env.local` 文件更改配置和验证方式

## 部署

推荐使用 [Vercel 平台](https://vercel.com/new) 部署您的家族谱项目：

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 在 Vercel 上导入您的仓库
3. 设置环境变量
4. 部署

## 相关服务

**[FateMaster.AI](https://www.fatemaster.ai)** - AI八字算命网站，提供智能化命理分析服务。

## 贡献

欢迎提交 Pull Request 或创建 Issue 来改进这个项目。

## 许可

MIT 