import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Resolve content directory - go up from redesign/lib to chess-app/src/content/news
// Try multiple paths for robustness (dev vs build)
const possiblePaths = [
  path.join(process.cwd(), 'src/content/news'),          // if cwd is chess-app root
  path.join(process.cwd(), '../content/news'),            // if cwd is src/redesign
  path.resolve(__dirname, '../../content/news'),          // relative from this file's dir
  path.resolve(__dirname, '../../../src/content/news'),   // another level up
];

const contentDirectory = possiblePaths.find(p => {
  try { return fs.existsSync(p); } catch { return false; }
}) || possiblePaths[0];

export interface ArticleMetadata {
    id: string;
    title: string;
    date: string;
    excerpt: string;
    tags?: string[];
    heroFen?: string;
    thumbnail?: string;
    category?: 'updates' | 'world' | 'legends';
    slug: string;
}

export interface Article extends ArticleMetadata {
    content: string;
}

export function getAllArticles(): ArticleMetadata[] {
    // Ensure directory exists
    if (!fs.existsSync(contentDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(contentDirectory);
    const allArticlesData = fileNames.map((fileName) => {
        // Remove ".mdx" from file name to get id
        const slug = fileName.replace(/\.mdx$/, '');

        // Read markdown file as string
        const fullPath = path.join(contentDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);

        // Combine the data with the id
        return {
            slug,
            id: slug,
            ...matterResult.data,
        } as ArticleMetadata;
    });

    // Sort articles by date
    return allArticlesData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

export function getArticleBySlug(slug: string): Article | null {
    try {
        const fullPath = path.join(contentDirectory, `${slug}.mdx`);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);

        return {
            slug,
            id: slug,
            content: matterResult.content,
            ...matterResult.data,
        } as Article;
    } catch (err) {
        return null;
    }
}
