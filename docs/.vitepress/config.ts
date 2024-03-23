import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Afunny",
  description: "afunny.top",
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
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      // { text: 'Examples', link: '/markdown-examples' }
    ],

    outlineTitle: '本文导览',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yoodz' }
    ]
  }
})
