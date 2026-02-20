<!-- 心动一言 -->
<script setup lang="ts">
import { onMounted, nextTick, ref, $frontmatter } from "vue";
import { useData } from "vitepress";

import { reInitPv, sortByDateAscending } from '../utils/index.js'
import { IAWord } from '../interface/base';
import AWordCard from "./AWordCard.vue";

// Date formatting helpers
function formatDateDay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.getDate().toString().padStart(2, '0');
}

function formatDateMonth(dateStr: string): string {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const date = new Date(dateStr);
  return months[date.getMonth()];
}

function formatDateYear(dateStr: string): string {
  const date = new Date(dateStr);
  return date.getFullYear().toString();
}

const data = useData();
const { frontmatter } = data || {};
const { wordsList } = frontmatter.value || {};

// 按日期排序获取时间线列表
const timelineList = ref<IAWord[]>([]);
function initTimeline() {
  timelineList.value = sortByDateAscending(wordsList);
}

initTimeline()

onMounted(async () => {
  await nextTick();
  reInitPv();
});
</script>

<template>
  <div class="aword-page px-4 pt-14 pb-20 mx-auto -mt-4 md:px-0 max-w-4xl">
    <!-- Header -->
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
        心动一言
      </h1>
      <p class="text-white/70 text-sm font-light">记录那些触动心灵的文字</p>
    </div>

    <!-- Timeline -->
    <div class="timeline">
      <div v-for="(item, index) in timelineList" :key="index" class="timeline-item aword-card-enter">
        <!-- Date marker -->
        <div class="timeline-date">
          <div class="date-inner">
            <span class="date-year">{{ formatDateYear(item.date) }}</span>
            <span class="date-divider">/</span>
            <span class="date-month">{{ formatDateMonth(item.date) }}</span>
            <span class="date-day">{{ formatDateDay(item.date) }}</span>
          </div>
        </div>

        <!-- Connector dot -->
        <div class="timeline-dot">
          <div class="dot-inner"></div>
        </div>

        <!-- Content card -->
        <div class="timeline-content">
          <AWordCard :title="item.title" :content="item.content" :date="item.date" :desc="item.desc" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aword-page {
  position: relative;
}

/* Animated gradient background - softer colors */
.aword-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #d299c2 75%, #a8edea 100%);
  background-size: 400% 400%;
  animation: gradientFlow 20s ease infinite;
  z-index: -2;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Floating orbs - multiple */
.aword-page::after {
  content: '';
  position: fixed;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
  top: 10%;
  right: -100px;
  border-radius: 50%;
  z-index: -1;
  animation: float 25s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-50px, 30px) scale(1.1); }
  66% { transform: translate(30px, -30px) scale(0.95); }
}

/* Timeline */
.timeline {
  position: relative;
  padding-left: 100px;
}

/* Vertical line */
.timeline::before {
  content: '';
  position: absolute;
  left: 39px;
  top: 20px;
  bottom: 20px;
  width: 2px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.3) 0%,
    rgba(255,255,255,0.8) 50%,
    rgba(255,255,255,0.3) 100%
  );
  border-radius: 2px;
}

/* Timeline item */
.timeline-item {
  position: relative;
  margin-bottom: 32px;
  display: grid;
  grid-template-columns: 60px 20px 1fr;
  gap: 16px;
  align-items: flex-start;
}

/* Date marker */
.timeline-date {
  display: flex;
  justify-content: center;
  align-items: center;
}

.date-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: rgba(255,255,255,0.3);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.5);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.timeline-item:hover .date-inner {
  background: rgba(255,255,255,0.4);
  transform: scale(1.05);
}

.date-year {
  font-size: 10px;
  color: rgba(255,255,255,0.8);
  line-height: 1;
  font-weight: 500;
}

.date-divider {
  font-size: 10px;
  color: rgba(255,255,255,0.5);
  line-height: 1;
  margin: 1px 0;
}

.date-month {
  font-size: 11px;
  color: rgba(255,255,255,0.9);
  line-height: 1;
  font-weight: 500;
}

.date-day {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.15);
  line-height: 1;
  margin-top: 2px;
}

/* Timeline dot */
.timeline-dot {
  display: flex;
  justify-content: center;
  padding-top: 22px;
}

.dot-inner {
  width: 10px;
  height: 10px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(255,255,255,0.3);
  transition: all 0.3s ease;
}

.timeline-item:hover .dot-inner {
  box-shadow: 0 0 0 6px rgba(255,255,255,0.4);
  transform: scale(1.1);
}

/* Timeline content */
.timeline-content {
  flex: 1;
}

/* Animations */
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.aword-card-enter {
  animation: fadeSlideIn 0.5s ease-out forwards;
  opacity: 0;
}

.aword-card-enter:nth-child(1) { animation-delay: 0.05s; }
.aword-card-enter:nth-child(2) { animation-delay: 0.1s; }
.aword-card-enter:nth-child(3) { animation-delay: 0.15s; }
.aword-card-enter:nth-child(4) { animation-delay: 0.2s; }
.aword-card-enter:nth-child(5) { animation-delay: 0.25s; }
.aword-card-enter:nth-child(6) { animation-delay: 0.3s; }
.aword-card-enter:nth-child(7) { animation-delay: 0.35s; }
.aword-card-enter:nth-child(8) { animation-delay: 0.4s; }
.aword-card-enter:nth-child(9) { animation-delay: 0.45s; }
.aword-card-enter:nth-child(10) { animation-delay: 0.5s; }
.aword-card-enter:nth-child(11) { animation-delay: 0.55s; }
.aword-card-enter:nth-child(12) { animation-delay: 0.6s; }
.aword-card-enter:nth-child(13) { animation-delay: 0.65s; }
.aword-card-enter:nth-child(14) { animation-delay: 0.7s; }
</style>
