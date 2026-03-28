<script setup lang="ts">
import { onMounted, nextTick, watch, ref } from "vue";
import DefaultTheme from "vitepress/theme";
import mediumZoom from "medium-zoom";
import { useRouter } from "vitepress";

import ArticleList from "./components/ArticleList.vue";
import ArticleMeta from "./components/ArticleMeta.vue";
import CategoryNav from "./components/CategoryNav.vue";
import SvgIcon from "./components/SvgIcon.vue";
const { Layout } = DefaultTheme;

declare global {
  interface Window {
    __swUpdateCheckStarted?: boolean;
    __swRefreshRegistered?: boolean;
  }
}

let router: any = null;
try {
  router = useRouter();
} catch {
  // ignore
}

const initImagesZoom = () => {
  mediumZoom(".main img:not(.pswp-gallery img)", {
    background: "var(--vp-image-bg)",
  });
};

// 返回顶部功能
const showBackToTop = ref(false);
const scrollToTop = () => {
  if (typeof window !== "undefined") {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
};

const handleScroll = () => {
  if (typeof window !== "undefined") {
    showBackToTop.value = window.scrollY > 300;
  }
};

// 注册 Service Worker
const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    return;
  }

  nextTick(() => {
    if (document.readyState === 'complete') {
      doRegister();
    } else {
      window.addEventListener('load', doRegister);
    }
  });

  async function doRegister() {
    const swPath = '/sw.js';

    try {
      const response = await fetch(swPath, { method: 'HEAD' });
      if (!response.ok) {
        return;
      }
    } catch (error) {
      return;
    }

    navigator.serviceWorker
      .register(swPath, {
        scope: '/',
        updateViaCache: 'none'
      })
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // @ts-ignore
                if (import.meta.env.PROD) {
                  window.location.reload();
                }
              }
            });
          }
        });

        if (!window.__swUpdateCheckStarted) {
          window.__swUpdateCheckStarted = true;
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        }
      })
      .catch(() => {});

    if (!window.__swRefreshRegistered) {
      window.__swRefreshRegistered = true;
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          // @ts-ignore
          if (import.meta.env.PROD) {
            window.location.reload();
          }
        }
      });
    }

    navigator.serviceWorker.addEventListener('error', () => {});
  }
};

onMounted(() => {
  initImagesZoom();
  registerServiceWorker();
  
  // 监听滚动事件，控制返回顶部按钮显示
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // 初始检查
});

if (router) {
  watch(router.route, () => {
    nextTick(() => {
      initImagesZoom();
    });
  });
}
</script>

<template>
  <Layout>
    <template #nav-bar-title-after>
      <SvgIcon />
    </template>
    <template #doc-before>
      <ArticleMeta />
    </template>
    <template #doc-bottom> </template>
    <template #home-hero-before>
      <CategoryNav />
    </template>
    <template #home-hero-after>
      <!-- 首页文章列表模块 -->
      <ArticleList />
    </template>
    <template #layout-bottom>
      <!-- 返回顶部按钮 -->
      <ClientOnly>
        <button
          @click="scrollToTop"
          v-show="showBackToTop"
          class="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 transition-all duration-300 hover:scale-110"
          aria-label="返回顶部"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
          </svg>
        </button>
      </ClientOnly>
    </template>
  </Layout>
</template>