// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import { customConfigProvider } from "./configProvider";
import ArticleComment from "./components/ArticleComment.vue";
import AWord from "./components/AWord.vue";
import Archive from './components/Archive.vue';
import './style.css'

export default {
  ...DefaultTheme,
  Layout: customConfigProvider(Layout),
  enhanceApp({ app, router, siteData }) {
    app.component("ArticleComment", ArticleComment);
    app.component("Archive", Archive);
    app.component("AWord", AWord);
  }
} satisfies Theme
