<!-- 图片画廊组件，基于 PhotoSwipe 实现多图预览和左右切换 -->
<script setup lang="ts">
import { onMounted, nextTick, computed, ref } from "vue";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";

interface ImageItem {
  src: string;
  caption?: string;
  alt?: string;
  width?: number;
  height?: number;
}

const props = defineProps<{
  images: ImageItem[];
  layout?: 'vertical' | 'horizontal' | 'auto';
}>();

// 存储每张图片的实际尺寸
const imageSizes = ref<Map<string, { width: number; height: number }>>(new Map());

const galleryClass = computed(() => {
  if (props.layout === 'vertical') return 'layout-vertical';
  if (props.layout === 'horizontal') return 'layout-horizontal';
  if (props.layout === 'auto') {
    return props.images.length === 2 ? 'layout-horizontal' : 'layout-vertical';
  }
  return 'layout-vertical';
});

// 获取图片尺寸（优先使用传入的尺寸，否则动态获取）
const getImageSize = (img: ImageItem): { width: number; height: number } => {
  if (img.width && img.height) {
    return { width: img.width, height: img.height };
  }
  return imageSizes.value.get(img.src) || { width: 800, height: 600 };
};

let pswpLightbox: PhotoSwipeLightbox | null = null;

onMounted(() => {
  // 预加载图片获取尺寸
  props.images.forEach((img) => {
    if (!img.width || !img.height) {
      const image = new Image();
      image.onload = () => {
        imageSizes.value.set(img.src, {
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      };
      image.src = img.src;
    }
  });

  nextTick(() => {
    initPhotoSwipe();
  });
});

const initPhotoSwipe = () => {
  pswpLightbox = new PhotoSwipeLightbox({
    gallery: ".pswp-gallery",
    children: "a",
    pswpModule: () => import("photoswipe"),
  });

  // 动态获取图片尺寸
  pswpLightbox.addFilter('itemData', (itemData) => {
    // 如果已经有尺寸信息，直接返回
    if (itemData.w && itemData.h) {
      return itemData;
    }

    // 尝试从缓存中获取
    const cachedSize = imageSizes.value.get(itemData.src!);
    if (cachedSize) {
      itemData.w = cachedSize.width;
      itemData.h = cachedSize.height;
      return itemData;
    }

    // 动态加载图片获取尺寸
    const img = new Image();
    img.src = itemData.src!;
    if (img.complete && img.naturalWidth) {
      itemData.w = img.naturalWidth;
      itemData.h = img.naturalHeight;
      // 缓存结果
      imageSizes.value.set(itemData.src!, {
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }

    return itemData;
  });

  pswpLightbox.init();
};
</script>

<template>
  <div class="pswp-gallery" :class="galleryClass" :data-pswp-uid="1">
    <template v-for="(img, index) in images" :key="index">
      <div class="image-wrapper">
        <a
          :href="img.src"
          target="_blank"
          :data-pswp-width="getImageSize(img).width"
          :data-pswp-height="getImageSize(img).height"
        >
          <img :src="img.src" :alt="img.alt || img.caption" />
        </a>
        <p v-if="img.caption" class="caption">{{ img.caption }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pswp-gallery {
  display: contents;
}

.pswp-gallery.layout-horizontal {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.pswp-gallery.layout-horizontal .image-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 200px;
}

.pswp-gallery.layout-horizontal a {
  display: block;
}

.pswp-gallery.layout-horizontal img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  max-width: 100%;
  border-radius: 8px;
  display: block;
  cursor: zoom-in;
}

.pswp-gallery.layout-vertical .image-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pswp-gallery img {
  max-width: 100%;
  border-radius: 8px;
  display: block;
  cursor: zoom-in;
}

.pswp-gallery .caption {
  text-align: center;
  color: #999;
  font-size: 13px;
  margin: 0;
  line-height: 1.4;
}
</style>
