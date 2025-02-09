<!-- 详情页图片和文章标题 -->
<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useData, withBase, useRoute, useRouter } from "vitepress";
import { getBannerImage, getFormatNumber } from "../utils";
import { reportLogsWithImpr } from '../utils/log'
import { SUB_TYPE } from '../constant'

const { frontmatter } = useData();
const route = useRoute();
const router = useRouter();
const title = computed(() => frontmatter.value.title);
const date = computed(() => frontmatter.value.date);
const categories = computed(() => frontmatter.value.categories);
const defaultBanner = "https://upyun.afunny.top/202501102304223.png";
const bannerImageUrl = computed(() => {
  return getBannerImage(frontmatter.value.cover || defaultBanner);
});

const goCategory = (category: string) => {
  router.go(`/?category=${category}`);
};
const pageHits = ref<number>(0);
const isPageHitsFetched = ref<boolean>(true);
const visit = ref<number>(0);

// const fetchPageHits = async () => {
//   try {
//     const response = await fetch(
//       `https://xxx/ga?page=${route.path}`
//     );
//     const { data } = await response.json();
//     const currentPageHit = data.find(
//       (item: any) => item.page === `${route.path}`
//     );

//     if (currentPageHit) {
//       pageHits.value = currentPageHit.hit;
//     }
//     isPageHitsFetched.value = true;
//   } catch (error) {
//     console.error("Error fetching page hits:", error);
//   }
// };

onMounted(async () => {
  // fetchPageHits();
  try {
    const res = await fetch(
      `https://blogapi.afunny.top/.netlify/functions/track-visit?slug=${route.path}`
    );
    const resJson = await res.json()
    visit.value = resJson.count
  } catch (error) {
    //
  }

  reportLogsWithImpr({ subType: SUB_TYPE.article_detail, slug: route.path })
});

watch(
  () => router.route.data.relativePath,
  () => {
    isPageHitsFetched.value = true;
    // fetchPageHits();
  }
);

</script>

