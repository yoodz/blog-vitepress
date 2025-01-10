---
title: 抢不到菜？8min打造实时监听工具 | python | 爬虫 | charles
categories: code
date: "2024-03-28"
cover: https://upyun.afunny.top/202501102241899.png
---

> 前言：之前由于口罩问题比较严重，每天盯着手机都抢不到菜，于是催生出编程写脚本监听抢菜的想法。目前口罩问题已经过去了，大家也回归了正常的生活，但是这篇文章的监听流程还是可以复用的。

下面是当时的具体实现。用代码实现一个小工具，监听购物车是否可以下单，并且实时推送到手机。

## 环境准备 charles postman python3

### charles 抓包工具
安装证书。依次选择 Help-SSL Proxying - Install Charles Root Certificate。

![Untitled](https://static.afunny.top/2023/202403281841705.png)

监听SSL请求。依次选择 Proxy - SSl Proxying Settings - Add.增加 *： 443的配置。

![Untitled](https://static.afunny.top/2023/202403281841707.png)

### postman 用来发请求的工具

Postman是一个接口测试工具,在做接口测试的时候,Postman相当于一个客户端,它可以模拟用户发起的各类HTTP请求,将请求数据发送至服务端,获取对应的响应结果。我们使用它把curl请求转为python request请求。

### python3

python执行环境, 网上很多教程，可以搜索安装

# 操作流程

1. 通过charles抓包获取购物小程序接口，并获取curl请求
2. 通过postman将curl请求转化为python request请求
3. 写python脚本，随机定时请求接口
4. 可购买状态时通知到手机

![需要抓包的购物小程序](https://static.afunny.top/2023/202403281841699.png)

需要抓包的购物小程序

## charles抓包获取购物小程序购物车接口

![Untitled](https://static.afunny.top/2023/202403281841701.png)

分析抓到的资源列表，大多是是mp4,png 结尾的资源文件，这些可以排除了，继续查找发现有一个yx.feiniu.com的域名返回的json数据。观察返回数据字段。"canSettlement": false,翻译中文就是是否可以结算。当前购物车按钮显示的是已约满，我们找到了这样一个字段"settlementDesc": "已约满",说明这个接口就是购物车的接口了。接下来右键复制curl请求，如下所示：

```shell
curl -H 'Host: yx.feiniu.com' -H 'accept: */*' -H 'content-type: application/x-www-form-urlencoded' -H 'accept-language: zh-cn' -H 'user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E217 MicroMessenger/6.8.0(0x16080000) NetType/WIFI Language/en Branch/Br_trunk MiniProgramEnv/Mac' -H 'referer: https://servicewechat.com/wxbacda571ce881d37/47/page-frame.html' --data-binary "data=%7B%22apiVersion%22%3A%22to141%22%2C%22appVersion%22%3A%221.5.1%22%2C%22areaCode%22%3A%22CS000016%22%2C%22channel%22%3A%22online%22%2C%22clientid%22%3A%22a7ea53059fc868e2e3e2dd7c04027035%22%2C%22device_id%22%3A%22n5ZvvRabGYnlPqvqG1GjEuLjzS5UUPAP536X%22%2C%22time%22%3A1648516134591%2C%22reRule%22%3A%224%22%2C%22token%22%3A%223eb0e17dd8082fca03abb58c99f552a7%22%2C%22viewSize%22%3A%22720x1184%22%2C%22networkType%22%3A%22wifi%22%2C%22isSimulator%22%3Afalse%2C%22osType%22%3A%224%22%2C%22scopeType%22%3A1%2C%22businessType%22%3A2%2C%22businessId%22%3A%2217010001%22%2C%22deliveryCircleType%22%3A%221%22%2C%22body%22%3A%7B%22ticket_id%22%3A%22%22%2C%22store_id%22%3A%221701%22%2C%22notNeedScallion%22%3A%22%22%7D%7D&h5=yx_touch&paramsMD5=8n5dK5IaJA56Cth3TXLXvkcqFbGV2%2BynaQDriP5l3vA%3D" --compressed 'https://yx.feiniu.com/cart-yxapp/shopcart/adminshopcart/cartget/to141'
```

这样获取到的请求里是带这登录信息的token，所以脱离了小程序环境，依然可以请求通。

## 通过postman将curl请求转化为python request请求

这一步也可以直接手写python请求，带上一步复制出来的头部信息，请求参数。使用postman是个偷巧的用法。因为它可以直接输出python的请求代码。

第一步点击Collecttions - import - raw text - continue导入curl请求。

![Untitled](https://static.afunny.top/2023/202403281841702.png)

导入完成之后，点击send，发送请求测试请求代码是否正确。看到有正常的返回之后，点击右侧code标签，展开导出各种语言的列表。这里选择python request代码。复制代码内容。

![Untitled](https://static.afunny.top/2023/202403281841703.png)

## 写python脚本，随机定时请求接口

```python
import json
import time
import random
import requests

def getInit():
    url = "https://yx.feiniu.com/cart-yxapp/shopcart/adminshopcart/cartget/to141"

    payload = "data=%7B%22apiVersion%22%3A%22to141%22%2C%22appVersion%22%3A%221.5.1%22%2C%22areaCode%22%3A%22CS000016%22%2C%22channel%22%3A%22online%22%2C%22clientid%22%3A%22a7ea53059fc868e2e3e2dd7c04027035%22%2C%22device_id%22%3A%22n5ZvvRabGYnlPqvqG1GjEuLjzS5UUPAP536X%22%2C%22time%22%3A1648516134591%2C%22reRule%22%3A%224%22%2C%22token%22%3A%223eb0e17dd8082fca03abb58c99f552a7%22%2C%22viewSize%22%3A%22720x1184%22%2C%22networkType%22%3A%22wifi%22%2C%22isSimulator%22%3Afalse%2C%22osType%22%3A%224%22%2C%22scopeType%22%3A1%2C%22businessType%22%3A2%2C%22businessId%22%3A%2217010001%22%2C%22deliveryCircleType%22%3A%221%22%2C%22body%22%3A%7B%22ticket_id%22%3A%22%22%2C%22store_id%22%3A%221701%22%2C%22notNeedScallion%22%3A%22%22%7D%7D&h5=yx_touch&paramsMD5=8n5dK5IaJA56Cth3TXLXvkcqFbGV2%2BynaQDriP5l3vA%3D"
    headers = {
      'Host': 'yx.feiniu.com',
      'accept': '*/*',
      'content-type': 'application/x-www-form-urlencoded',
      'accept-language': 'zh-cn',
      'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E217 MicroMessenger/6.8.0(0x16080000) NetType/WIFI Language/en Branch/Br_trunk MiniProgramEnv/Mac',
      'referer': 'https://servicewechat.com/wxbacda571ce881d37/47/page-frame.html'
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    return response

if __name__ == '__main__':
    while True:
        ranumber = random.randint(5, 10)
        try:
            print("随机请求时间为 {} s".format(ranumber))
            res = getInit()
            resjson = json.loads(res.text)
            dataList = resjson.get('body')
            canSettlement = dataList.get('canSettlement')
            if canSettlement:
                requests.get('https://api.day.app/{替换成你自己的Bark key}/欧尚可以约')
                print('可以约')
            else:
                print('不能约')
        except:
            print('some error ocuer')
        finally:
            time.sleep(ranumber)
```

打开pycharm，新建python文件，粘贴上图复制的python 请求代码。然后做一些修改。设置持续请求接口。增加随机随眠时间，方式被接口风控，增加异常捕获，保证请求出错之后依旧可以正常进行下一次的请求。请求完成之后推送到手机。完整代码如下所示。

## 可购买状态时通知到手机

IOS手机可以安装Bark软件，这个可以通过触发get请求的形式实时推送消息到手机。挺实用的。安卓可以使用公众号推送。网上都可以搜到。测试手机是否可以正常收到推送。

![WechatIMG359.jpeg](https://static.afunny.top/2023/202403281841706.jpeg)

## 查看运行状态

运行状态在正常，终于解放了双手，不用时时刻刻盯着手机啦。

![Untitled](https://static.afunny.top/2023/202403281841704.png)

## 总结

首先使用charles抓包小程序请求，分析请求数据获取到购物车接口，使用postman将curl请求转为python request请求。优化python代码保证持续发出请求。最后获取到请求成功消息推送到手机。四步走解放双手的小工具就完成啦。