<script setup lang="ts">
import { useData, withBase, useRoute, useRouter } from "vitepress";
const { frontmatter } = useData();
import { watch, nextTick, ref, onMounted, computed } from "vue";
import { getPreviewImage, getFormatNumber } from "../utils";

const props = defineProps<{
  url: string;
  title: string;
  cover: string;
  date: Object;
  categories: string[];
  hit: number;
  isArticleListHitsFetched: boolean;
}>();

const hotArticleViews = 5000;
const route = useRoute();
const router = useRouter();
let timeoutHandle = null;
const imgRef = ref<HTMLImageElement | null>(null);

const imageLoaded = ref(false);
const imageError = ref(false);

const onImageLoad = () => {
  imageError.value = false;
  imageLoaded.value = true;
};

const onImageError = () => {
  imageError.value = true;
  imageLoaded.value = true; // 也设置图片为已加载，隐藏加载动画
};

const articleUrl = computed(() => {
  return withBase(props.url);
});
const previewImageUrl = computed(() => {
  if (!props.cover) {
    console.error("Cover image URL is not provided!");
    return "";
  }
  return props.cover;
  return getPreviewImage(props.cover);
});
const retryLoadImage = () => {
  // 清除旧的超时句柄
  clearTimeout(timeoutHandle);
  // 设置超时逻辑
  timeoutHandle = setTimeout(() => {
    if (!imageLoaded.value) {
      onImageError();
    }
  }, 15000);
};

const goCategory = (category: string) => {
  router.go(`?category=${category}`);
};

const hasNavQuery = computed(() => {
  // 如果url中有category或者 page 参数,则返回true
  const { searchParams } = new URL(window.location.href!);
  return searchParams.has("category") || searchParams.has("page");
});

onMounted(() => {
  // 当组件被挂载后
  nextTick(() => {
    if (imgRef.value?.complete) {
      imageLoaded.value = true;
    }
    retryLoadImage();
  });
});
</script>


<!-- css module的用法 https://vue-loader.vuejs.org/zh/guide/css-modules.html#%E7%94%A8%E6%B3%95 -->
<template>
  <div>
    <div class="flex flex-wrap no-underline hover:no-underline">
      <ClientOnly>
        <a
          :href="articleUrl"
          class="relative w-full overflow-hidden h-60 md:h-40 ld:h-40 bg-zinc-100 dark:bg-neutral-900"
        >
          <img
            ref="imgRef"
            :src="previewImageUrl"
            @load="onImageLoad"
            @error="onImageError"
            :class="[
              'absolute',
              'top-0',
              'left-0',
              'object-cover',
              'w-full',
              'h-full',
              'duration-300',
              'ease-in',
              'rounded-t',
              'hover:scale-105',
              {
                'opacity-0': !imageLoaded || (imageLoaded && imageError),
                'opacity-100': imageLoaded && !imageError,
              },
            ]"
          />

          <div
            v-if="!imageLoaded || imageError"
            :class="{ 'animate-pulse': !imageLoaded }"
            class="flex p-2 mt-6 space-x-4"
          >
            <span v-if="!imageError" class="relative flex w-10 h-10">
              <span
                class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-sky-100"
              ></span>
              <span
                class="relative inline-flex w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600"
              ></span>
            </span>

            <div
              v-if="imageError"
              class="md:block w-0 h-0 mt-1 border-l-[20px] border-l-transparent border-t-[30px] border-t-slate-200 dark:border-t-slate-600 border-r-[20px] border-r-transparent"
            ></div>
            <div class="flex-1 py-1 space-y-6">
              <div
                class="h-8 rounded md:h-4 bg-slate-200 dark:bg-slate-600"
              ></div>
              <div class="space-y-3">
                <div class="grid grid-cols-3 gap-4">
                  <div
                    class="h-8 col-span-2 rounded md:h-4 bg-slate-200 dark:bg-slate-600"
                  ></div>
                  <div
                    class="h-8 col-span-1 rounded md:h-4 bg-slate-200 dark:bg-slate-600"
                  ></div>
                </div>
                <div
                  class="h-8 rounded md:h-4 bg-slate-200 dark:bg-slate-600"
                ></div>
              </div>
            </div>
          </div>
        </a>
      </ClientOnly>
      <div class="w-full px-6 mt-5">
        <ClientOnly>
          <a
            :href="articleUrl"
            class="h-auto text-base antialiased font-medium text-gray-800 break-normal md:h-12 sd:text-lg md:text-base dark:text-slate-300 line-clamp-2 font-fira"
          >
            {{ title }}
          </a>
        </ClientOnly>
      </div>
    </div>
  </div>
  <div
    class="flex-none h-12 px-6 py-3 mt-auto overflow-hidden bg-white rounded-t-none rounded-b shadow-lg dark:bg-zinc-800"
  >
    <div class="flex items-center justify-between">
      <p
        class="text-sm text-gray-400 dark:text-slate-400 sd:text-sm md:text-sm"
      >
        {{ date.formatShowDate }}
      </p>

      <div class="flex items-center justify-items-end">
        <p
          v-if="isArticleListHitsFetched"
          class="ml-px text-sm text-gray-400 sd:text-sm md:text-sm"
          :class="{
            'text-red-400 dark:text-red-500': hit > hotArticleViews,
          }"
        >
          {{ getFormatNumber(hit) }}
        </p>
      </div>

      <!-- 如果分类categories存在,则渲染第一个分类 -->
      <!-- <div v-if="categories" class="flex space-x-2">
        <span
          v-for="(category, index) of categories.slice(0, 1)"
          :key="index"
          @click="goCategory(category)"
          class="hidden inline-block px-2 py-0 mr-2 text-sm font-semibold text-gray-300 bg-transparent border rounded dark:text-slate-300">
          {{ category }}
        </span>
      </div> -->
    </div>
  </div>
</template>../utils