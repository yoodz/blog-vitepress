// 定义一个分类英文名和中文名的映射,text 表示category 的英文名,name 表示category 的中文名,isHome 标示是否是首页显示的分类

export const categoryMap = [
  {
    text: "hot",
    name: "热门",
    isHome: true,
  },
  {
    text: "jdi",
    name: "折腾",
    isHome: true,
  },
  {
    text: "code",
    name: "编程",
    isHome: true,
  },
  {
    text: "photography",
    name: "摄影",
    isHome: true,
  },
  {
    text: "travel",
    name: "旅行",
    isHome: true,
  },
  {
    text: "lifestyle",
    name: "生活",
    isHome: true,
  },
  {
    text: "run",
    name: "跑步",
    isHome: false,
  },
];


export enum SUB_TYPE {
  /** 访问了文章详情 */
  article_detail,
}