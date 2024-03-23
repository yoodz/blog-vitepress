import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Afunny",
  description: "A VitePress Site",
  appearance: false,

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
