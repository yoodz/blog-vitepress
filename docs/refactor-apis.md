---
title: 花了2天时间使用 Cloudflare Worker 重构BlogNews API
date: "2025-04-09"
cover: https://upyun.afunny.top/2025/03/15/67d58a0284cae.jpeg
categories: jdi
---
[BlogNews](https://s.afunny.top/azq5ur)的项目，最初技术栈 Nextjs + Netlify Serverless 函数 + MongoDB Atlas。从体验上来说首次启动特别耗时，页面加载需要等待几秒甚至十几秒。原因大概有两点，第一，由于 Netlify 的云函数有冷启动，函数通常在执行完被释放，后续从零开始启动（当然会有一些策略）导致每次请求都特别耗时。第二，接口和数据库不在同一个区域的延迟。在我寻找替代方案的时候， 找到了 Cloudflare Worker，它有以下的特点。
- 边缘运行的无服务器平台，部署在全球 200 多个城市
- [消除了冷启动](https://blog.cloudflare.com/eliminating-cold-starts-with-cloudflare-workers/),其实是更快更早的冷启动，让用户无感
- cloudflare 自家数据库支持D1(一个无服务器的关系数据库)和KV（键值数据存储）
- 基于 V8 引擎

## 调整后技术栈
- Nextjs
- [Hono](https://github.com/honojs/hono)是一个用于构建 Web 应用程序的超快速轻量级框架，并且与 Cloudflare Workers 完美兼容。
- [cloudflare d1 数据库](https://developers.cloudflare.com/d1/)
- [drizzle-orm](https://github.com/drizzle-team/drizzle-orm) 数据库ORM

## 数据库调试与发布
Cloudflare 官方提供了 wrangler 包来辅助本地开发，包括数据操作。安装之后修改两个配置文件。
wrangler.jsonc的配置
```js
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "cf-api", // 项目名称
  "main": "src/index.ts", // 项目入口
  "compatibility_date": "2025-04-01",
  "d1_databases": [
    {
      "binding": "DB", // 数据库的标识符，随便定义，用的时候保持一致
      "database_name": "blog",
      "database_id": "your database id", // cf上创建的数据库id
      // 数据库迁移脚本的位置，读取drizzle生成的sql文件做同步
      "migrations_dir": "migrations"
    }
  ],
}
```

drizzle.config.ts
```js
import type { Config } from "drizzle-kit";
export default {
  schema: "./src/db/schema/*", // 表结构文件
  out: "./migrations", // 数据库迁移脚本输出位置
  driver: "d1-http",
  dialect: "sqlite",
  dbCredentials: {
    wranglerConfigPath: "./wrangler.jsonc",
    dbName: "xx"
  },
  verbose: true,
  strict: true
} satisfies Config;
```


### 生成数据库迁移文件
该命令读取 drizzle.config.ts 配置，每次表结构变动后操作
```js
npx drizzle-kit generate
```
![Snipaste_2025-04-10_08-21-43.png](https://upyun.afunny.top/2025/04/10/67f70f373ce0c.png)
### 本地开发
```js
npx wrangler d1 migrations apply yourDbName --local
```

### 同步表结构到线上
```js
// 本地操作线上需要先登录 cloudflare
npx wrangler login
// 同步本地的表结构到线上
npx wrangler d1 migrations apply yourDbName --remote
```

## 表结构定义默认值不生效
```sql{6}
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const config = sqliteTable('config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull(),
  value: text('value').notNull().default(sql`'{}'::text[]`),,
  createdAt: integer('created_at'),
});

export type Config = typeof config.$inferSelect;
export type NewConfig = typeof config.$inferInsert;
export default config;
```
测试下来第六行，定义表结构默认值的写法不生效，可能是cf d1的支持还不够完善，等后续更新吧，目前先用业务代码维护默认值。


运行数据截图
![Snipaste_2025-04-10_08-41-40.png](https://upyun.afunny.top/2025/04/10/67f713ebec68b.png)