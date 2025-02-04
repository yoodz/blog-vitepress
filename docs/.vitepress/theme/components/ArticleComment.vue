<script setup lang="ts">
import { nextTick, onMounted } from "vue";

onMounted(async () => {
  await nextTick();
  import("twikoo").then((Twikoo) => {
    Twikoo.init({
      envId: "https://commentdata.netlify.app/.netlify/functions/twikoo", // 腾讯云环境填 envId；Vercel 环境填地址（https://xxx.vercel.app）
      el: "#tcomment", // 容器元素
    });
  });
});
</script>


<template>
  <div id="tcomment" style="margin-top: 20px"></div>
</template>

<style></style>
