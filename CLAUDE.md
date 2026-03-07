# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with VitePress, hosted on Cloudflare Pages. The blog features a custom theme with TailwindCSS styling, article categorization, word count statistics, and RSS feed generation.

## Development Commands

```bash
# Start development server (runs word count generation first)
npm run dev

# Build for production (runs word count generation first)
npm run build

# Preview production build
npm run preview

# Generate word count statistics only
npm run generate-word-count
```

The development and build commands automatically run `generate-word-count.js` before starting VitePress.

## Project Structure

```
blog-vitepress/
├── docs/                          # VitePress docs directory
│   ├── .vitepress/
│   │   ├── config.ts              # VitePress configuration
│   │   ├── theme/                 # Custom theme
│   │   │   ├── index.ts           # Theme entry point, registers components
│   │   │   ├── Layout.vue         # Main layout wrapper
│   │   │   ├── style.css          # Global styles with Tailwind
│   │   │   ├── constant.ts        # Category mappings (categoryMap)
│   │   │   ├── posts.data.ts      # VitePress data loader for articles
│   │   │   ├── components/        # Vue components
│   │   │   ├── utils/             # Utility functions
│   │   │   └── interface/         # TypeScript interfaces
│   │   ├── public/                # Static assets (served at /)
│   │   │   └── word-count.json    # Generated word count statistics
│   │   └── dist/                  # Build output
│   ├── public/                    # Additional static assets
│   └── *.md                       # Blog posts and pages
├── scripts/
│   └── generate-word-count.js     # Word count generation script
├── postcss.config.js              # PostCSS with Tailwind
└── tailwind.config.js             # Tailwind configuration
```

## VitePress Configuration

- **Config file**: [docs/.vitepress/config.ts](docs/.vitepress/config.ts)
- **Build hook**: `buildEnd` generates RSS feed and word count statistics
- **Search**: Uses local search with custom Chinese tokenizer via `Intl.Segmenter`
- **Markdown**: Line numbers enabled, lazy loading available

## Custom Theme Architecture

### Theme Entry Point
- [docs/.vitepress/theme/index.ts](docs/.vitepress/theme/index.ts) extends VitePress default theme
- Components are registered globally via `enhanceApp()`
- Custom config provider wraps the Layout

### Layout Structure
[Layout.vue](docs/.vitepress/theme/Layout.vue) uses VitePress slot system:
- `#nav-bar-title-after`: Adds animated logo
- `#doc-before`: Article metadata and outdated tip
- `#doc-after`: Comment section (Twikoo)
- `#home-hero-before`: Category navigation
- `#home-hero-after`: Article list

### Key Components
- **ArticleList**: Renders article cards on homepage
- **ArticleCard**: Individual article card component
- **ArticleMeta**: Shows date, word count, reading time
- **Archive**: Archive page with yearly grouping
- **AWord**: "A Word" feature - short thoughts/quotes
- **CategoryNav**: Category filter navigation

## Article Frontmatter

Blog posts use this frontmatter structure:

```yaml
---
title: Article Title
date: 2024-03-23
cover: https://example.com/cover.jpg
categories: [code, jdi]
hide: false  # Set to true to exclude from feed/word-count
layout: home  # Optional: for special pages
---
```

Categories must match keys in `categoryMap` from [constant.ts](docs/.vitepress/theme/constant.ts):
- `hot` (热门)
- `jdi` (折腾)
- `code` (编程)
- `photography` (摄影)
- `travel` (旅行)
- `lifestyle` (生活)
- `run` (跑步)

## Data Loading

[posts.data.ts](docs/.vitepress/theme/posts.data.ts) uses VitePress's `createContentLoader` to:
- Load all `*.md` files from docs root
- Filter out posts with `hide: true`
- Transform frontmatter into structured data
- Sort by date (newest first)
- Exports `data` array and `categoriesMeta` for categories

## Word Count Generation

The word count system has two parts:

1. **[scripts/generate-word-count.js](scripts/generate-word-count.js)**: Dev-time script that scans docs and outputs to `docs/public/word-count.json`

2. **[config.ts buildEnd hook](docs/.vitepress/config.ts)**: Build-time generation that also creates the word count map and outputs to `dist/word-count.json`

Both count Chinese characters (using Unicode ranges) and English words separately.

## Styling

- **TailwindCSS**: Used via PostCSS with `@tailwindcss/nesting`
- **Custom CSS**: [style.css](docs/.vitepress/theme/style.css) defines CSS variables for VitePress components
- **Scoping**: Vue components use scoped styles for CSS uniqueness
- **Font**: Uses LXGW WenKai (霞鹜文楷) web font for Chinese text

## Utilities

Key utilities in [utils/index.ts](docs/.vitepress/theme/utils/index.ts):
- `formatDate()`: Date formatting
- `formatShowDate()`: Relative date display ("今天", "3天前", etc.)
- `classifyByYear()`: Groups articles by year for archive
- `customTokenizer()`: Chinese word segmentation for search using `Intl.Segmenter`
- `isApproximatelySixMonthsAgo()`: Shows outdated content warning

## Build Output

- Static files generated to `docs/.vitepress/dist/`
- RSS feed: `dist/feed.xml`
- Word count: `dist/word-count.json`
- Sitemap automatically generated by VitePress
