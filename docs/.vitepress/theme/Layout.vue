<script setup lang="ts">
import { onMounted, nextTick, watch, ref } from "vue";
import DefaultTheme from "vitepress/theme";
import mediumZoom from "medium-zoom";
import { useData, useRouter } from "vitepress";

import ArticleList from "./components/ArticleList.vue";
import ArticleMeta from "./components/ArticleMeta.vue";
import OutDateTip from './components/OutDateTip.vue'
import ArticleComment from "./components/ArticleComment.vue";
import CategoryNav from "./components/CategoryNav.vue";
import SvgIcon from "./components/SvgIcon.vue";
const { Layout } = DefaultTheme;

let router: any = null;
try {
  router = useRouter();
} catch (error) {
  console.warn('[Router] useRouter 不可用:', error);
}

const initImagesZoom = () => {
  mediumZoom(".main img", {
    background: "var(--vp-image-bg)",
  });
};

// 注册 Service Worker
const registerServiceWorker = () => {
  // 检查浏览器是否支持 Service Worker
  if (!('serviceWorker' in navigator)) {
    console.warn('[Service Worker] 浏览器不支持 Service Worker');
    return;
  }

  // 检查是否在 HTTPS 或 localhost 环境下
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    console.warn('[Service Worker] Service Worker 只能在 HTTPS 或 localhost 环境下运行');
    return;
  }

  // 使用 nextTick 确保 DOM 已加载
  // nextTick(() => {
  //   // 如果页面已经加载完成，直接注册；否则等待 load 事件
  //   if (document.readyState === 'complete') {
  //     doRegister();
  //   } else {
  //     window.addEventListener('load', doRegister);
  //   }
  // });

  async function doRegister() {
    const swPath = '/sw.js';
    console.log('[Service Worker] 开始注册:', swPath);
    console.log('[Service Worker] 当前页面 URL:', window.location.href);

    // 先检查 service worker 文件是否可以访问
    try {
      const response = await fetch(swPath, { method: 'HEAD' });
      if (!response.ok) {
        console.warn('[Service Worker] 文件不存在或无法访问:', swPath, '状态码:', response.status);
        return;
      }
      console.log('[Service Worker] 文件检查通过，可以访问');
    } catch (error) {
      console.error('[Service Worker] 文件检查失败:', error);
      console.error('[Service Worker] 请确保 sw.js 文件存在于 docs/public/ 目录下');
      return;
    }

    navigator.serviceWorker
      .register(swPath, {
        scope: '/',
        updateViaCache: 'none' // 开发模式下不缓存 service worker 文件本身
      })
      .then((registration) => {
        console.log('[Service Worker] 注册成功:', registration.scope);
        console.log('[Service Worker] 注册状态:', registration.active ? '已激活' : '等待激活');
        console.log('[Service Worker] 当前控制器:', navigator.serviceWorker.controller ? '已控制' : '未控制');

        // 检查是否有新的 service worker 等待激活
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            console.log('[Service Worker] 发现新版本，正在安装...');
            newWorker.addEventListener('statechange', () => {
              console.log('[Service Worker] 状态变化:', newWorker.state);
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 新的 service worker 已安装，可以提示用户刷新页面
                console.log('[Service Worker] 新版本已安装，请刷新页面');
              }
            });
          }
        });

        // 定期检查更新（每小时检查一次）
        // 注意：避免在路由变化时频繁检查，这会导致 SW 重启
        if (!window.__swUpdateCheckStarted) {
          window.__swUpdateCheckStarted = true;
          setInterval(() => {
            registration.update().catch(err => {
              console.warn('[Service Worker] 检查更新失败:', err);
            });
          }, 60 * 60 * 1000);
        }
      })
      .catch((error) => {
        console.error('[Service Worker] 注册失败:', error);
        console.error('[Service Worker] 错误详情:', {
          message: error.message,
          stack: error.stack,
          swPath: swPath,
          location: window.location.href
        });
        console.error('[Service Worker] 调试提示:');
        console.error('1. 确保 sw.js 文件存在于 docs/public/ 目录');
        console.error('2. 确保在 localhost 或 HTTPS 环境下运行');
        console.error('3. 检查浏览器控制台是否有其他错误');
      });

    // 监听 service worker 更新
    // 注意：只在第一次加载时注册一次 controllerchange 监听，避免重复刷新
    if (!window.__swRefreshRegistered) {
      window.__swRefreshRegistered = true;
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('[Service Worker] 新版本已激活，正在刷新页面...');
          // 只在生产环境自动刷新，开发环境手动刷新
          if (import.meta.env.PROD) {
            window.location.reload();
          }
        }
      });
    }

    // 监听 service worker 错误
    navigator.serviceWorker.addEventListener('error', (event) => {
      console.error('[Service Worker] 运行时错误:', event);
    });
  }
};

onMounted(() => {
  initImagesZoom();
  // registerServiceWorker();
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
      <OutDateTip />
    </template>
    <template #doc-bottom> </template>

      
      <!-- <template #aside-outline-before>我在详情页面大纲的上面</template>
      <template #aside-outline-after>我在详情页面大纲的下面</template> -->

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
    <template #aside-bottom>
      <!-- 这里可以添加返回顶部的按钮 -->
    </template>
  </Layout>
</template>