<template>
  <div class="w-auto">
    <div class="h-64 overflow-hidden bg-center bg-cover rounded-md" :style="`
        background-image: url(${bannerImageUrl})`">
      <div class="flex items-center h-full bg-gray-900 bg-opacity-30">
        <div class="max-w-xl px-5 md:px-10">
          <h2 class="text-3xl font-bold text-white break-normal line-clamp-4 sd: line-clamp-3 md: line-clamp-2">
            {{ title }}
          </h2>

          <!-- 如果categories 有值,则遍历渲染 -->
          <!-- <div v-if="categories" class="mt-2">
            <span
              v-for="(category, index) of categories"
              :key="index"
              @click="goCategory(category)"
              class="hidden inline-block px-3 py-1 mr-2 text-sm font-semibold text-white bg-transparent border rounded-xl">
              {{ category }}
            </span>
          </div> -->
          <p class="inline-block mt-2 mr-5 text-sm md:text-sm text-slate-200">
            <svg class="h-3 w-3 inline-block -mt-0.5 mr-1" width="24" height="24" viewBox="0 0 24 24" stroke-width="2"
              stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" />
              <rect x="4" y="5" width="16" height="16" rx="2" />
              <line x1="16" y1="3" x2="16" y2="7" />
              <line x1="8" y1="3" x2="8" y2="7" />
              <line x1="4" y1="11" x2="20" y2="11" />
              <rect x="8" y="15" width="2" height="2" />
            </svg>{{ date }}
          </p>
          <!-- 统计pv和阅读数 -->
          <p class="inline-block mt-2 text-sm md:inline-block md:text-sm text-slate-200">
            <svg class="inline-block w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span class="artalk-pv-count">
              <!-- <svg aria-hidden="true"
                class="inline-block w-2 h-2 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101" fill="none">
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor" />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill" />
              </svg> -->
              {{ visit ?? '-' }}

            </span>
            <!-- <svg class="inline-block w-3 h-3 mr-1 ml-2" t="1724339005979" viewBox="0 0 1024 1024" version="1.1"
              xmlns="http://www.w3.org/2000/svg" p-id="4435" width="12" height="12">
              <path
                d="M850.879104 96.41591l-676.303067 0c-60.681034 0-110.049418 49.367361-110.049418 110.049418l0 446.200388c0 60.681034 49.367361 110.049418 110.049418 110.049418l90.307795 0L396.936381 931.129846c3.793396 4.838192 9.598612 7.66354 15.746636 7.66354s11.952216-2.825348 15.746636-7.66354l132.052548-168.414711 290.396903 0c60.681034 0 110.049418-49.367361 110.049418-110.049418L960.928522 206.465329C960.928522 145.784294 911.561162 96.41591 850.879104 96.41591zM920.91111 652.665717c0 38.614459-31.416524 70.030983-70.030983 70.030983L550.744419 722.6967c-6.147 0-11.952216 2.825348-15.745612 7.66354L412.683017 886.356107l-122.31579-155.995867c-3.792373-4.838192-9.597589-7.66354-15.745612-7.66354l-100.045577 0c-38.614459 0-70.030983-31.416524-70.030983-70.030983L104.545054 206.465329c0-38.614459 31.416524-70.030983 70.030983-70.030983l676.303067 0c38.614459 0 70.030983 31.416524 70.030983 70.030983L920.910087 652.665717z"
                fill="#ffffff" p-id="4436"></path>
              <path
                d="M272.621051 344.526731c-44.132126 0-80.035848 35.903721-80.035848 80.035848 0 44.132126 35.903721 80.036871 80.035848 80.036871s80.035848-35.904745 80.035848-80.036871C352.655875 380.430452 316.752154 344.526731 272.621051 344.526731zM272.621051 464.582037c-22.065552 0-40.017412-17.951861-40.017412-40.018436 0-22.065552 17.952884-40.017412 40.017412-40.017412 22.065552 0 40.017412 17.951861 40.017412 40.017412C312.638463 446.629153 294.686602 464.582037 272.621051 464.582037z"
                fill="#ffffff" p-id="4437"></path>
              <path
                d="M512.727571 344.526731c-44.132126 0-80.035848 35.903721-80.035848 80.035848 0 44.132126 35.903721 80.036871 80.035848 80.036871 44.132126 0 80.035848-35.904745 80.035848-80.036871C592.763418 380.430452 556.859697 344.526731 512.727571 344.526731zM512.727571 464.582037c-22.065552 0-40.017412-17.951861-40.017412-40.018436 0-22.065552 17.951861-40.017412 40.017412-40.017412 22.065552 0 40.017412 17.951861 40.017412 40.017412C552.746006 446.629153 534.793122 464.582037 512.727571 464.582037z"
                fill="#ffffff" p-id="4438"></path>
              <path
                d="M752.836137 344.526731c-44.131103 0-80.035848 35.903721-80.035848 80.035848 0 44.132126 35.904745 80.036871 80.035848 80.036871s80.035848-35.904745 80.035848-80.036871C832.871985 380.430452 796.96724 344.526731 752.836137 344.526731zM752.836137 464.582037c-22.066575 0-40.017412-17.951861-40.017412-40.018436 0-22.065552 17.951861-40.017412 40.017412-40.017412s40.017412 17.951861 40.017412 40.017412C792.853549 446.629153 774.902712 464.582037 752.836137 464.582037z"
                fill="#ffffff" p-id="4439"></path>
            </svg> -->
            <!-- <span class="artalk-comment-count">
              <svg aria-hidden="true"
                class="inline-block w-2 h-2 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101" fill="none">
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor" />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill" />
              </svg>
            </span> -->
          </p>

          <p class="mt-2 text-white"></p>
        </div>
      </div>
    </div>
  </div>
</template>
