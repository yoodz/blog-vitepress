---
title: 我的密码管理工具 | 自建 bitwarden
categories: jdi
date: "2024-04-30"
cover: https://upyun.afunny.top/202501102237817.webp
---

bitwarden 是一个密码管理器。分两部分，服务端和客户端。客户端支持web，app等等。目前部署在我家里的笔记本上，用PVE虚拟化平台创建的centos上上。数据备份到阿里云 oss 上。
## 部署篇
### 安装流程
- 服务端通过docker-compose启动服务端
- 配置nginx加载SSL证书

### 服务端镜像

```shell
version: '3'

services:

  bitwarden:
    # 指定使用 vaultwarden 中的最新镜像
    image: vaultwarden/server:latest
    # 容器名称
    container_name: vaultwarden
    # 开机自动启动
    restart: always
    # 指定容器内的 /data 目录挂载到宿主机的当前目录下的 /data/bitwarden/data 目录，这样你可以在宿主机上执行数据库的备份操作
    volumes:
      - ./data/bitwarden-data:/data
    # bitwarden配置
    environment:
      # 开启网页访问
      WEB_VAULT_ENABLED: 'true'
      # 开启新用户注册，我们注册后关闭即可
      SIGNUPS_ALLOWED: 'false'
      # 开启长连接
      WEBSOCKET_ENABLED: 'true'
      # 日志文件
      # LOG_FILE: /data/logs/bitwarden.log
    # 将容器内的80/3012端口映射到宿主机的8087/7007端口；其中80端口为 HTTP 服务，3012 端口是 websockets 服务
    ports:
      - 8087:80
      - 7007:3012
```

首次安装要把 SIGNUPS_ALLOWED 打开注册新用户，然后注册完了之后将其设置为false, 防止其他用户注册

### docker 相关命令

```shell
sudo systemctl start docker.service
sudo systemctl enable docker.service

# 启动服务命令
cd /data
docker-compose -f bitwarden-docker.yml up -d

```

### nginx配置转发和SSL证书

因为bitwarden必须用https的服务访问，所以要申请证书，当前腾讯云的免费证书续签时长为6个月。其他像阿里云就只有3个月了。https证书申请的免费证书 [腾讯云SSL](https://console.cloud.tencent.com/ssl){target="_blank" rel="external"}。下载nginx的模板，解压出来找到 pem 文件和 key 文件，分别上传到服务器，并配置到 nginx 的配置文件里。

```shell
server {
    listen 80;
    listen 8080;
    server_name v.v8kg.com;
    rewrite ^(.*)$ https://${server_name}$1 permanent;
}

server {
  listen 443 ssl http2;
  server_name v.v8kg.com; #Change this to your domain name
  
  ssl_certificate      /etc/ssl/v.v8kg.com_bundle.pem;   #Swap these out with Lets Encrypt Path if using signed cert
  ssl_certificate_key  /etc/ssl/v.v8kg.com.key; #Swap these out with Lets Encrypt Path if using signed cert

  # Allow large attachments
  client_max_body_size 128M;

  location / {
    proxy_pass http://localhost:8087;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  
  location /notifications/hub {
    proxy_pass http://localhost:7007;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
  
  location /notifications/hub/negotiate {
    proxy_pass http://localhost:8087;
  }
}
```

### nginx 相关命令

```shell
sudo systemctl enable nginx # 设置开机启动 
sudo service nginx start # 启动 nginx 服务
sudo service nginx stop # 停止 nginx 服务
sudo service nginx restart # 重启 nginx 服务
sudo service nginx reload # 重新加载配置，一般是在修改过 nginx 配置文件时使用。
```

### 路由器端口转发规则列表

|   名称  | 协议|外部端口  | 内部IP地址 |  内部端口 | 操作 |
| ------------- |-------------| -----|-----|-----|-----|
| bitwarden     |TCP | 4443 | 192.168.31.236 | 443 | 删除 |

路由器暴漏外网，需要小米路由器设置管理后台控制访问。关于网络的设置可以参考之前的文章[闲置笔记本再利用 | 私有云盘](https://afunny.top/old-pc-computer-to-be-server){target="_blank" rel="tag help"}。另外需要配合 [aliyun-ddns](https://github.com/sanjusss/aliyun-ddns){target="_blank" rel="external"} 保证域名能够始终解析到动态公网IP

## 备份篇
备份是很重要的，是后悔药，能够再给你一次机会。

因为dokcer启动时候挂载的是系统目录，所以备份这个目录，下次启动时候直接挂载这个目录就能拿到备份记录了。

### 官方 ossuti
阿里云oss提供的备份脚本 [ossutil](https://help.aliyun.com/zh/oss/developer-reference/install-ossutil?spm=a2c4g.11186623.0.i6){target="_blank" rel="external"},按流程操作之后添加自己的如下配置

```shell
endpoint： oss-cn-xx.aliyuncs.com
accessKeyID： accessKeyID
accessKeySecret： accessKeySecret
stsToken：可以默认空
```

#### ossutil 常用命令

在oss上创建目录

```bash
ossutil64 mkdir oss://bucketname/dirname [--encoding-type <value>]
```

| 配置项 | 说明 |
| --- | --- |
| bucketname | 目标Bucket名称。 |
| dirname | 创建的目录名称。目录名称须以正斜线（/）结尾。若未添加正斜线（/），ossutil会在目录末尾自动添加。 |
| --encoding-type | 对oss://bucket_name后面的key（目录名称）进行编码，取值为url。如果不指定该选项，则表示目录名称未经过编码。 |

#### 备份脚本 bitwarden-backup.sh

```bash
#!/bin/bash

cd /data/data/
tar -czvf ./bitwarden-data-backup/bitwarden-data.tar.gz bitwarden-data/

echo '======================' >> /var/log/ossutil64-bitwarden.log
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting sync operation" >> /var/log/ossutil64-bitwarden.log
/usr/bin/ossutil64 sync /data/data/bitwarden-data-backup/ oss://userdata-backup/bitwarden/ -f >> /var/log/ossutil64-bitwarden.log 2>&1

```

#### 添加到 crontab 定时执行备份命令

```bash
# 每天早上3点同步
0 3 * * * /root/autoBackup/bitwarden-backup.sh
```

## 使用篇
### 手机
安装 bitwarden，添加你自己部署的服务器地址。设置自动填充。

### PC
我主要使用 chrome 浏览器，可以配合插件来使用。可以方便的在不同的网站做密码的的填充。

## 问题排查篇
 ### nginx 访问不到， bind() to 0.0.0.0:8087 failed (13: Permission denied)
 
```shell
# 停止并禁用开机启动
systemctl disable firewalld
# 禁用防火墙
systemctl stop firewalld
```


```shell
# SELinux  也放行开启的端口
#If you use a port bigger than 1024 with root privilege, but still got this problem, that's may be caused by SELinux:
#Check this port, say 8024, in segange port

sudo semanage port -l | grep http_port_t
#If 8024 doesn't exist in the port list, add it into segange port

# 添加放行端口
sudo semanage port -a -t http_port_t  -p tcp 8024

#Sometimes your SELinux is disabled, you need to enforcing it first. Check the status of SELinux by
```