<script setup lang="ts">
import { onMounted, nextTick, watch } from "vue";
import DefaultTheme from "vitepress/theme";
import mediumZoom from "medium-zoom";
import { useData, useRouter } from "vitepress";

import ArticleList from "./components/ArticleList.vue";
import ArticleMeta from "./components/ArticleMeta.vue";
import ArticleComment from "./components/ArticleComment.vue";
import CategoryNav from "./components/CategoryNav.vue";
const { Layout } = DefaultTheme;
const router = useRouter();

const initImagesZoom = () => {
  mediumZoom(".main img", {
    background: "var(--vp-image-bg)",
  });
};

onMounted(() => {
  initImagesZoom();
});

watch(router.route, () => {
    nextTick(() => {
      initImagesZoom();
    });
  });
</script>

<template>
  <Layout>
    <template #doc-before>
      <ArticleMeta />
    </template>
    <template #doc-bottom> </template>

    <template #aside-outline-before> </template>

    <template #doc-after>
      <!-- 评论模块 -->
      <ClientOnly>
        <ArticleComment />
      </ClientOnly>
    </template>
    <template #home-hero-before>
      <CategoryNav />
    </template>
    <template #home-hero-after>
      <!-- 首页文章列表模块 -->
      <ArticleList />
    </template>
  </Layout>
</template>