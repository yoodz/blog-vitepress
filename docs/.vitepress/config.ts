import { defineConfig } from 'vitepress'

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
        name: "description",
        content:
          "",
      },
    ],
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
    ],

    outlineTitle: '本文导览',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yoodz' }
    ]
  },
  cleanUrls: true,
  sitemap: {
    hostname: 'https://afunny.top'
  }
})
