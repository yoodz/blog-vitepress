# 我的博客
基于vitepress的博客系统，托管在netlify。主题还在持续开发中。内容包括技术，生活，思考，感悟等等。

# 备忘
vue less 有scope，保证每个文件的css唯一

oss图片可以加参数访问
https://static.afunny.top/2023/202402102035130.jpg?x-oss-process=image/resize,w_800/quality,q_80
```
x-oss-process=image/：固定参数，表明使用图片处理参数对图片文件进行处理。
action,parame_value：图片处理的操作（action）、参数（parame）和值（value），用于定义图片处理的方式。多个操作以正斜线（/）隔开，OSS将按图片处理参数的顺序处理图片。例如image/resize,w_200/rotate,90表示将图片先按比例缩放至宽200 px，再将图片旋转90°。图片处理支持的参数，请参见处理参数。
```
# 参考
- [罗磊的独立博客](https://github.com/foru17/luoleiorg)

设计参考
卡片动效，分页设计，毛玻璃 https://www.uisdc.com/tag/%E5%AF%BC%E8%88%AA%E8%AE%BE%E8%AE%A1
导航 https://huaban.com/
导航hover切换
滚动设计 https://dribbble.com/

# 部署
托管在netlify。
## 如何控制部署时长
增加./netlify.sh脚本。用在部署的时候，用来判断如果不是master分支的推送，就提前终止部署。