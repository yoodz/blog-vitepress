<!-- 详情页的评论模块 -->
<script setup lang="ts">
import { nextTick, onMounted } from "vue";

onMounted(async () => {
  await nextTick();
  import("artalk").then((Artalk) => {
    Artalk.init({
      el: '#Comments',                // 绑定元素的 Selector
      // pageKey:   '/post/1',                  // 固定链接
      // pageTitle: '关于引入 Artalk 的这档子事',  // 页面标题 (留空自动获取)
      server: 'https://c.afunny.top:4446',  // 后端地址
      site: 'Afunny 的博客',             // 你的站点名
    })
  });
});
</script>


<template>
  <div id="Comments"></div>
</template>

<style></style>
