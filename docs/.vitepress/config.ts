import { customTokenizer } from './theme/utils/index'
import path from 'path'
import { writeFileSync, readFileSync, readdirSync, existsSync } from 'fs'
import { Feed } from 'feed'
import { defineConfig, createContentLoader, type SiteConfig, transformHead } from 'vitepress'

// 计算中文字数的函数（汉字+标点）
function countChineseWords(text: string): number {
  // 移除 markdown 语法标记
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/`[^`]+`/g, '') // 移除行内代码
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除 markdown 链接，保留文本
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 移除图片
    .replace(/[#*_~`>-]/g, '') // 移除 markdown 符号
    .replace(/\s+/g, ''); // 移除空白字符

  // 统计中文字符（包括汉字和中文标点）
  const chineseChars = cleanText.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g);
  return chineseChars ? chineseChars.length : 0;
}

// 计算英文单词数的函数
function countEnglishWords(text: string): number {
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/[#*_~`>-]/g, '');

  // 统计英文单词
  const englishWords = cleanText.match(/[a-zA-Z]+/g);
  return englishWords ? englishWords.length : 0;
}

// 计算总字数（中文+英文）
function countWords(text: string): { chinese: number; english: number; total: number } {
  const chinese = countChineseWords(text);
  const english = countEnglishWords(text);
  return { chinese, english, total: chinese + english };
}


const hostname: string = 'https://www.afunny.top'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Afunny | 程序员大勇",
  description: "程序员大勇的独立博客，来自上海，程序员，前端工程师，旅行摄影和内容创作者，内容设计互联网，编程，摄影，旅行，生活方式等领域",
  appearance: false,
  head: [
    [
      "meta",
      {
        name: "keywords",
        content:
          "科技,旅行,生活方式,程序员,互联网,自媒体,摄影师,编程,前端,前端工程师,独立博客,Vlog",
      },
    ],
    [
      "meta",
      {
        name: "baidu-site-verification",
        content: "codeva-9LKj1PdHvb",
      },
    ],
    ['link',{rel:'icon',href:'/icon.jpg'}],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://chinese-fonts-cdn.deno.dev/packages/lxgwwenkai/dist/LXGWWenKai-Regular/result.css",
      },
    ],
    // [
    //   "script",
    //   {
    //     defer: "",
    //     src: "https://c.afunny.top:4446/dist/Artalk.js",
    //   },
    // ],
    // [
    //   "script",
    //   {
    //     defer: "",
    //     src: "https://s.afunny.top:4445/script.js",
    //     "data-website-id": "bb19a7b4-aa5b-4b9f-a62a-2cfe4cf07532"
    //   },
    // ],
    [
      "script",
      {
        async: "",
        src: "https://www.googletagmanager.com/gtag/js?id=G-VSBWGKGKS9",
      },
    ],
    [
      "script",
      {},
      "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-VSBWGKGKS9');",
    ],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '归档', link: '/archive' },
      { text: '心动一言', link: '/a-word' },
      { text: '我的项目', link: '/project' },
      { text: '关于', link: '/about-blog' }
    ],

    outline: { // 大纲配置
      level: 'deep', // 展示h2-h6的标题
      label: "本文导览"
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yoodz' }
    ],
    search: {
      provider: 'local',
      options: {
        _render(src, env, md) {
          const html = md.render(src, env)
          if (env.frontmatter?.title)
            return md.render(`# ${env.frontmatter.title}`) + html
          return html
        },
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                displayDetails: '显示详细信息',
                resetButtonTitle: '清除查询条件',
                backButtonTitle: '返回搜索结果',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: 'enter',
                  navigateText: '切换',
                  navigateUpKeyAriaLabel: 'up arrow',
                  navigateDownKeyAriaLabel: 'down arrow',
                  closeText: '关闭',
                  closeKeyAriaLabel: 'escape'
                }
              }
            }
          }
        },

        miniSearch: {
          options: {
            tokenize: customTokenizer // 使用自定义分词器
          },
          searchOptions: {

          },
        },
      },
      // provider: 'algolia',
      // options: {
      //   appId: '6YIA30YW3V',
      //   apiKey: '455f6d870f6e5d0185c02e106333bd54',
      //   indexName: 'afunny',
      //   locales: {
      //     zh: {
      //       placeholder: '搜索文档',
      //       translations: {
      //         button: {
      //           buttonText: '搜索文档',
      //           buttonAriaLabel: '搜索文档'
      //         },
      //         modal: {
      //           searchBox: {
      //             resetButtonTitle: '清除查询条件',
      //             resetButtonAriaLabel: '清除查询条件',
      //             cancelButtonText: '取消',
      //             cancelButtonAriaLabel: '取消'
      //           },
      //           startScreen: {
      //             recentSearchesTitle: '搜索历史',
      //             noRecentSearchesText: '没有搜索历史',
      //             saveRecentSearchButtonTitle: '保存至搜索历史',
      //             removeRecentSearchButtonTitle: '从搜索历史中移除',
      //             favoriteSearchesTitle: '收藏',
      //             removeFavoriteSearchButtonTitle: '从收藏中移除'
      //           },
      //           errorScreen: {
      //             titleText: '无法获取结果',
      //             helpText: '你可能需要检查你的网络连接'
      //           },
      //           footer: {
      //             selectText: '选择',
      //             navigateText: '切换',
      //             closeText: '关闭',
      //             searchByText: '搜索提供者'
      //           },
      //           noResultsScreen: {
      //             noResultsText: '无法找到相关结果',
      //             suggestedQueryText: '你可以尝试查询',
      //             reportMissingResultsText: '你认为该查询应该有结果？',
      //             reportMissingResultsLinkText: '点击反馈'
      //           }
      //         }
      //       }
      //     }
      //   }
      // }
    },
    footer: {
      message: '本网站由<a href="https://www.upyun.com/?utm_source=lianmeng&utm_medium=referral" target="__blank"><img style="display: inline;width: 40px;transform: translateY(-1px);" src="https://upyun.afunny.top/202409202028300.webp" /></a>提供CDN加速/存储服务<a href="https://www.afunny.top/feed.xml" style="text-decoration:none;" target="__blank">｜RSS</a>',
      // copyright: 'Copyright © 2019-present Evan You'
    }
  },
  cleanUrls: true,
  lang: "zh-CN",
  sitemap: {
    hostname: 'https://www.afunny.top'
  },
  markdown: {
    lineNumbers: true,
    // image: {
    //   // 默认禁用图片懒加载
    //   lazyLoading: true
    // },
  },
  vite: {
    // publicDir 默认就是 'public'，相对于 docs 目录
    // 如果需要自定义，可以设置为相对于 docs 目录的路径
    server: {
      fs: {
        // 允许访问项目根目录
        allow: ['..']
      }
    }
  },
  buildEnd: async (config: SiteConfig) => {
    const feed = new Feed({
      title: '程序员大勇',
      description: '程序员大勇的独立博客，来自上海，程序员，前端工程师，旅行摄影和内容创作者，内容设计互联网，编程，摄影，旅行，生活方式等领域',
      id: hostname,
      link: hostname,
      language: 'zh',
      image: 'https://upyun.afunny.top/202411062304650.jpg',
      favicon: `${hostname}/favicon.ico`,
      copyright: 'Copyright (c) 2023-present, dayong'
    })

    // You might need to adjust this if your Markdown files
    // are located in a subfolder
    const posts = (await createContentLoader('*.md', {
      excerpt: true,
      render: true
    }).load()).filter(item => item.frontmatter.title && !item.frontmatter.hide)

    posts.sort(
      (a, b) =>
        +new Date(b.frontmatter.date as string) -
        +new Date(a.frontmatter.date as string)
    )

    console.log(posts.map(item => `${item.frontmatter.date}-${item.frontmatter.title}`), 'config-222')

    // 计算字数统计并写入 JSON 文件
    const wordCountMap: Record<string, { words: number; readingTime: number }> = {}

    for (const post of posts) {
      // 读取原始 markdown 文件
      const filePath = path.join(config.srcDir, post.url.replace(/\/$/, '') + '.md')
      try {
        const rawContent = readFileSync(filePath, 'utf-8')
        const wordCount = countWords(rawContent)
        // 使用多种可能的路径格式作为 key
        const urlKey = post.url.replace(/\.html$/, '')
        wordCountMap[urlKey] = {
          words: wordCount.total,
          readingTime: Math.ceil(wordCount.total / 400)
        }
        // 也保存带 .html 后缀的版本
        if (!urlKey.endsWith('.html')) {
          wordCountMap[urlKey + '.html'] = wordCountMap[urlKey]
        }
        // 也保存带斜杠的版本（对于首页等）
        if (urlKey && !urlKey.endsWith('/')) {
          wordCountMap[urlKey + '/'] = wordCountMap[urlKey]
        }
        console.log(`字数统计: ${urlKey} = ${wordCount.total} 字`)
      } catch (error) {
        console.warn(`无法读取文件: ${filePath}`, error)
      }
    }

    console.log('字数统计映射表:', wordCountMap)

    // 只写入输出目录，build 时输出目录肯定存在
    writeFileSync(
      path.join(config.outDir, 'word-count.json'),
      JSON.stringify(wordCountMap, null, 2),
      { encoding: 'utf-8' }
    )

    console.log('字数统计文件已生成到输出目录')
  
    for (const { url, excerpt, frontmatter, html } of posts) {
      if (frontmatter?.hide) continue
      feed.addItem({
        title: frontmatter.title,
        id: `${hostname}${url}`,
        link: `${hostname}${url}`,
        description: frontmatter?.description,
        // content: html,
        author: [
          {
            name: 'dayong',
            email: 'developer.vip@outlook.com',
            link: 'https://www.afunny.top/about-blog'
          }
        ],
        date: new Date(frontmatter?.date)
      })
    }
  
    writeFileSync(path.join(config.outDir, 'feed.xml'), feed.rss2(), { encoding: 'utf-8' })
  }
})
