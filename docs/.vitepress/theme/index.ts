// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import { customConfigProvider } from "./configProvider";
import AWord from "./components/AWord.vue";
import Archive from './components/Archive.vue';
import ImageGallery from './components/ImageGallery.vue';
import ShuoShuo from './components/ShuoShuo.vue';
import './style.css'

export default {
  ...DefaultTheme,
  Layout: customConfigProvider(Layout),
  enhanceApp({ app, router, siteData }) {
    app.component("Archive", Archive);
    app.component("AWord", AWord);
    app.component("ImageGallery", ImageGallery);
    app.component("ShuoShuo", ShuoShuo);
  }
} satisfies Theme
