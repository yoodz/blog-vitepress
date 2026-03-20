<!-- 首页导航栏 -->
<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useData, withBase, useRoute, useRouter } from "vitepress";
import { useBrowserLocation } from "@vueuse/core";
import { data } from "../posts.data.js";
import { useCurrentCategoryKey, useCurrentPageKey } from "../configProvider";
import { categoryMap } from "../constant";
import { reInitPv } from '../utils/index.js'

const route = useRoute();
const router = useRouter();
const location = useBrowserLocation();

const pageKey = useCurrentPageKey();
const currentCategory = useCurrentCategoryKey();

// 客户端就绪标志
const isClient = ref(false);

const categoriesMeta = computed(() => {
  const categoryCounts: Record<string, number> = {};

  for (const post of data) {
    const categories = Array.isArray(post.categories)
      ? post.categories
      : (post.categories ? [post.categories] : []);

    for (const category of categories) {
      if (!categoryCounts[category]) {
        categoryCounts[category] = 0;
      }
      categoryCounts[category]++;
    }
  }

  return categoryMap
    .map((categoryDetail) => {
      return {
        name: categoryDetail.name,
        text: categoryDetail.text,
        count: categoryCounts[categoryDetail.text] || 0,
        isHome: categoryDetail.isHome,
      };
    })
    .filter((category) => category.isHome);
});

// 当前选中的分类（用于样式）
const activeCategory = computed(() => {
  if (!isClient.value) return null;
  return currentCategory.value;
});

// 判断"最新"是否激活
const isHomeActive = computed(() => {
  if (!isClient.value) return false;
  return !currentCategory.value;
});

function getCategoryDetail(text: string) {
  const category = categoryMap.find((cat) => cat.text === text);
  if (category) {
    return category;
  } else {
    return {
      text,
      name: text,
      isHome: false,
    };
  }
}

const goHome = () => {
  currentCategory.value = null;
  pageKey.value = 1;
  router.go('/');
  reInitPv()
};

const goHot = () => {
  currentCategory.value = "hot";
  pageKey.value = 1;
  router.go('/?category=hot');
  reInitPv()
};

const goCategory = (category: string) => {
  currentCategory.value = category;
  pageKey.value = 1;
  router.go(`/?category=${category}&page=1`);
  reInitPv()
};

// 从 URL 初始化 category
const initFromUrl = () => {
  if (typeof window === 'undefined') return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  const page = urlParams.get('page');
  
  currentCategory.value = category || null;
  pageKey.value = page ? parseInt(page) : 1;
  
  isClient.value = true;
};

// 监听路由变化
watch(
  () => route?.query?.category,
  (newCategory) => {
    if (isClient.value && newCategory !== undefined) {
      currentCategory.value = newCategory as string || null;
    }
  }
);

onMounted(() => {
  initFromUrl();
});
</script>

<template>
  <div class="px=1 md:px-4 md:px-0 max-w-7xl mx-auto">
    <div class="w-full px-4 mt-3 ld:h-40">
        <div class="flex items-center justify-between w-full">
          <div class="flex m-auto overflow-x-auto scrollbar-hide snap-x pb-2">
            <a
              @click="goHome()"
              :class="{
                'text-rose-400 dark:text-rose-400': isHomeActive,
                'text-black dark:text-slate-300': !isHomeActive,
              }"
              class="relative flex-shrink-0 px-3 py-1 ml-0 mr-0 cursor-pointer text-sm text-center home-nav-title hover:text-rose-400 rounded-xl md:text-base md:ml-1 md:mr-2"
            >
              最新<i class="hidden ml-3 md:inline-block text-slate-300">/</i>
            </a>

            <a
              v-for="category in categoriesMeta"
              :key="category.text"
              @click="goCategory(category.text)"
              class="inline-block flex-shrink-0 cursor-pointer px-3 py-1 ml-0 mr-0 text-sm text-center home-nav-title hover:text-rose-400 rounded-xl md:px-3 md:text-base md:ml-1 md:mr-2"
              :class="{
                'text-rose-400': activeCategory === category.text,
              }"
            >
              {{ category.name }}
              <i class="hidden ml-3 md:inline-block text-slate-300">/</i>
            </a>
          </div>
        </div>
    </div>
  </div>
</template>
