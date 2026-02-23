<!-- 通用图片组件，支持多种布局 -->
<script setup lang="ts">
import { computed } from "vue";

interface ImageItem {
  src: string;
  caption?: string;
  alt?: string;
}

type LayoutType = "default" | "grid" | "scroll" | "compare" | "masonry";

const props = defineProps<{
  // 单图模式：src 字符串
  src?: string;
  // 多图模式：images 数组
  images?: ImageItem[];
  // 布局类型
  type?: LayoutType;
  // 网格列数（grid/masonry）
  columns?: number;
  // 对齐方式（default）
  align?: "left" | "center" | "right";
  // 单图的描述
  caption?: string;
  // 单图的替代文本
  alt?: string;
}>();

// 计算实际的图片列表
const imageList = computed<ImageItem[]>(() => {
  if (props.images) return props.images;
  if (props.src) return [{ src: props.src, caption: props.caption, alt: props.alt }];
  return [];
});

// 当前布局类型
const layoutType = computed<LayoutType>(() => props.type || "default");

// 网格列数
const gridColumns = computed(() => props.columns || 2);
</script>

<template>
  <!-- 默认单图布局 -->
  <template v-if="layoutType === 'default' && imageList.length === 1">
    <div class="image-with-caption" :class="`align-${align || 'center'}`">
      <img :src="imageList[0].src" :alt="imageList[0].alt || imageList[0].caption" />
      <p v-if="imageList[0].caption" class="caption">{{ imageList[0].caption }}</p>
    </div>
  </template>

  <!-- 网格布局 -->
  <div v-else-if="layoutType === 'grid'" class="image-grid" :style="{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }">
    <div v-for="(img, index) in imageList" :key="index" class="grid-item">
      <img :src="img.src" :alt="img.alt || img.caption" />
      <p v-if="img.caption" class="caption">{{ img.caption }}</p>
    </div>
  </div>

  <!-- 横向滚动布局 -->
  <div v-else-if="layoutType === 'scroll'" class="image-scroll">
    <div v-for="(img, index) in imageList" :key="index" class="scroll-item">
      <img :src="img.src" :alt="img.alt || img.caption" />
      <p v-if="img.caption" class="caption">{{ img.caption }}</p>
    </div>
  </div>

  <!-- 左右对比布局 -->
  <div v-else-if="layoutType === 'compare'" class="image-compare">
    <div v-for="(img, index) in imageList.slice(0, 2)" :key="index" class="compare-item">
      <img :src="img.src" :alt="img.alt || img.caption" />
      <p v-if="img.caption" class="caption">{{ img.caption }}</p>
    </div>
  </div>

  <!-- 瀑布流布局 -->
  <div v-else-if="layoutType === 'masonry'" class="image-masonry" :style="{ columnCount: gridColumns }">
    <div v-for="(img, index) in imageList" :key="index" class="masonry-item">
      <img :src="img.src" :alt="img.alt || img.caption" />
      <p v-if="img.caption" class="caption">{{ img.caption }}</p>
    </div>
  </div>
</template>

<style scoped>
/* 默认单图布局 */
.image-with-caption {
  margin: 16px 0;
}

.image-with-caption.align-left {
  text-align: left;
}

.image-with-caption.align-center {
  text-align: center;
}

.image-with-caption.align-right {
  text-align: right;
}

.image-with-caption img {
  max-width: 100%;
  border-radius: 8px;
}

.image-with-caption.align-left img,
.image-with-caption.align-right img {
  max-width: 80%;
}

/* 网格布局 */
.image-grid {
  display: grid;
  gap: 12px;
  margin: 16px 0;
}

.grid-item {
  display: flex;
  flex-direction: column;
}

.grid-item img {
  width: 100%;
  border-radius: 8px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

/* 横向滚动布局 */
.image-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  margin: 16px -20px;
  padding: 0 20px;
  scrollbar-width: thin;
}

.image-scroll::-webkit-scrollbar {
  height: 6px;
}

.image-scroll::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.scroll-item {
  flex: 0 0 80%;
  scroll-snap-align: center;
  max-width: 400px;
}

.scroll-item img {
  width: 100%;
  border-radius: 8px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

/* 左右对比布局 */
.image-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 16px 0;
}

.compare-item img {
  width: 100%;
  border-radius: 8px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

/* 瀑布流布局 */
.image-masonry {
  column-count: 2;
  column-gap: 12px;
  margin: 16px 0;
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 12px;
}

.masonry-item img {
  width: 100%;
  border-radius: 8px;
  display: block;
}

/* 通用描述样式 */
.caption {
  text-align: center;
  color: #999;
  font-size: 13px;
  margin-top: 6px;
  line-height: 1.4;
}

/* 移动端适配 */
@media (max-width: 640px) {
  .image-scroll {
    margin: 16px -16px;
    padding: 0 16px;
  }

  .scroll-item {
    flex: 0 0 85%;
  }

  .image-compare {
    grid-template-columns: 1fr;
  }

  .image-masonry {
    column-count: 1;
  }

  .image-with-caption.align-left img,
  .image-with-caption.align-right img {
    max-width: 100%;
  }
}
</style>
