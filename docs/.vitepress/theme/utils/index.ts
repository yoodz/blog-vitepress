import { IAWord } from "../interface/base";

export function formatDate(d: any, fmt = "yyyy-MM-dd hh:mm:ss") {
  if (!(d instanceof Date)) {
    d = new Date(d);
  }
  const o: any = {
    "M+": d.getMonth() + 1, // 月份
    "d+": d.getDate(), // 日
    "h+": d.getHours(), // 小时
    "m+": d.getMinutes(), // 分
    "s+": d.getSeconds(), // 秒
    "q+": Math.floor((d.getMonth() + 3) / 3), // 季度
    S: d.getMilliseconds(), // 毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      `${d.getFullYear()}`.substr(4 - RegExp.$1.length),
    );
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length),
      );
  }
  return fmt;
}

export function getFaviconUrl(domain: string) {
  return `${domain}`;
}

export function getOriginalImage(url: string) {
  return `${url}`;
}

export function getPreviewImage(url: string) {
  if (/(x-oss-process|png)/.test(url)) {
    return url;
  }
  return `${url}?x-oss-process=image/resize,w_1600/quality,q_80`;
}

export function getBannerImage(url: string) {
  // oss只支持 .png 或 .webp 类型的quality设置
  if (/(x-oss-process|png)/.test(url)) {
    return url;
  }
  return `${url}?x-oss-process=image/quality,q_80`;
}

export function getArticleLazyImage(url: string) {
  return `${url}`;
}

export function getArticleBlurImage(url: string) {
  return `${url}`;
}

export function getFormatNumber(num: number) {
  // 给数字加上逗号分隔符，例如：12345678 => 12,345,678
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function isCurrentWeek(date: Date, target?: Date) {
  const now = target || new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneDay = 1000 * 60 * 60 * 24;
  const nowWeek = today.getDay();
  // 本周一的时间
  const startWeek =
    today.getTime() - (nowWeek === 0 ? 6 : nowWeek - 1) * oneDay;
  return +date >= startWeek && +date <= startWeek + 7 * oneDay;
}

export function formatShowDate(date: Date | string) {
  const source = date ? +new Date(date) : +new Date();
  const now = +new Date();
  const diff = now - source > 0 ? now - source : 60 * 1000;
  const oneSeconds = 1000;
  const oneMinute = oneSeconds * 60;
  const oneHour = oneMinute * 60;
  const oneDay = oneHour * 24;
  const oneWeek = oneDay * 7;
  const oneMonth = oneDay * 30;
  const oneYear = oneDay * 365;
  // if (diff < oneMinute) {
  //   return `${Math.floor(diff / oneSeconds)}秒前`;
  // }
  // if (diff < oneHour) {
  //   return `${Math.floor(diff / oneMinute)}分钟前`;
  // }
  if (diff < oneDay) {
    return `今天`;
  }
  if (diff < oneWeek) {
    return `${Math.floor(diff / oneDay)}天前`;
  }
  if (diff < oneMonth) {
    return `${Math.floor(diff / oneWeek)}周前`;
  }
  if (diff < oneYear) {
    const months = Math.floor(diff / oneMonth);
    if (months > 0) {
      return `${months}月前`;
    }
  }

  const years = Math.floor(diff / oneYear);
  if (years > 0 && years < 3) {
    return `${years}年前`;
  } else {
    return formatDate(new Date(date), "yyyy-MM-dd");
  }
}

export const reInitPv = () => {
  import("artalk").then((Artalk) => {
    // 批量获取文章的pv
    Artalk.loadCountWidget({
      server: 'https://c.afunny.top:4446',  // 后端地址
      site: 'Afunny 的博客',             // 你的站点名
      pvEl: '.artalk-pv-count',
      countEl: '.artalk-comment-count',
      statPageKeyAttr: 'data-page-key',
    })
  });
}

// 自定义分词函数
export function customTokenizer(text) {
  // 去除空格，每个字分词
  return Array.from(new Intl.Segmenter('cn', { granularity: 'word' }).segment(text.replace(/ /g, ''))).map(item => item.segment)
}

/**
* 根据时间戳将对象按年分类
* @param {Array} items - 包含时间戳的对象数组
* @returns {Object} - 以年份为键的分类对象
*/
export function classifyByYear(items) {
 return items.reduce((acc, item) => {
   // 假设每个对象都有一个 'time' 属性，存储时间戳
   const year = new Date(item.date.time).getFullYear();

   // 如果年份键不存在，则创建一个空数组
   if (!acc[year]) {
     acc[year] = [];
   }

   // 将对象添加到对应年份的数组中
   acc[year].push(item);

   return acc;
 }, {});
}


/**
 * 判断一个日期是否在过去的半年内
 * @param {string} dateString - 要判断的日期，格式为 'YYYY-MM-DD'
 * @returns {boolean} - 如果日期在过去的半年内则返回 true，否则返回 false
 */
export function isWithinPastSixMonths(dateString) {
  const inputDate = new Date(dateString);
  const currentDate = new Date();
  
  // 计算过去六个月的日期
  const sixMonthsAgo = new Date(currentDate);
  sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
  
  // 判断日期是否在过去的半年内
  return inputDate <= currentDate && inputDate >= sixMonthsAgo;
}

/**
 * 根据日期倒序
 */
export function sortByDateAscending(arr: IAWord[]) {
  return arr.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
}