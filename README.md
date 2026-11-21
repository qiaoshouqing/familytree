# Family Tree

English | [中文](./README.zh.md)

A family tree visualization project built with [Next.js](https://nextjs.org) for displaying and managing your family history and member relationships.

## Demo Website

You can visit [https://familytree.pomodiary.com/](https://familytree.pomodiary.com/) to see an online demonstration of this project.

## Features

- Visual representation of multiple generations of family members
- Relationship connections between family members
- Detailed personal information records
- Optional login authentication mechanism
- English and Chinese interface (picked from the browser language, switchable on the page)
- Fully customizable interface and data

## Quick Start

### Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Configure the Project

1. Copy the environment variable template and configure it:

```bash
cp .env.local.example .env.local
```

2. Set your configurations in the `.env.local` file:

```
# Whether login authentication is required (true/false)
NEXT_PUBLIC_REQUIRE_AUTH=false

# Authentication mode (all: allow all family members, specific: only allow specific names)
AUTH_MODE=specific
# Specific user login name
SPECIFIC_NAME=白景琦

# Surname configuration (for website title, description, and footer)
NEXT_PUBLIC_FAMILY_NAME=白
# Surname for the English interface, e.g. "The Bai Family Tree" (falls back to NEXT_PUBLIC_FAMILY_NAME)
NEXT_PUBLIC_FAMILY_NAME_EN=Bai

# Application port configuration
PORT=3000
```

### Add Family Data

1. Create your family data file `family-data.json` in the `config` directory, you can refer to `family-data.example.json` or `family-data.json`.

2. Add your family member information in the following format:

```json
{
  "generations": [
    {
      "title": "First Generation",
      "people": [
        {
          "id": "person-id",
          "name": "Name",
          "info": "Person description",
          "fatherId": "Father's ID",
          "birthYear": 1900,
          "deathYear": 1980
        }
      ]
    }
  ]
}
```

Field descriptions:
- `id`: Unique identifier for each person, used to establish relationships
- `name`: Name
- `info`: Personal description, life summary, etc.
- `fatherId`: Father's ID, used to establish generational relationships
- `birthYear`: Birth year (optional)
- `deathYear`: Death year (optional)

### Run the Project

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Visit [http://localhost:3000](http://localhost:3000) to view your family tree.

## Languages

The interface is available in English and Chinese.

- On the first visit the site follows the browser language (`Accept-Language`): Chinese browsers get Chinese, everything else gets English.
- The **English / 中文** button (top of the page and on the login screen) switches the language. The choice is saved in a `lang` cookie for a year, so the page title, `<html lang>` and meta description match it on the next visit.
- In the English interface the title reads "The {surname} Family Tree". Set `NEXT_PUBLIC_FAMILY_NAME_EN` for the English surname; if it is empty, `NEXT_PUBLIC_FAMILY_NAME` is used.
- Only the interface is translated. Names, generation titles and descriptions are shown exactly as written in `config/family-data.json`, so to run an English family tree just write your family in English there, for example:

```json
{
  "generations": [
    {
      "title": "First Generation",
      "people": [
        { "id": "thomas", "name": "Thomas Hartwell", "info": "Carpenter, moved to Ohio in 1902", "birthYear": 1880, "deathYear": 1951 }
      ]
    },
    {
      "title": "Second Generation",
      "people": [
        { "id": "walter", "name": "Walter Hartwell", "info": "Eldest son", "fatherId": "thomas", "birthYear": 1905 }
      ]
    }
  ]
}
```

With login enabled, the login name is matched against the `name` field (or `SPECIFIC_NAME`), so with English data people log in with English names.

- UI strings live in `src/i18n/messages.ts`. To add another language, add a dictionary there and extend `pickLocale`.

## Data Format Details

Family data is stored in JSON format, organized by generations:

- Each generation has a title and a group of people
- Each person includes ID, name, information, and father's ID
- Parent-child relationships are established through `fatherId`
- You can add spouse, children, and other important information in the info field

Example:
```json
{
  "generations": [
    {
      "title": "First Generation",
      "people": [
        {
          "id": "ancestor",
          "name": "Ancestor",
          "info": "Family founder, born in 1850",
          "birthYear": 1850
        }
      ]
    },
    {
      "title": "Second Generation",
      "people": [
        {
          "id": "second-gen-1",
          "name": "First Son",
          "info": "Born in 1880, wife Wang",
          "fatherId": "ancestor",
          "birthYear": 1880,
          "deathYear": 1950
        },
        {
          "id": "second-gen-2",
          "name": "Second Son",
          "info": "Born in 1885, wife Li",
          "fatherId": "ancestor",
          "birthYear": 1885,
          "deathYear": 1960
        }
      ]
    }
  ]
}
```

## Using AI to Generate Family Data

If you have a large amount of family data to organize, you can use AI to help you quickly generate JSON data in the correct format:

1. Prepare your family information text, including names, relationships, and relevant information for each generation
2. Provide the following format guide to AI (such as DeepSeek, ChatGPT, Claude, etc.):

```
Please organize the family information I provide into the following JSON format:
{
  "generations": [
    {
      "title": "Xth Generation",
      "people": [
        {
          "id": "unique-identifier",
          "name": "Name",
          "info": "Detailed information",
          "fatherId": "Father's ID",
          "birthYear": birth year,
          "deathYear": death year
        }
      ]
    }
  ]
}

Requirements:
1. Generate a unique id for each person (such as first-gen-1, second-gen-2, etc.)
2. Correctly set fatherId to establish parent-child relationships
3. Categorize people by generation
4. Include spouse, achievements, etc. in the info field
5. Use birthYear and deathYear to record birth and death years (if available)
6. Ensure the JSON format is valid and can be directly imported into the system
```

3. Copy the AI-generated JSON to the `config/family-data.json` file
4. Check and adjust the generated data to ensure relationships are accurate and the format is correct

This method can quickly convert unstructured family information into the JSON format required by the system, particularly suitable for large amounts of data.

## Customization and Extension

- Adjust the data file in `config/family-data.json` to update family information
- Edit the `.env.local` file to change configuration and authentication methods

## Deployment

It is recommended to deploy your family tree project using the [Vercel platform](https://vercel.com/new):

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository on Vercel
3. Set environment variables
4. Deploy

## Related Services

**[FateMaster.AI](https://www.fatemaster.ai)** - AI Chinese astrology website, providing intelligent fortune analysis services.

## Contribution

Pull Requests and Issues are welcome to improve this project.

## License

MIT
