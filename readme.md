# todo

~~- [ ] rem 样式，选用了tailwind css~~ 
- [x] md文件的样式
- [ ] tag 分类


vue less 有scope，保证每个文件的css唯一

oss图片可以加参数访问

https://static.afunny.top/2023/202402102035130.jpg?x-oss-process=image/resize,w_800/quality,q_80
```
x-oss-process=image/：固定参数，表明使用图片处理参数对图片文件进行处理。
action,parame_value：图片处理的操作（action）、参数（parame）和值（value），用于定义图片处理的方式。多个操作以正斜线（/）隔开，OSS将按图片处理参数的顺序处理图片。例如image/resize,w_200/rotate,90表示将图片先按比例缩放至宽200 px，再将图片旋转90°。图片处理支持的参数，请参见处理参数。
```