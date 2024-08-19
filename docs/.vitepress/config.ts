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
    ],    [
      "meta",
      {
        name: "baidu-site-verification",
        content: "codeva-9LKj1PdHvb",
      },
    ],
    [
      "script",
      {
        defer: "",
        src: "https://s.afunny.top:4445/script.js",
        "data-website-id": "bb19a7b4-aa5b-4b9f-a62a-2cfe4cf07532"
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
      { text: '关于', link: '/about-blog' }
    ],

    outlineTitle: '本文导览',
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
        miniSearch: {
          searchOptions: {
   
          }
        },
      },
 
    }
  },
  cleanUrls: true,
  sitemap: {
    hostname: 'https://www.afunny.top'
  }
})
