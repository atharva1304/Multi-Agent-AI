import logger from '../utils/logger';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: 'official_docs' | 'github' | 'mdn' | 'npm' | 'stackoverflow' | 'other';
  relevance: number;
}

class WebSearchTool {
  private readonly officialDocsSources = [
    'developer.mozilla.org',
    'docs.python.org',
    'nodejs.org',
    'react.dev',
    'nextjs.org',
    'angular.io',
    'vuejs.org',
    'typescriptlang.org',
    'docs.docker.com',
    'kubernetes.io',
    'docs.aws.amazon.com',
    'cloud.google.com',
    'docs.microsoft.com',
    'learn.microsoft.com',
    'docs.github.com',
    'docs.npmjs.com',
    'expressjs.com',
    'prisma.io',
    'postgresql.org',
    'mysql.com',
    'mongodb.com',
    'redis.io',
    'tailwindcss.com',
    'docs.sentry.io',
    'eslint.org',
    'prettier.io',
    'jestjs.io',
    'vitest.dev',
    'playwright.dev',
    'cypress.io',
  ];

  private readonly githubSource = 'github.com';
  private readonly stackoverflowSource = 'stackoverflow.com';
  private readonly npmSource = 'www.npmjs.com';

  /**
   * Generate search URLs based on the query for known documentation sources
   */
  generateSearchUrls(query: string, language?: string): SearchResult[] {
    const results: SearchResult[] = [];
    const encodedQuery = encodeURIComponent(query);
    const encodedLangQuery = language
      ? encodeURIComponent(`${query} ${language}`)
      : encodedQuery;

    // Add official documentation sources
    for (const source of this.officialDocsSources) {
      if (this.isRelevantSource(source, query, language)) {
        results.push({
          title: `Search ${source} for ${query.substring(0, 50)}`,
          url: `https://${source}/search?q=${encodedLangQuery}`,
          snippet: `Refer to official ${source} documentation`,
          source: 'official_docs',
          relevance: 0.9,
        });
      }
    }

    // Add MDN specifically for web technologies
    if (this.isWebRelated(query)) {
      results.push({
        title: `MDN: ${query}`,
        url: `https://developer.mozilla.org/en-US/search?q=${encodedQuery}`,
        snippet: `Mozilla Developer Network documentation for ${query}`,
        source: 'mdn',
        relevance: 0.95,
      });
    }

    // Add GitHub search
    results.push({
      title: `GitHub: ${query}`,
      url: `https://github.com/search?q=${encodedQuery}&type=code`,
      snippet: `Search GitHub repositories for ${query}`,
      source: 'github',
      relevance: 0.85,
    });

    // Add Stack Overflow
    results.push({
      title: `Stack Overflow: ${query}`,
      url: `https://stackoverflow.com/search?q=${encodedQuery}`,
      snippet: `Search Stack Overflow for ${query}`,
      source: 'stackoverflow',
      relevance: 0.88,
    });

    // Add npm search for JavaScript/TypeScript related queries
    if (this.isJSRelated(query)) {
      results.push({
        title: `npm: ${query}`,
        url: `https://www.npmjs.com/search?q=${encodedQuery}`,
        snippet: `Search npm packages for ${query}`,
        source: 'npm',
        relevance: 0.87,
      });
    }

    // Limit to top 10 most relevant results
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  }

  private isRelevantSource(source: string, query: string, language?: string): boolean {
    const queryLower = query.toLowerCase();

    if (source.includes('python') && (queryLower.includes('python') || language === 'python')) {
      return true;
    }
    if (source.includes('nodejs') && (queryLower.includes('node') || language === 'javascript' || language === 'typescript')) {
      return true;
    }
    if (source.includes('react') && (queryLower.includes('react') || language === 'jsx' || language === 'tsx')) {
      return true;
    }
    if (source.includes('typescript') && (queryLower.includes('typescript') || language === 'typescript')) {
      return true;
    }
    if (source.includes('docker') && queryLower.includes('docker')) {
      return true;
    }
    if (source.includes('aws') && (queryLower.includes('aws') || queryLower.includes('s3') || queryLower.includes('lambda'))) {
      return true;
    }
    if (source.includes('postgresql') && (queryLower.includes('postgres') || queryLower.includes('sql'))) {
      return true;
    }
    if (source.includes('prisma') && (queryLower.includes('prisma') || queryLower.includes('orm'))) {
      return true;
    }
    if (source.includes('tailwind') && queryLower.includes('tailwind')) {
      return true;
    }

    return false;
  }

  private isWebRelated(query: string): boolean {
    const webKeywords = [
      'html', 'css', 'javascript', 'js', 'dom', 'web api', 'fetch',
      'promise', 'async', 'await', 'http', 'https', 'websocket',
      'canvas', 'svg', 'localstorage', 'cookies', 'event',
    ];
    const queryLower = query.toLowerCase();
    return webKeywords.some((keyword) => queryLower.includes(keyword));
  }

  private isJSRelated(query: string): boolean {
    const jsKeywords = [
      'javascript', 'typescript', 'node', 'npm', 'package', 'module',
      'react', 'angular', 'vue', 'svelte', 'next', 'nuxt', 'nest',
      'express', 'fastify', 'koa', 'hono', 'bun', 'deno',
    ];
    const queryLower = query.toLowerCase();
    return jsKeywords.some((keyword) => queryLower.includes(keyword));
  }

  /**
   * Format search results as a context string for the LLM
   */
  formatSearchContext(results: SearchResult[]): string {
    if (results.length === 0) {
      return 'No search results available.';
    }

    return results
      .map(
        (result, index) =>
          `[${index + 1}] Source: ${result.source}\nTitle: ${result.title}\nURL: ${result.url}\nSnippet: ${result.snippet}\nRelevance: ${(result.relevance * 100).toFixed(0)}%`
      )
      .join('\n\n');
  }
}

export const webSearchTool = new WebSearchTool();