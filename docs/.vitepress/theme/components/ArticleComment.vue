<script setup lang="ts">
import Twikoo from "twikoo";
import { watch, nextTick, ref, onMounted } from "vue";
import { useData, useRouter } from "vitepress";
const artalkEl = ref<HTMLElement | null>(null);
const router = useRouter();
const page = useData().page;

onMounted(async () => {
  await nextTick();
  Twikoo({
    envId: "https://commentdata.netlify.app/.netlify/functions/twikoo", // 腾讯云环境填 envId；Vercel 环境填地址（https://xxx.vercel.app）
    el: "#tcomment", // 容器元素
  });
});

</script>


<template>
  <div id="tcomment" ref="artalkEl" style="margin-top: 20px"></div>
</template>

<style></style>
