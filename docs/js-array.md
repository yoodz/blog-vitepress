---
title: 弱点强化- JS 常用数组方法
tags: JavaScript Array
categories: code
date: "2025-03-14"
cover: https://upyun.afunny.top//20250315005053314.jpeg
---

汇总会改变原数组的方法：
- **`push()`**：向数组末尾添加一个或多个元素，并返回新的长度。
- **`pop()`**：删除并返回数组的最后一个元素。
- **`shift()`**：删除并返回数组的第一个元素。
- **`unshift()`**：向数组开头添加一个或多个元素，并返回新的长度。
- **`splice()`**：可以在任意位置添加或删除元素。它能够影响原数组，并返回被删除的元素组成的数组。
- **`sort()`**：对数组元素进行排序，默认按字符串升序排列。可以传入一个比较函数来指定排序规则。
- **`reverse()`**：颠倒数组中元素的顺序。
- **`fill()`**：用静态值填充数组中的元素，可指定起始和结束位置。
- **`copyWithin()`**：浅复制数组的一部分到同一数组的另一个位置，并返回修改后的数组。不会改变数组的长度
```js
let arr = [1, 2, 3, 4];
arr.copyWithin(0, 2);
// 原数组 `[1, 2, 3, 4]` 变为了 `[3, 4, 3, 4]`，因为 `[3, 4]` 被复制到了数组的开头，覆盖了原先的 `[1, 2]`，而原始数组中的 `[3, 4]` 保持不变。
console.log(arr); // 输出: [3, 4, 3, 4]
```

## Array.from()
将参数对象转换为数组,不改变原对象，而是返回一个新的数组对象。对象的要求:
```js
Array.from(arrayLike, mapFn, thisArg)
```
arrayLike 对象
>1.  拥有 length 属性
>2. 可迭代对象,即必须要有[Symbol.iterator]接口的数据类型结构 例如：Set，Map,NodeList，字符串等

参数介绍:
>1. (必需) 要转化为数组的对象。
>2. (可选) 类似于 map 方法，即对于每个元素进行的处理，并会在处理后放入返回的新的数组中
>3. (可选) 用来绑定执行第二参数方法时的this指向.

```js
Array.from({length: 5}) // [undefined, undefined, undefined, undefined, undefined]

let a = {0: '1', 1: '2', 2: '3', 'length': 3};
let arr = Array.from(a); //['1','2','3']

// 字符串
let arr = Array.from('array'); //['a','r','r','a','y']

// Set
Array.from(new Set([1, 2])) // [1, 2]

// Map
Array.from(new Map([[1,2],[3,4],[5,6]])) // [[1,2], [3,4],[5,6]]

// 测试第二个参数
Array.from([1,2,3], x => ++x); // [2,3,4]
```

## splice() 添加/删除/替换 
会改变原数组
```js
arr.splice(index, num, item1, item2, ...);
```

参数介绍:
> 1. index(必需): 一个整数，用来指定添加/删除元素的位置，可以使用负数来从尾部开始数。
> 2. num(可选): 删除的元素数量，若不想删除，设置为0即可。
> 3. item1,item2....(可选): 向数组添加的元素.

### 添加
```js
const a = [1]
const a1 = a.splice(1, 0, 2) //  []
// a 为 [1, 2]

const a = [1, 3, 3]
// 从直接
const a1 = a.splice(-1, 0, 8) //  []
// a 为 [1, 3, 8, 3] 注意，是从最后一位开始向前添加元素，所以 8 在 3 前。


```

### 删除元素
``` js
let a = [1, 2, 3, 4, 5]; // 删除 a 的前三个元素 let before = arr.splice(0, 3); //[1, 2, 3] // 此时 a 为 [4, 5] // 删除 a 的最后一位元素 
let after = a.splice(-1, 1); //[5], 注意，此时最后一位之后只有一个元素，后一位不管写多大都只会是最后一位元素被删除并返回 
// 此时 a 为 [4]
```

### 替换
替换就是删除加添加的操作
```js
const a = [1,2,3]
const b = a.splice(0, 1, 4) // [1] 返回被替换的元素1
// a 为 [4, 2, 3]

// 支持同时替换多个元素
let arr = [1,2,3,4,5];
let arrAddAndDelete = arr.splice(0,2,100, 1999); //[1,2]
console.log(arr); // [100, 1999, 3, 4, 5]
```

## slice 浅拷贝数组
不改变原数组
参数:
> 1. start(可选): 开始复制的索引位置，负值表示从尾部向前，默认值为0。
> 2. end(可选): 结束复制的索引位置，复制到它的前一个元素，负值表示从尾部向前，默认值为数组长度。
返回值: 复制后的新数组

```js
// 简单数据类型
let a = [1,2,3];
let b = a.slice(0,2); 
console.log(a,b); //[1,2,3] [1,2]

// 复杂数据类型，还是引用的同一个对象
let a = [{id:1,num:5}];
let b = a.slice();
```

## concat() 连接合并多个数组，返回新数组。
不改变原数组

```js
arr.concat(arr1,arr2,arr3);
```
参数: arr1,arr2,arr3: 需要合并的数组，也可以直接为值。
返回值：合并后的新数组。
```js
let arr = [1,2,3]; let arr1 = [4,5];
let afterArr = arr.concat(arr1); 
console.log(afterArr); //[1, 2, 3, 4, 5] 
console.log(arr); //[1, 2, 3] 
console.log(arr1); //[4, 5]
```
关于合并数组我们还可以使用 `...` ES6 提供的扩展运算符来合并, 也是浅拷贝
```js
let arr = [1,2,3];
let arr1 = [...arr,4,5]; // [1,2,3,4,5]
```

## find() / findIndex() 根据条件找到数组成员 es6
```js
arr.find(function(value, index, arr), this);
```
参数:
> 1. value(必须): 当前遍历时的数组值。
> 2. index(可选): 当前遍历时的索引值。
> 3. arr(可选): 数组对象本身。
> 4. this(可选): 执行回调函数时的。

返回值： find()返回第一个符合条件的数组成员，若不存在返回`undefined`。
findIndex() 方法返回数组中满足提供的测试函数的第一个元素的索引。若没有找到对应元素则返回 -1。

``` js
let arr = [{age: 1}, {age: 2}, {age: 3}];
let result1 = arr.find((value) => value.age > 2); 
console.log(result1);// {age: 3}
let result2 = arr.findIndex((value) => value.age > 2);
console.log(result2); // 2
```

## flat()深度遍历展开数组
```js
arr.flat(depth);
```
参数: depth(可选): 提取嵌套数组的结构深度，默认为1。
返回值：展开后的新数组。
```js
let arr = [1,2,[3,4,[5,6]]] 
let one = arr.flat(); 
console.log(one); //默认值为1， 所以只能展开一层嵌套 [1,2,3,4,[5,6]] 
let two = arr.flat(2); console.log(two); //[1,2,3,4,5,6] 
// 若不清楚有多少层嵌套，可以直接用 Infinity 设置，就可全部展开 
let inf = arr.flat(Infinity); 
console.log(inf); //[1,2,3,4,5,6] 
// flat方法会移除数组中的空白项
let arr2 = [1,2,3,,null, 5, undefined];
console.log(arr2.flat()); //[1, 2, 3, null, 5, undefined]
```
