import { defineConfig } from 'vitepress'
import { customTokenizer } from './theme/utils/index'

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
    // [
    //   "link",
    //   {
    //     rel: "stylesheet",
    //     href: "https://c.afunny.top:4446/dist/Artalk.css",
    //   },
    // ],
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
      message: '本网站由<a href="https://www.upyun.com/?utm_source=lianmeng&utm_medium=referral" target="__blank"><img style="display: inline;width: 40px;transform: translateY(-1px);" src="https://upyun.afunny.top/202409202028300.webp" /></a>提供CDN加速/存储服务',
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
  }
})
