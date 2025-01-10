---
title: 微前端 | 乾坤 | single-spa
date: "2024-05-27"
categories: code
tags:
cover: https://upyun.afunny.top/202501102238926.png
---

## 背景

现代的前端应用的发展趋势正在变得越来越富功能化，富交互化。在一个团队中维护的前端项目，随着时间推进，会变得越来越庞大，越来越难以维护。所以我们给这种应用起名为巨石单体应用。微前端的概念是由ThoughtWorks在2016年提出的，它借鉴了微服务的架构理念，核心在于将一个庞大的前端应用**拆分**成多个独立灵活的小型应用，每个应用都可以独立开发、独立运行、独立部署，再将这些小型应用**融合**为一个完整的应用。

![](https://upyun.afunny.top/202501102345859.png)

反观后端技术的发展趋势，从最初的前后端混合开发到前后端分离再到现在的微服务拆分。原本臃肿的后端服务在以垂类方向拆分之后变得清晰易维护。

# 微前端特点

- 技术栈无关

主框架不限制接入应用的技术栈，微应用具备完全自主权

- 独立开发、独立部署

微应用仓库独立，前后端可独立开发，部署完成后主框架自动完成同步更新

- 增量升级

在面对各种复杂场景时，我们通常很难对一个已经存在的系统做全量的技术栈升级或重构，而微前端是一种非常好的实施渐进式重构的手段和策略

- 独立运行时

每个微应用之间状态隔离，运行时状态不共享

![](https://upyun.afunny.top/202501102346593.png)

## 常见的微前端方案

### iframe

iframe是html提供的标签，能加载其他web应用的内容，并且它能兼容所有的浏览器，因此，你可以用它来加载任何你想要加载的web应用。

不足：

- 不是单页应用，会导致浏览器刷新 iframe url 状态丢失、后退前进按钮无法使用。

- 弹框类的功能无法应用到整个大应用中，只能在对应的窗口内展示。

- 每次子应用进入都是一次浏览器上下文重建、资源重新加载的过程，占用大量资源的同时也在极大地消耗资源。

### Web Components

Web Component 是一套不同的技术，允许你创建可重用的定制元素（它们的功能封装在你的代码之外）并且在你的 web 应用中使用它们。它由三项主要技术组成：

- Custom elements（自定义元素）：一组JavaScript API，允许您定义custom elements及其行为，然后可以在您的用户界面中按照需要使用它们。
- Shadow DOM（影子DOM）：一组JavaScript API，用于将封装的“影子”DOM树附加到元素（与主文档DOM分开呈现）并控制其关联的功能。示例：video标签。
- HTML templates（HTML模板）： ```<template>``` 和 ```<slot>``` 元素使您可以编写不在呈现页面中显示的标记模板。然后它们可以**作为自定义元素结构的基础被多次重用**。

基于web components的框架有[microApp](https://zeroing.jd.com/)。通过CustomElement结合自定义的ShadowDom，将微前端封装成一个类WebComponent组件。

```jsx
<micro-app name='app1' url='http://localhost:3000/' baseroute='/my-page'></micro-app>
```

不足：Web Components是浏览器的新特性，所以它的兼容性不是很好，如果有兼容性要求的项目还是无法使用。

### webpack5 Module Federation

![](https://upyun.afunny.top/202501102346242.png)

- 一个使用 ModuleFederationPlugin 构建的应用就是一个 Container，它可以加载其他的 Container，也可以被其他的 Container 加载。
- 提从消费者和生产者的角度看 Container，Container 可以分为 Host 和 Remote，Host 作为消费者，他可以动态加载并运行其他 Remote 的代码。
- shared 表示共享依赖，一个应用可以将自己的依赖共享出去，比如 react、react-dom、mobx等，其他的应用可以直接使用共享作用域中的依赖从而减少应用的体积。

```jsx
// 以下为webpack配置文件片段
// 服务提供方
Remoteplugins: [
    new ModuleFederationPlugin({
        name: 'component_app',
        filename: 'remoteEntry.js',
        exposes: {
            './Button': './src/Button.jsx',
            './Dialog': './src/Dialog.jsx',
            './Logo': './src/Logo.jsx',
            './ToolTip': './src/ToolTip.jsx',
        },
        shared: {
            react: {
                singleton: true
            },
            'react-dom': {
                singleton: true
            }
        },
    })]
// 服务消费方 
Hostplugins: [new ModuleFederationPlugin({
    name: 'main_app',
    remotes: {
        'component-app': 'component_app@http://localhost:3001/remoteEntry.js',
    },
    shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
    },
})],
```

该方案的代表实现 [EMP](https://emp2.netlify.app/)

### sigle-spa

Single-spa 是一个将多个单页面应用聚合为一个整体应用的 JavaScript 微前端框架， 提供生命周期，并负责调度子应用的生命周期。监听url 变化，url 变化时匹配对应子应用，并执行生命周期流程。而乾坤在single-spa的基础上主要做了资源的加载和应用之间的隔离。

- 基于 **[single-spa](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2FCanopyTax%2Fsingle-spa)** 封装，提供了更加开箱即用的 API。
- 技术栈无关，任意技术栈的应用均可 使用/接入，不论是 React/Vue/Angular/JQuery 还是其他等框架。
- **HTML Entry 接入方式**，让你接入微应用像使用 iframe 一样简单。
- 样式隔离，确保微应用之间样式互相不干扰。
- **JS 沙箱**，确保微应用之间 全局变量/事件 不冲突。
- 资源预加载，在浏览器空闲时间预加载未打开的微应用资源，加速微应用打开速度。

| 微前端方案 | 特点 | 缺点 | 框架 |
| --- | --- | --- | --- |
| iframe | 天生隔离样式与脚本、多页 | 不是单页应用，会导致浏览器刷新 iframe url 状态丢失、后退前进按钮无法使用 / 弹框类的功能无法应用到整个大应用中，只能在对应的窗口内展示 / 每次子应用进入都是一次浏览器上下文重建、资源重新加载的过程，占用大量资源的同时也在极大地消耗资源 | 腾讯 无界 |
| Web Components | 天生隔离样式与脚本 | 无法兼容所有浏览器 | 京东microApp |
| Module Federation | JS Entry 接入方式 / 子应用依赖解耦 / 应用间去中心化的调用、共享模块； | 目前无法涵盖所有框架 | 欢聚时代 EMP |
| sigle-spa | HTML Entry 接入方式 / 资源预加载 | js 沙箱在某些场景下执行性能下降严重 | single-spa/ 蚂蚁金融 qiankun |

**由于乾坤以14.8k的start稳居第一，接下来，我们就以乾坤为例，配合demo来了解它的主要原理。**

## 前置准备

### CustomEvent 自定义事件

```jsx
<script>
    // 示例 1
    // 监听cat 事件
    window.addEventListener("cat", function (e) {
        console.log(e.detail, "index-13"); // {isSunny: true} 'index-13'
    });

    // 定义事件
    var event = new CustomEvent("cat", {
        detail: {
            isSunny: true,
        },
    });
    // 触发事件
    window.dispatchEvent(event);
    
    // 示例 2
    // 1s之后触发 PopStateEvent {isTrusted: true, state: null, type: 'popstate'... 'index-23'
    window.addEventListener("popstate", function (e) {
        console.log(e, "index-23");
    });

    setTimeout(() => {
        window.history.pushState({ state: "state" }, "detail", "/detail");
        // 此时会触发popstate事件
        history.back();
    }, 1000);
</script>
```

### js沙箱

要实现一个沙箱，其实就是去制定一套程序执行机制，在这套机制的作用下沙箱内部程序的运行不会影响到外部程序的运行。而微前端要加载多个子应用，为了避免子应用相互影响或者影响到基座应用，需要用到js沙箱隔离。

**快照沙箱**

```jsx
// qiankun/src/sandbox/snapshotSandbox.ts
/**
 * 基于diff
 * 基本思想，激活开始时保存window的现有属性
 * 失活时候跟最开始保存的快照对比，找出新增属性，保存并从window上清除
 * 重新激活时候，恢复上一次改动过的属性
 */
export default class SnapshotSandbox {
    modifyPropsMap = {}; // 沙箱激活过程中，进行的变更
    windowSnapshot; // 改动前window的快照
    sandboxRunning = false; // 当前沙箱的状态

    active() {
        this.windowSnapshot = {};
        iter(window, (prop) => {
            this.windowSnapshot[prop] = window[prop];
        });

        // 如果是重新激活，就恢复上一次的修改
        iter(this.modifyPropsMap, (prop) => {
            window[prop] = this.modifyPropsMap[prop]
        })
        this.sandboxRunning = true;
    }

    inactive() {
        iter(window, (prop) => {
            if (window[prop] !== this.windowSnapshot[prop]) {
                // 保存激活期间，window上修改的属性。以便下次激活时候恢复
                this.modifyPropsMap[prop] = window[prop];
                window[prop] = this.windowSnapshot[prop];
            }
        })
        this.sandboxRunning = false;
    }
}
```

问题：**最终变动在window对象上**，如果存在多个子应用会相互影响。**需要遍历window对象**，比较耗时。

**基于proxy的单应用沙箱**

```jsx
// qiankun/src/sandbox/legacy/sandbox.ts
/**
 * 基于 Proxy 实现的沙箱
 * TODO: 为了兼容性 singular 模式下依旧使用该沙箱，等新沙箱稳定之后再切换
 */
export default class LegacySandbox implements SandBox {
  /** 沙箱期间新增的全局变量 */
  private addedPropsMapInSandbox = new Map();
  // 沙箱期间更新的全局变量，本来就在window上，然后被修改的变量
  private modifiedPropsOriginalValueMapInSandbox = new Map();
  /** 持续记录更新的(新增和修改的)全局变量的 map，用于在任意时刻做 snapshot */
  private currentUpdatedPropsValueMap = new Map();

  // 更新window上的对象， 新增，更新，或删除
  private setWindowProp(prop: PropertyKey, value: any, toDelete?: boolean) {}

  active() {
   // 恢复上次激活期间造成的变更（新增和更新的属性）
    if (!this.sandboxRunning) {
      this.currentUpdatedPropsValueMap.forEach((v, p) => this.setWindowProp(p, v));
    }
    this.sandboxRunning = true;
  }

  inactive() {
    // 失活时候恢复window上的属性，如果是更新的就恢复原始值，如果是新增呢的就直接删掉
    this.modifiedPropsOriginalValueMapInSandbox.forEach((v, p) => this.setWindowProp(p, v));
    this.addedPropsMapInSandbox.forEach((_, p) => this.setWindowProp(p, undefined, true));
    this.sandboxRunning = false;
  }

  constructor(name: string, globalContext = window) {
    // 保存window最初始的状态
    const rawWindow = globalContext;
    // 生成代理对象原对象
    const fakeWindow = Object.create(null) as Window;

    /**
     每次set代理对象的时候，整理三个map对象的值。
     整体思路是
     1 如果window不存在存入addedPropsMapInSandbox，
     2 如果当前 window 对象存在该属性，且 record map 中未记录过，则记录该属性初始值
     3 所有的变动都在currentUpdatedPropsValueMap保存一份
     4 更新到window上
     */
    const setTrap = (p: PropertyKey, value: any, originalValue: any, sync2Window = true) => {};

    const proxy = new Proxy(fakeWindow, {
      set: (_: Window, p: PropertyKey, value: any): boolean => {
        const originalValue = (rawWindow as any)[p];
        return setTrap(p, value, originalValue, true);
      },

      get(_: Window, p: PropertyKey): any {
        // 避免使用window.window,或者window.self 造成沙箱逃逸
        // 可以使用window.top !== window 判断是否是微前端环境
        if (p === 'top' || p === 'parent' || p === 'window' || p === 'self') {
          return proxy;
        }

        const value = (rawWindow as any)[p];
        return getTargetValue(rawWindow, value);
      },
    });
    this.proxy = proxy;
  }
}
```

通过proxy代理实现，在代理对象set的时候，记录变更。保存在三个Map中，保证在active时候，恢复子应用的变更，在inactive时候，清除变更。跟快照方式对应的优势在于，恢复或者清除的时候不用遍历整个window对象。但是单应用的proxy**最终操作的也是window对象**，所以不支持多个子应用同时加载。

**基于proxy的多应用沙箱**

基于proxy实现，变动存放在proxy的对象上，完全不存在状态恢复的逻辑，同时也不需要记录属性值的变化，因为所有的变化都是沙箱内部的变化，和window没有关系，window上的属性至始至终都没有受到过影响。

```jsx
// qiankun/src/sandbox/proxySandbox.ts
class ProxySandBox{
    proxy;
    isRunning = false;
    active(){
        this.isRunning = true;
    }
    inactive(){
        this.isRunning = false;
    }
    constructor(){
        const fakeWindow = Object.create(null);
        this.proxy = new Proxy(fakeWindow,{
            set:(target, prop, value, receiver)=>{
                if(this.isRunning){
                    target[prop] = value;
                }
            },
            get:(target, prop, receiver)=>{
                return  prop in target ? target[prop] : window[prop];
            }
        });
    }
}
```

真实的实现里，做了很多保证('window', 'self', 'globalThis', 'hasOwnProperty'复制一份到proxy对象上)，来为了防止沙箱逃逸，解释来说就是绕过代理对象，直接对window对象做操作，比如使用 window.window or window.self等。

总结：这三种创建沙箱的方式，是乾坤目前在用的。判断系统支持proxy会优先使用proxy模式。但其实多应用的proxy，也是支持单应用的， 但是因为历史原因还在同时使用。

三种方式都导出了 inactive, active, proxy代理对象。抹平了差异。

沙箱对象创建出来了，是怎么用的呢？

## 乾坤

In Chinese, `qian(乾)` means heaven and `kun(坤)` earth. `qiankun` is the universe.

![](https://upyun.afunny.top/202501102346943.png)

以上是乾坤的主要流程图，主要包含三个部分，乾坤本身，single-spa和import-html-entry。三部分有各自的分工。

乾坤：维护所有的子路由，维护子路由的注册，项目的启动，加载子应用（js沙箱的创建，沙箱状态的维护）。

single-spa：维护子应用的注册，监听路由变化，切换子应用（下载，挂载，卸载等事件）。

import-html-entry：以html为入口，去请求资源的方法。主要内容是，请求远端的html资源，解析html资源获取html模版，css，js。

### registerMicroApps() 注册子应用

```jsx
// qiankun/src/apis.js
// 子应用注册函数
import { registerApplication } from 'single-spa';

export function registerMicroApps<T extends ObjectType>(
  apps: Array<RegistrableApp<T>>,
  lifeCycles?: FrameworkLifeCycles<T>,
) {
  const unregisteredApps = apps.filter((app) => !microApps.some((registeredApp) => registeredApp.name === app.name));
  microApps = [...microApps, ...unregisteredApps];

  unregisteredApps.forEach((app) => {
    const { name, activeRule, loader = noop, props, ...appConfig } = app;

    registerApplication({
      name,
      app: async () => {
        loader(true);
        // 等待主应用启动完成
        await frameworkStartedDefer.promise;

        const { mount, ...otherMicroAppConfigs } = (
          await loadApp({ name, props, ...appConfig }, frameworkConfiguration, lifeCycles)
        )();

        // 暴露生命周期方法，mount, unmount, bootstrap等
        return {
          mount: [async () => loader(true), ...toArray(mount), async () => loader(false)],
          ...otherMicroAppConfigs,
        };
      },
      activeWhen: activeRule,
      customProps: props,
    });
  });
}
```

注册入口，首先检查是否注册过，没有注册的再来开启注册。注册时候调用single-spa的registerApplication方法，传入子应用需要的的参数，如名称，加载方法，路由，自定义参数。在子应用加载时候会触发app方法，这里主要的事件处理在loadApp方法。

### loadApp()加载子应用

该部分所有的代码片段都是loadApp()的内容。

**根据传入的html地址下载资源**

```jsx
// qiankun/src/loader.ts
import { importEntry } from 'import-html-entry';

/**
* template: 一个字符串，内部包含了html、css资源
* execScripts：一个函数，执行该函数后会返回一个对象
* assetPublicPath：访问页面远程资源的相对路径
* getExternalScripts：获取所有外链js的内容
*/
const { template, execScripts, assetPublicPath, getExternalScripts } = await importEntry(entry, importEntryOpts);

// 给子应用模版增加最外层的父元素，保证每个子应用只有一个节点。
const appContent = getDefaultTplWrapper(appInstanceId, sandbox)(template);
// 将html字符串转化为DOM节点
let initialAppWrapperElement = createElement(
    appContent,
    strictStyleIsolation,
    scopedCSS,
    appInstanceId,
);

// 调用 appendChild 挂载子应用
render({ element: initialAppWrapperElement, loading: true, container: initialContainer }, 'loading');
```

调用了import-html-entry导出的importEntry方法， 请求传入的html入口地址，解析地址，然后导出template， execScripts，getExternalScripts等数据。可以看到这个库主要是做了资源的下载，和整理。

import-html-entry具体是怎么处理下载的资源呢？

**创建js沙箱对象**

```jsx
// qiankun/src/loader.ts
// 创建JS沙箱
sandboxContainer = createSandboxContainer(
    appInstanceId,
    initialAppWrapperGetter,
    scopedCSS,
    useLooseSandbox,
    excludeAssetFilter,
    global,
    speedySandbox,
);
// 用沙箱的代理对象作为接下来使用的全局对象
global = sandboxContainer.instance.proxy;

export function createSandboxContainer() {
  let sandbox: SandBox;
  // 判断使用哪种沙箱类型
  if (window.Proxy) {
    sandbox = useLooseSandbox
      ? new LegacySandbox(appName, globalContext)
      : new ProxySandbox(appName, globalContext, { speedy: !!speedySandBox });
  } else {
    sandbox = new SnapshotSandbox(appName);
  }
}
```

乾坤选择三种沙箱的逻辑，如果系统不支持proxy，使用SnapshotSandbox，否则使用proxy的沙箱。沙箱创建的具体逻辑在上面前置准备部分里。

**执行execScripts**

```jsx
// qiankun/src/loader.ts
// 该方法是import-html-entry导出，传入沙箱代理对象，并执行了解析出来的script
const scriptExports: any = await execScripts(global, sandbox && !useLooseSandbox, {
    scopedGlobalVariables: speedySandbox ? cachedGlobals : [],
});

// 导出子应用挂载在全局上的方法，也就是bootstrap, mount, unmount
const { bootstrap, mount, unmount, update } = getLifecyclesFromExports(
    scriptExports,
    appName,
    global,
    sandboxContainer?.instance?.latestSetProp,
);
```

这里的execScripts也先不做展开，这里可以看到我们把js沙箱创建出来的对象globel，传进去了，等到后面讲到import-html-entry,再来展开。

**返回生命周期方法**

这个生命周期方法包含了，沙箱导出的生命周期方法，子应用的生命周期方法。 这里导出的方法，也就是reroute里调用的生命周期方法了。

```jsx
// qiankun/src/loader.ts
const parcelConfigGetter = (remountContainer = initialContainer) => {
    let appWrapperElement;
    let appWrapperGetter;
    
    const parcelConfig = {
        name: appInstanceId,
        bootstrap,
        mount: [
            // 激活沙箱
            mountSandbox,
            // 这个mount是子应用导出的mount
            async (props) => mount({ ...props, container: appWrapperGetter(), setGlobalState, onGlobalStateChange }),
            // 执行dom的挂载
            async () => render({ element: appWrapperElement, loading: false, container: remountContainer }, 'mounted'),
        ],
        unmount: [
            // 执行子应用到出的 unmount 事件
            async (props) => unmount({ ...props, container: appWrapperGetter() }),
            // inactive sandbox
            unmountSandbox,
            async () => {
                // 这里真正做了子应用的卸载
                render({ element: null, loading: false, container: remountContainer }, 'unmounted');
            },
        ],
    };
    return parcelConfig;
};
```

总结loadApp的逻辑，首先调用import-html-entry获取子应用入口html对应的资源，有HTML，JS，CSS，HTML是带有DOM字符串和所有的css（外链转内联），然后创建沙箱对象，最后执行返回的js，并把沙箱对象传进去，最后返回子应用的生命周期方法。在路由切换时候调用。

### Start启动应用

调用single-spa 的start方法，启动应用。

```jsx
// qiankun/src/loader.ts
import { start as startSingleSpa } from 'single-spa';

export function start(opts: FrameworkConfiguration = {}) {
  startSingleSpa({ urlRerouteOnly });

  frameworkStartedDefer.resolve();
}
```

frameworkStartedDefer，在子应用load的时候会等待这个promise的完成。是一个将promise拆分的用法。

## single-spa

### 路由初始化

![](https://upyun.afunny.top/202501102346488.png)

**监听hashchange， popstate 路由切换**

```jsx
// single-spa/src/navigation/navigation-events.js
window.addEventListener("hashchange", urlReroute);
window.addEventListener("popstate", urlReroute);
```

监听路由切换事件，执行路由切换后的资源移除，挂载（rerout里的逻辑）。

**劫持监听事件**

```jsx
// single-spa/src/navigation/navigation-events.js
export const routingEventsListeningTo = ["hashchange", "popstate"];

const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

window.addEventListener = function (eventName, fn) {
  if (typeof fn === "function") {
    if (
      routingEventsListeningTo.indexOf(eventName) >= 0 &&
      !find(capturedEventListeners[eventName], (listener) => listener === fn)
    ) {
      capturedEventListeners[eventName].push(fn);
      return;
    }
  }
  return originalAddEventListener.apply(this, arguments);
};
```

将原始的window.addEventListener和window.removeEventListner 保存起来，然后对这两个监听函数进行重写。 如果将要监听的事件是hashchange或popstate，则将相应的回调函数保存在一个数组中， 待合适的时机进行批量执行，同时监听函数返回。如果所要监听的函数不是hashchange或popstate，则调用原始的window.addEventListener或window.removeEventListner 注册对应的监听事件。

**劫持history API，重写pushState，replaceState**

```jsx
// single-spa/src/navigation/navigation-events.js
// 向浏览器的会话历史栈增加了一个条目（新增一个条目）
window.history.pushState = patchedUpdateState(window.history.pushState, "pushState");
// 修改浏览器的会话历史栈当前历史记录实体（替换当前）
window.history.replaceState = patchedUpdateState(window.history.replaceState, "replaceState");
function patchedUpdateState(updateState, methodName) {
    return function () {
        // 变更前的地址    
        const urlBefore = window.location.href;
        const result = updateState.apply(this, arguments);
        // 变更后的地址    
        const urlAfter = window.location.href;
        if (!urlRerouteOnly || urlBefore !== urlAfter) {
            if (isStarted()) {
                // 主动触发 popstate 事件        
                window.dispatchEvent(
                    createPopStateEvent(window.history.state, methodName));
            } else { reroute([]); }
        } return result;
    };
}
// 创建popstate事件，这样在执行pushState和replaceState的时候也会触发popstate事件了。
function createPopStateEvent(state, originalMethodName) {
    let evt; try {
        evt = new PopStateEvent("popstate", { state });
    } catch (err) {
        // IE 11     
        evt = document.createEvent("PopStateEvent"); evt.initPopStateEvent("popstate", false, false, state);
    }
    // 往event上增加属性，触发的时候会带过去 
    evt.singleSpa = true;
    evt.singleSpaTrigger = originalMethodName;
    return evt;
}
```

在使用 **window.history** 时，如果执行 **pushState(repalceState)** 方法，是不会触发 **popstate** 事件的，而 **single-spa** 通过一种巧妙的方式，实现了执行 **pushState(replaceState)** 方法可触发 **popstate** 事件。

这样在页面操作，就会触发跳转 window.history.pushState({}, "", "/react16")。

### reroute()

处理路由切换事件的核心方法。

![](https://upyun.afunny.top/202501102346218.png)

![](https://upyun.afunny.top/202501102347355.png)

single-spa的子应用切换都是依赖子应用的当前状态，所以在流转的每一步都会对应不同的状态。上面的两个图，左边的的一次路由的过程，其中伴随着状态的流转，右图是主要的状态流转方向，可以作为理解参考。

**入口核心逻辑**

```jsx
//single-spa/src/navigation/reroute.js
// 路由变化执行的方法
export function reroute(pendingPromises = [], eventArguments) {
  // 记录是否有应用正在变更，等到一次reroute执行完了以后，再来处理缓存的变更。主要是重新触发一次reroute
  if (appChangeUnderway) {
    return new Promise((resolve, reject) => {
      peopleWaitingOnAppChange.push({
        resolve,
        reject,
        eventArguments,
      });
    });
  }

  const {
    appsToUnload,
    appsToUnmount,
    appsToLoad,
    appsToMount,
  } = getAppChanges();
  // 此处省略许多代码...
  if (isStarted()) {
    // 此处省略一些代码...
    appsThatChanged = appsToUnload.concat(
      appsToLoad,
      appsToUnmount,
      appsToMount
    );
    return performAppChanges();
  } else {
    appsThatChanged = appsToLoad;
    return loadApps();
  }
  // 此处省略许多代码...
}
```

**getAppChanges()**

根据子应用的状态来分组。

```jsx
//single-spa/src/applications/apps.js
/**
 * 根据子应用的状态将应用分为四类
 * @returns appsToUnload = [], 
 * appsToUnmount = [], 需要卸载的
 * appsToLoad = [], 需要加载的
 * appsToMount = []; 需要挂载的
 */
export function getAppChanges() {
  const appsToUnload = [],
    appsToUnmount = [],
    appsToLoad = [],
    appsToMount = [];

  // We re-attempt to download applications in LOAD_ERROR after a timeout of 200 milliseconds
  const currentTime = new Date().getTime();

  apps.forEach((app) => {
    // 当前路由对应的子应用为激活状态
    const appShouldBeActive =
      app.status !== SKIP_BECAUSE_BROKEN && shouldBeActive(app);

    switch (app.status) {
      // 加载失败, >200ms 重试
      case LOAD_ERROR:
        if (appShouldBeActive && currentTime - app.loadErrorTime >= 200) {
          appsToLoad.push(app);
        }
        break;
      case NOT_LOADED:
      case LOADING_SOURCE_CODE:
        if (appShouldBeActive) {
          appsToLoad.push(app);
        }
        break;
      case NOT_BOOTSTRAPPED:
      case NOT_MOUNTED:
        // 未挂载状态，在需要卸载的list里
        if (!appShouldBeActive && getAppUnloadInfo(toName(app))) {
          appsToUnload.push(app);
        } else if (appShouldBeActive) {
          appsToMount.push(app);
        }
        break;
      case MOUNTED:
        // 挂载状态且不是当前访问的都归为卸载
        if (!appShouldBeActive) {
          appsToUnmount.push(app);
        }
        break;
    }
  });

  return { appsToUnload, appsToUnmount, appsToLoad, appsToMount };
}
```

shouldBeActive, 判断当前子应用是否是激活状态。这个方法会多次调用到，只去挂载当前激活状态的应用。也只有一个应用是激活状态。

```jsx
//single-spa/src/applications/app.helpers.js
// 拿当前的路由地址判断，应该渲染什么子应用
export function shouldBeActive(app) {
  try {
    return app.activeWhen(window.location);
  } catch (err) {
    handleAppError(err, app, SKIP_BECAUSE_BROKEN);
    return false;
  }
}
```

**loadApps()**

当前应用处于未启动状态，初始化子应用。

```jsx
//single-spa/src/navigation/reroute.js
  function loadApps() {
    return Promise.resolve().then(() => {
      const loadPromises = appsToLoad.map(toLoadPromise);

      return (
        Promise.all(loadPromises)
          .then(callAllEventListeners)
          .then(() => [])
      );
    });
  }
```

toLoadPromise，这个方法里会调用乾坤传入的封装的import-html-entry 的下载资源的方法，把子应用的资源下载到本地。另外重新整理了子应用的生命周期方法，在路由切换的时候调用。此时的应用状态更新为NOT_BOOTSTRAPPED。

```jsx
//single-spa/src/lifecycles/load.js
export function toLoadPromise(app) {
  return Promise.resolve().then(() => {
    app.status = LOADING_SOURCE_CODE;
    let appOpts, isUserErr;
    return (app.loadPromise = Promise.resolve()
      .then(() => {
        const loadPromise = app.loadApp(getProps(app));
        return loadPromise.then((val) => {
          appOpts = val;
          // 这里的事件,就是乾坤的load函数导出的事件，single-spa重新包装一下，自己内部用
          app.status = NOT_BOOTSTRAPPED;
          app.bootstrap = flattenFnArray(appOpts, "bootstrap");
          app.mount = flattenFnArray(appOpts, "mount");
          app.unmount = flattenFnArray(appOpts, "unmount");
          app.unload = flattenFnArray(appOpts, "unload");
          app.timeouts = ensureValidAppTimeouts(appOpts.timeouts);
          return app;
        });
      }));
  });
}
```

**performAppChanges()**

应用启动后，每次路由切换都会触发的方法。主要做了子应用的卸载，和当前子应用的挂载逻辑。首先**卸载掉该卸载的, 挂载该挂载的**。

**appsToUnmount 卸载该卸载的**

```jsx
//single-spa/src/lifecycles/load.js
// 首先卸载掉该卸载的
const unmountUnloadPromises = appsToUnmount.map(toUnmountPromise).map((unmountPromise) => unmountPromise.then(...));

//single-spa/src/lifecycles/unmount.js
export function toUnmountPromise(appOrParcel, hardFail) {
  return Promise.resolve().then(() => {
    appOrParcel.status = UNMOUNTING;
    let parcelError;
    return Promise.all(unmountChildrenParcels)
      .then(unmountAppOrParcel, (parcelError) => {
        // There is a parcel unmount error
        return unmountAppOrParcel().then(() => {});
      })
      .then(() => appOrParcel);

    function unmountAppOrParcel() {
      return reasonableTime(appOrParcel, "unmount")
        .then(() => {...})
    }
  });
}
```

**reasonableTime 方法，根据传入的生命周期字符串，执行对应的生命周期方法。**同时有超时处理（需要手动开启）。默认bootstrap 4s超时，mount， unmount... 等3s超时。超时会触发promise的reject事件。外层调用的地方，处理失败的情况，更新子应用对应的状态。下面会多次用到这个方法， 这里提前解释说明。

```jsx
//single-spa/src/applications/timeouts.js
export function reasonableTime(appOrParcel, lifecycle) {
  const timeoutConfig = appOrParcel.timeouts[lifecycle];
  const warningPeriod = timeoutConfig.warningMillis;
  const type = objectType(appOrParcel);

  return new Promise((resolve, reject) => {
    // 执行子应用注册时候挂载的事件，比如bootstrap，mount，unmount
    appOrParcel[lifecycle](getProps(appOrParcel))
      .then((val) => {
        finished = true;
        resolve(val);
      })
      .catch((val) => {
        finished = true;
        reject(val);
      });

    // 处理超时异常情况
    setTimeout(() => maybeTimingOut(1), warningPeriod);
    setTimeout(() => maybeTimingOut(true), timeoutConfig.millis);

    // 超时逻辑（需要手动开启），promise里如果在一定时间内没有触发resolve事件，就会触发reject事件。也就是超时操作。
    function maybeTimingOut(shouldError) {}
  });
}
```

**appsToLoad 挂载该挂载的**

```jsx
//single-spa/src/navigation/reroute.js
const loadThenMountPromises = appsToLoad.map((app) => {
    // toLoadPromise在上面应用未启动的时候已经讲过了，主要是做了资源的获取。
    return toLoadPromise(app).then((app) =>
        tryToBootstrapAndMount(app, unmountAllPromise)
    );
});

function tryToBootstrapAndMount(app, unmountAllPromise) {
  // 找到当前应该激活的子应用
  if (shouldBeActive(app)) {
    return toBootstrapPromise(app).then((app) =>
      // 保证卸载完成，再来执行挂载操作
      unmountAllPromise.then(() =>
        shouldBeActive(app) ? toMountPromise(app) : app
      )
    );
  } else {
    return unmountAllPromise.then(() => app);
  }
}
```

上文中的tryToBootstrapAndMount主要做了两件事情，1 保证卸载的组件卸载完成， 2 挂载新的子应用。

toBootstrapPromise，触发子应用的bootstrap事件。

```jsx
//single-spa/src/lifecycles/mount.js
export function toBootstrapPromise(appOrParcel, hardFail) {
  return Promise.resolve().then(() => {
    appOrParcel.status = BOOTSTRAPPING;
    return reasonableTime(appOrParcel, "bootstrap")
      .then(successfulBootstrap)
      .catch((err) => {});
  });

  function successfulBootstrap() {
    appOrParcel.status = NOT_MOUNTED;
    return appOrParcel;
  }
}
```

toMountPromise, 主要是调用reasonableTime执行mount操作。

```jsx
//single-spa/src/lifecycles/mount.js
export function toMountPromise(appOrParcel, hardFail) {
  return Promise.resolve().then(() => {
    return reasonableTime(appOrParcel, "mount")
      .then(() => {
        appOrParcel.status = MOUNTED;
        return appOrParcel;
      })
      .catch((err) => {});
  });
}
```

### 自定义事件

在路由导航的不同阶段以及应用的不同状态处理中，single-spa会派发不同的事件；通过对这些事件的理解和处理，我们可以增加一些自定义的功能。

```jsx
window.dispatchEvent(
    new CustomEvent("single-spa:before-no-app-change", getCustomEventDetail(true))
);

1 single-spa:before-app-change / single-spa:before-no-app-change 进入reroute方法时，根据发生改变的应用数量触发；与事件顺序6对应
2 single-spa:before-routing-event 每次 reroute 开始一定会发生，与事件7对应
3 single-spa:before-mount-routing-eventurl 发行改变后，旧的应用卸载完毕后，触发该事件，表示后续要开始加载应用
4 single-spa:before-first-mount 在某个应用第一次 mount 应用之前触发该事件；该事件只会触发一次，定义在mount.js中
5 single-spa:first-mount 在某个应用第一次 mount 应用之后触发该事件；该事件只会触发一次，该定义在mount.js中
6 single-spa:app-change / single-spa:no-app-change 与事件顺序1对应
7 single-spa:routing-event 与事件 2 对应，发生在 reroute 结束
```

# import-html-entry

做资源获取的库，接受资源入口地址，发请求获取资源内容，整理资源（html, js, scss），最终返回资源。

![](https://upyun.afunny.top/202501102347636.png)

### importEntry()

入口方法， 接受需要处理的地址

```jsx
//import-html-entry/src/index.js
export function importEntry(entry, opts = {}) {
  ...
  // html entry
 if (typeof entry === 'string') {
  return importHTML(entry, {
   fetch,
   getPublicPath,
   getTemplate,
   postProcessTemplate,
  });
 }
  ...
}
```

这个方法同时支持处理传入数组情况，一般为依赖的js列表，或者css列表，处理方式和处理html entry重复，所以这里省略，主要看对html entry的处理。

### importHTML()

```jsx
//import-html-entry/src/index.js
export default function importHTML(url, opts = {}) {
  ...
 // 有缓存就使用缓存，否则发请求
 return embedHTMLCache[url] || (embedHTMLCache[url] = fetch(url)
  // readResAsString 处理一些编码情况，最终返回stirng类型的模版内容
  .then(response => readResAsString(response, autoDecodeResponse))
  .then(html => {
   const assetPublicPath = getPublicPath(url);
   // 解析返回的html资源
   const { template, scripts, entry, styles } = processTpl(getTemplate(html), assetPublicPath, postProcessTemplate);

   return getEmbedHTML(template, styles, { fetch }).then(embedHTML => ({
    template: embedHTML,
    assetPublicPath,
    getExternalScripts: () => getExternalScripts(scripts, fetch),
    getExternalStyleSheets: () => getExternalStyleSheets(styles, fetch),
    execScripts: (proxy, strictGlobal, opts = {}) => {
     if (!scripts.length) {
      return Promise.resolve();
     }
     return execScripts(entry, scripts, proxy, {
      fetch,
      strictGlobal,
      ...opts,
     });
    },
   }));
  }));
}
```

**processTpl()**

解析返回的html字符串，主要做以下几件事情：

1. 删除html模版里的注释

1. 内联的css还放在模版里，外链的css先收集起来，下一步也放到模版里

1. 收集内联的js到数组，收集外链js

1. 最终返回html模版，scripts包含内联(string 类型)和外链的js地址，styles: 外链的css，entry传入的入口地址

```jsx
//import-html-entry/src/process-tpl.js
/** 
 *   [\s\S] 匹配所有字符。\s 是匹配所有空白符，包括换行，\S 非空白符，不包括换行
 *   * 匹配前面的子表达式零次或多次
 *   + 匹配前面的子表达式一次或多次
 *   正则表达式后面的全局标记 g 指定将该表达式应用到输入字符串中能够查找到的尽可能多的匹配。
 *   表达式的结尾处的不区分大小写 i 标记指定不区分大小写。 
 */
const ALL_SCRIPT_REGEX = /(<script[\s\S]*?>)[\s\S]*?<\/script>/gi; // <script>xxxxx</script>或<script xxx>xxxxx</script>
/*
    . 匹配除换行符 \n 之外的任何单字符
    ? 匹配前面的子表达式零次或一次，或指明一个非贪婪限定符。
    
    圆括号会有一个副作用，使相关的匹配会被缓存，此时可用 ?: 放在第一个选项前来消除这种副作用。
    其中 ?: 是非捕获元之一，还有两个非捕获元是 ?= 和 ?!， ?=为正向预查，在任何开始匹配圆括
    号内的正则表达式模式的位置来匹配搜索字符串，?!为负向预查，在任何开始不匹配该正则表达式模
    式的位置来匹配搜索字符串。
    举例：exp1(?!exp2)：查找后面不是 exp2 的 exp1。
    所以这里的真实含义是匹配script标签，但type不能是text/ng-template
*/
// 匹配script标签，但type不能是text/ng-template
const SCRIPT_TAG_REGEX = /<(script)\s+((?!type=('|")text\/ng-template\3).)*?>.*?<\/\1>/is;
// 匹配获取到src的链接
const SCRIPT_SRC_REGEX = /.*\ssrc=('|")?([^>'"\s]+)/;
// 匹配含 type 属性的标签
const SCRIPT_TYPE_REGEX = /.*\stype=('|")?([^>'"\s]+)/;
// 匹配含entry属性的标签
const SCRIPT_ENTRY_REGEX = /.*\sentry\s*.*/;
// 匹配含async属性的标签
const SCRIPT_ASYNC_REGEX = /.*\sasync\s*.*/;
const SCRIPT_CROSSORIGIN_REGEX = /.*\scrossorigin=('|")?use-credentials\1/;
const SCRIPT_NO_MODULE_REGEX = /.*\snomodule\s*.*/;
const SCRIPT_MODULE_REGEX = /.*\stype=('|")?module('|")?\s*.*/;
const LINK_TAG_REGEX = /<(link)\s+.*?>/isg;
const LINK_PRELOAD_OR_PREFETCH_REGEX = /\srel=('|")?(preload|prefetch)\1/;
const LINK_HREF_REGEX = /.*\shref=('|")?([^>'"\s]+)/;
const LINK_AS_FONT = /.*\sas=('|")?font\1.*/;
/** 匹配style标签 */
const STYLE_TAG_REGEX = /<style[^>]*>[\s\S]*?<\/style>/gi;
/** 匹配rel=stylesheet的标签 <link rel="stylesheet" href="styles.css"> */ 
const STYLE_TYPE_REGEX = /\s+rel=('|")?stylesheet\1.*/;
/** 匹配含href属性的标签 */
const STYLE_HREF_REGEX = /.*\shref=('|")?([^>'"\s]+)/;
/** 匹配html模版里的注释 */
const HTML_COMMENT_REGEX = /<!--([\s\S]*?)-->/g;
/** 匹配含ignore属性的 link标签 */
const LINK_IGNORE_REGEX = /<link(\s+|\s+.+\s+)ignore(\s*|\s+.*|=.*)>/is;
const STYLE_IGNORE_REGEX = /<style(\s+|\s+.+\s+)ignore(\s*|\s+.*|=.*)>/is;
const SCRIPT_IGNORE_REGEX = /<script(\s+|\s+.+\s+)ignore(\s*|\s+.*|=.*)>/is;

export default function processTpl(tpl, baseURI, postProcessTemplate) {

 let scripts = [];
 const styles = [];
 let entry = null;
 const moduleSupport = isModuleScriptSupported();

 const template = tpl
  .replace(HTML_COMMENT_REGEX, '')
  .replace(LINK_TAG_REGEX, match => {})
  .replace(STYLE_TAG_REGEX, match => {})
  // 开始处理script标签
  .replace(ALL_SCRIPT_REGEX, (match, scriptTag) => {});
 // 以上过程就是按照正则匹配html字符串的内容，参照上面的正则规则，就可以对应这里的具体内容，就不再展开
 let tplResult = {
  template,
  scripts,
  styles,
  entry: entry || scripts[scripts.length - 1],
 };
 return tplResult;
}
```

**getEmbedHTML()**

将外链的css也以内联的方式放在html内容里。

```jsx
//import-html-entry/src/index.js
function getEmbedHTML(template, styles, opts = {}) {
 const { fetch = defaultFetch } = opts;
 let embedHTML = template;

 // 将外链的css 内联处理, getExternalStyleSheets 发送请求获取css的内容
 return getExternalStyleSheets(styles, fetch)
  .then(styleSheets => {
   embedHTML = styles.reduce((html, styleSrc, i) => {
    html = html.replace(genLinkReplaceSymbol(styleSrc), isInlineCode(styleSrc) ? `${styleSrc}` : `<style>/* ${styleSrc} */${styleSheets[i]}</style>`);
    return html;
   }, embedHTML);
   return embedHTML;
  });
}
```

到这里对模版的处理就结束了，接下来再看导出的execScripts。

**execScripts()**

执行获取到的js代码，执行之前js的代码还是字符串的状态。该方法接受了外部传入的全局方法。也就是沙箱创建的对象作为js执行的全局对象。

```jsx
//import-html-entry/src/index.js
export function execScripts(entry, scripts, proxy = window, opts = {}) {
 return getExternalScripts(scripts, fetch, error)
  .then(scriptsText => {

   const geval = (scriptSrc, inlineScript) => {
    // 这里修改js内部的全局对象，注入导入的沙箱对象
    const code = getExecutableScript(scriptSrc, rawCode, { proxy, strictGlobal, scopedGlobalVariables });
    // 执行js字符串
    evalCode(scriptSrc, code);
   };

   function exec(scriptSrc, inlineScript, resolve) {
     if (scriptSrc === entry) {
      noteGlobalProps(strictGlobal ? proxy : window);

     try {
      geval(scriptSrc, inlineScript);
      const exports = proxy[getGlobalProp(strictGlobal ? proxy : window)] || {};
      // 导出子应用挂载在全局上的方法，也就是bootstrap, mount, unmount
      resolve(exports);
     }
   }

   function schedule(i, resolvePromise) {
    if (i < scripts.length) {
     const scriptSrc = scripts[i];
     const inlineScript = scriptsText[i];

     exec(scriptSrc, inlineScript, resolvePromise);
     if (!entry && i === scripts.length - 1) {
      resolvePromise();
     } else {
      schedule(i + 1, resolvePromise);
     }
    }
   }

   return new Promise(resolve => schedule(0, success || resolve));
  });
}
```

getExecutableScript()，获取可以执行的js代码。

```jsx
//import-html-entry/src/index.js
function getExecutableScript(scriptSrc, scriptText, opts = {}) {
 const { proxy } = opts;
 // 通过这种方式获取全局 window，因为 script 也是在全局作用域下运行的，所以我们通过 window.proxy 绑定时也必须确保绑定到全局 window 上
 // 否则在嵌套场景下， window.proxy 设置的是内层应用的 window，而代码其实是在全局作用域运行的，会导致闭包里的 window.proxy 取的是最外层的微应用的 proxy
 // 嵌套场景下拿到的也是最外层的window，而不是沙箱的代理全局对象。
 const globalWindow = (0, eval)('window');
 globalWindow.proxy = proxy;
 // TODO 通过 strictGlobal 方式切换 with 闭包，待 with 方式坑趟平后再合并
 /**
  * 绑定了window.proxy改变js代码中的this引用
  * with 是为了解决一些变量逃出沙箱的场景
  */
 return strictGlobal
  ? (
   scopedGlobalVariableDefinition
    ? `;(function(){with(this){${scopedGlobalVariableDefinition}${scriptText}\n${sourceUrl}}}).bind(window.proxy)();`
    : `;(function(window, self, globalThis){with(window){;${scriptText}\n${sourceUrl}}}).bind(window.proxy)(window.proxy, window.proxy, window.proxy);`
  )
  : `;(function(window, self, globalThis){;${scriptText}\n${sourceUrl}}).bind(window.proxy)(window.proxy, window.proxy, window.proxy);`;
}

// 补充with的示例
<script>
const withObj = {
    think: 'different'
}

with(withObj) {
    console.log(think, 'index-36') // different index-36
}
</script>
```

evalCode(),最后调用evalCode执行js字符串，还是eval方法承受了所有。

```jsx
//import-html-entry/src/utils.js
export function evalCode(scriptSrc, code) {
 const key = scriptSrc;
 if (!evalCache[key]) {
  const functionWrappedCode = `(function(){${code}})`;
  // 使用eval执行传入的 code 字符串
  // 在es5的严格模式下，也能获得全局对象的引用，而不是undefined了
  evalCache[key] = (0, eval)(functionWrappedCode);
 }
 const evalFunc = evalCache[key];
 evalFunc.call(window);
}
```

## 总结

乾坤通过single-spa管理子应用的注册和切换，通过import-html-entry传入html入口获取应用的资源。

子应用执行在乾坤创建的沙箱环境，目的是为了不污染全局变量，如果多个子应用嵌套挂载，也保证相互不影响。

singal-spa 在路过的过程中，触发不同的事件，给其他应用提供监听入口。

import-html-entry 解析传入的地址，html地址里的html，js，css返回出去。

## 参考

乾坤 [https://github.com/umijs/qiankun](https://github.com/umijs/qiankun)

single-spa [https://github.com/single-spa/single-spa](https://github.com/single-spa/single-spa)

import-html-entry [https://github.com/kuitos/import-html-entry](https://github.com/kuitos/import-html-entry)

微前端 [https://juejin.cn/post/7070032850237521956](https://juejin.cn/post/7070032850237521956)