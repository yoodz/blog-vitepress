---
title: Umami | 可以私有部署的开源统计分析工具
date: "2024-08-17"
categories: jdi
tags:
cover: https://static.afunny.top/2023/202408172101417.png
---
## 背景
自从有了自己的网站之后，总希望能看到网站的访问情况。现有的实现方案如百度统计，Google Analytics, 或是因为备案，或是因为网络问题，体验不是很好。所以当我看到有可以私有部署的数据管理平台 Umami ，我当然要试一试。虽然现在我的网站并没有多大需求~ 接下来言归正传，从安装开始。

## 安装部署
能够一键拉起服务的体验真是太爽了。所以我毫不犹豫要选择docker部署。
### docker-compose 配置

通过docker方式安装，准备 docker-compose.yml 文件。下面对比官方的启动文件，我只更新了端口，因为3000端口太常用了，会导致冲突。下面的配置文件一共会启动两个容器，一个是 Umami 自己的服务，一个是 postgres 配套数据库。
[官方安装文档](https://umami.is/docs/install#installing-with-docker)  

```docker
---
version: '3'
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    ports:
      - "3003:3000"
    environment:
      DATABASE_URL: postgresql://umami:umami@db:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: replace-me-with-a-random-string
    depends_on:
      db:
        condition: service_healthy
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "curl http://localhost:3003/api/heartbeat"]
      interval: 5s
      timeout: 5s
      retries: 5
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: umami
    volumes:
      - umami-db-data:/var/lib/postgresql/data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5
volumes:
  umami-db-data:
```

准备好上面的脚本之后，就可以一键启动了。这个配置文件是v3版本的，v3版本的配置语法有变化，如果本机的docker-compose版本过低需要升级。  

## docker-compose 升级（支持v3可忽略）

```bash
# 检查你当前安装的 Docker Compose 版本
docker-compose --version

# 下载最新版本的 Docker Compose 二进制文件。以下命令会自动下载最新版本，并将其放在 /usr/local/bin/ 目录下：
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

#下载完成后，你需要将下载的二进制文件设置为可执行：
sudo chmod +x /usr/local/bin/docker-compose
```

启动成功之后可以看到如下的两个容器

![image.png](https://static.afunny.top/2023/202408172101419.png)

## 初始化配置
如上，我监听的端口为3003，所以访问 IP+3003 端口，正常就可以打开下面的登录界面。
![](https://static.afunny.top/2023/202408172107261.png)

- 默认账号：**`admin`**
- 默认密码：**`umami`**

进入到网站之后，第一件事情肯定要修改默认的密码。然后需要添加自己的网站，点 设置 - 添加网站，在弹出的弹窗里填写自己的网站
![](https://static.afunny.top/2023/202408172110380.png)


网站添加完成之后，会给这个网站分配唯一的跟踪代码，加载到要跟踪的网站上就可以追踪网站数据了。
```
<script defer src="https://YOUR_DOMAIN:8888/script.js" data-website-id="bb1aa7b4-ac5b-4cf-a623a-2cfe4cf07532"></script>
```
## 配置nginx 转发和 https证书

因为需要向外提供一个js，我的博客网站是https 的，那加载http的脚本就会报错，所以这个网站也需要有ssl证书。部署可以参考[我的密码管理工具 | 自建 bitwarden](/bitwarden#部署篇)。

现在免费的SSL证书只有三个月的有效期，所以配合自动更新脚本，自动续期脚本 [acme.sh](https://github.com/acmesh-official/acme.sh?tab=readme-ov-file) 就可以一劳永逸了。这里就参考官方的安装文档吧。


## 数据展示
之后就可以实时看到网站的数据。果然没什么人访问呀。umami 还支持捕获自定义事件，还可以通过openapi来访问。后期还有探索的空间。
![image.png](https://static.afunny.top/2023/202408172101417.png)
