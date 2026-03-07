<!-- 说说页面 - 真瀑布流布局 -->
<script setup lang="ts">
import { onMounted, nextTick, ref, computed, onUnmounted } from "vue";
import { useData } from "vitepress";
import { reInitPv, sortByDateAscending } from '../utils/index.js';
import { IShuoShuo } from '../interface/base';
import ShuoShuoCard from "./ShuoShuoCard.vue";

const data = useData();
const { frontmatter } = data || {};
const { shuoList } = frontmatter.value || {};

// 按日期排序
const shuoListData = ref<IShuoShuo[]>([]);
function initData() {
  if (shuoList && shuoList.length > 0) {
    shuoListData.value = sortByDateAscending(shuoList);
  }
}

initData();

// 响应式列数
const columnCount = ref(2);

// 更新列数
function updateColumnCount() {
  if (typeof window === 'undefined') return;
  const width = window.innerWidth;
  if (width < 640) {
    columnCount.value = 2;
  } else if (width < 1024) {
    columnCount.value = 3;
  } else {
    columnCount.value = 4;
  }
}

// 分配到各列的数据
const columnData = computed(() => {
  const columns: IShuoShuo[][] = Array.from({ length: columnCount.value }, () => []);
  const columnHeights: number[] = Array(columnCount.value).fill(0);

  // 估算每列高度（基于内容长度）
  shuoListData.value.forEach((item) => {
    // 找到当前高度最小的列
    const minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights));

    // 将项目添加到该列
    columns[minHeightIndex].push(item);

    // 更新该列的估算高度（简单按字符数计算）
    const estimatedHeight = item.content.length * 0.5 + 80; // 基础高度 + 内容高度
    columnHeights[minHeightIndex] += estimatedHeight;
  });

  return columns;
});

onMounted(async () => {
  await nextTick();
  reInitPv();

  // 初始化列数
  updateColumnCount();

  // 监听窗口大小变化
  window.addEventListener('resize', updateColumnCount);
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateColumnCount);
  }
});
</script>

<template>
  <div class="shuoshuo-page px-3 sm:px-4 pt-12 sm:pt-14 pb-16 sm:pb-20 mx-auto -mt-4 md:px-0 max-w-6xl">
    <!-- Header -->
    <div class="text-center mb-10 sm:mb-16">
      <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
        说说
      </h1>
      <p class="text-white/70 text-xs sm:text-sm font-light">记录生活点滴</p>
    </div>

    <!-- True Masonry Layout - Columns based -->
    <div class="masonry-container" v-if="shuoListData.length > 0">
      <div
        v-for="(column, colIndex) in columnData"
        :key="colIndex"
        class="masonry-column"
      >
        <div
          v-for="(item, index) in column"
          :key="`${colIndex}-${index}`"
          class="masonry-item shuo-card-enter"
          :style="{ animationDelay: `${(colIndex * 3 + index) * 0.05}s` }"
        >
          <ShuoShuoCard
            :content="item.content"
            :date="item.date"
            :tags="item.tags"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20">
      <p class="text-white/60 text-sm">暂无说说内容</p>
    </div>
  </div>
</template>

<style scoped>
.shuoshuo-page {
  position: relative;
}

/* Animated gradient background - softer colors, different from AWord */
.shuoshuo-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ffeaa7 75%, #ffecd2 100%);
  background-size: 400% 400%;
  animation: gradientFlow 25s ease infinite;
  z-index: -2;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Floating orbs */
.shuoshuo-page::after {
  content: '';
  position: fixed;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%);
  top: 10%;
  right: -100px;
  border-radius: 50%;
  z-index: -1;
  animation: float 30s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-50px, 30px) scale(1.1); }
  66% { transform: translate(30px, -30px) scale(0.95); }
}

/* True Masonry Layout - Column based */
.masonry-container {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.masonry-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0; /* 防止内容溢出 */
}

@media (min-width: 640px) {
  .masonry-container {
    gap: 16px;
  }

  .masonry-column {
    gap: 16px;
  }
}

@media (min-width: 1024px) {
  .masonry-container {
    gap: 20px;
  }

  .masonry-column {
    gap: 20px;
  }
}

/* Animations */
@keyframes fadeUpIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.shuo-card-enter {
  animation: fadeUpIn 0.5s ease-out forwards;
  opacity: 0;
}
</style>
