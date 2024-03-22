// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import { customConfigProvider } from "./configProvider";
import ArticleComment from "./components/ArticleComment.vue";

import './style.css'

export default {
  // extends: DefaultTheme,
  ...DefaultTheme,
  // Layout: () => {
  //   return h(DefaultTheme.Layout, null, {
  //     // https://vitepress.dev/guide/extending-default-theme#layout-slots
  //   })
  // },
  Layout: customConfigProvider(Layout),
  enhanceApp({ app, router, siteData }) {
    app.component("ArticleComment", ArticleComment);

    // ...
  }
} satisfies Theme
