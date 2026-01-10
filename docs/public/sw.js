// Service Worker 版本号，用于更新缓存
const CACHE_VERSION = 'v1.0.4';
const CACHE_NAME = `blog-cache-${CACHE_VERSION}`;

// 判断是否是开发环境
function isDevelopment() {
  const hostname = self.location.hostname;
  // localhost、127.0.0.1 或包含 localhost 的域名视为开发环境
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' || 
         hostname.includes('localhost') ||
         hostname.includes('127.0.0.1') ||
         self.location.port !== ''; // 有端口号通常是开发环境
}

// 需要预缓存的关键资源
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/archive',
  '/about-blog',
  '/a-word',
  '/project',
];

// 需要缓存的文件扩展名
const CACHEABLE_EXTENSIONS = [
  '.js',
  '.css',
  '.html',
  '.json',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.ico',
  '.xml',
];

// 需要缓存的文件路径模式
const CACHEABLE_PATTERNS = [
  /\/assets\//,
  /\/icon\.jpg/,
  /\/robots\.txt/,
  /\/feed\.xml/,
  /\/sitemap\.xml/,
];

// 允许缓存的外部域名（CDN）
const ALLOWED_EXTERNAL_DOMAINS = [
  'upyun.afunny.top',
  'ik.imagekit.io',
  'chinese-fonts-cdn.deno.dev',
  // 可以添加其他需要缓存的 CDN 域名
];

// 安装事件 - 预缓存关键资源
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安装中...', CACHE_VERSION);
  
  // 开发环境下不预缓存
  if (isDevelopment()) {
    console.log('[Service Worker] 开发环境，跳过预缓存');
    event.waitUntil(self.skipWaiting());
    return;
  }
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] 预缓存关键资源');
      return cache.addAll(PRECACHE_URLS.map(url => new Request(url, { cache: 'reload' })));
    }).then(() => {
      // 强制激活新的 service worker
      return self.skipWaiting();
    })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活中...', CACHE_VERSION);
  
  // 开发环境下不清理缓存
  if (isDevelopment()) {
    console.log('[Service Worker] 开发环境，跳过缓存清理');
    event.waitUntil(self.clients.claim());
    return;
  }
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 立即控制所有客户端
      return self.clients.claim();
    })
  );
});

// 判断资源是否应该被缓存
function shouldCache(url) {
  try {
    const urlObj = new URL(url, self.location.origin);
    const isExternal = urlObj.origin !== self.location.origin;
    
    // 检查是否是允许的外部域名（支持子域名匹配）
    const isAllowedExternal = ALLOWED_EXTERNAL_DOMAINS.some(domain => {
      const hostname = urlObj.hostname;
      return hostname === domain || 
             hostname.endsWith('.' + domain) ||
             hostname.includes('.' + domain + '.');
    });
    
    // 如果是外部资源，只允许缓存允许的域名
    if (isExternal) {
      if (!isAllowedExternal) {
        // 调试日志：记录被拒绝的外部资源
        if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || 
            url.includes('.woff') || url.includes('.woff2') || url.includes('.ttf')) {
          console.log('[Service Worker] 拒绝缓存外部资源（域名不在允许列表）:', url, '域名:', urlObj.hostname);
        }
        return false;
      }
      
      // 外部资源缓存图片、字体和其他静态资源
      const pathname = urlObj.pathname;
      const fullPath = pathname + (urlObj.search || '');
      
      // 检查是否是图片文件
      const isImage = /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?|$|#)/i.test(fullPath);
      // 检查是否是字体文件
      const isFont = /\.(woff|woff2|ttf|eot|otf)(\?|$|#)/i.test(fullPath);
      // 检查是否是 CSS 文件
      const isCss = /\.css(\?|$|#)/i.test(fullPath);
      
      const shouldCache = isImage || isFont || isCss;
      
      if (shouldCache) {
        if (isImage) {
          console.log('[Service Worker] ✓ 允许缓存外部图片:', url);
        } else if (isFont) {
          console.log('[Service Worker] ✓ 允许缓存外部字体:', url);
        } else if (isCss) {
          console.log('[Service Worker] ✓ 允许缓存外部 CSS:', url);
        }
      } else {
        // 调试日志：记录被拒绝的外部资源类型
        console.log('[Service Worker] ✗ 拒绝缓存外部资源（不是图片/字体/CSS）:', url);
      }
      
      return shouldCache;
    }
    
    // 同源资源：检查文件扩展名
    const pathname = urlObj.pathname;
    const fullPath = pathname + (urlObj.search || '');
    
    // 检查文件扩展名（支持查询参数）
    const hasCacheableExtension = CACHEABLE_EXTENSIONS.some(ext => {
      const lowerPath = fullPath.toLowerCase();
      return lowerPath.endsWith(ext) || 
             lowerPath.includes(ext + '?') || 
             lowerPath.includes(ext + '#');
    });
    
    // 检查路径模式
    const matchesPattern = CACHEABLE_PATTERNS.some(pattern => 
      pattern.test(pathname)
    );
    
    const isRoot = pathname === '/' || pathname.endsWith('/');
    const shouldCacheLocal = hasCacheableExtension || matchesPattern || isRoot;
    
    if (!shouldCacheLocal && (pathname.includes('.') || pathname.includes('/assets/'))) {
      // 调试日志：记录可能应该缓存但被拒绝的同源资源
      console.log('[Service Worker] ✗ 拒绝缓存同源资源:', url, {
        hasExtension: hasCacheableExtension,
        matchesPattern: matchesPattern,
        isRoot: isRoot
      });
    }
    
    return shouldCacheLocal;
  } catch (error) {
    console.error('[Service Worker] URL 解析失败:', url, error);
    return false;
  }
}

// 获取缓存策略
function getCacheStrategy(url) {
  const urlObj = new URL(url, self.location.origin);
  const pathname = urlObj.pathname;
  
  // HTML 文件使用 Network First 策略
  if (pathname.endsWith('.html') || pathname === '/' || pathname.endsWith('/')) {
    return 'networkFirst';
  }
  
  // 图片资源使用 Cache First 策略（包括外部 CDN 图片）
  if (/\.(jpg|jpeg|png|gif|webp|svg|ico)(\?|$)/i.test(pathname + (urlObj.search || ''))) {
    return 'cacheFirst';
  }
  
  // 字体文件使用 Cache First 策略（包括外部 CDN 字体）
  if (/\.(woff|woff2|ttf|eot|otf)(\?|$)/i.test(pathname + (urlObj.search || ''))) {
    return 'cacheFirst';
  }
  
  // 其他静态资源（JS、CSS 等）使用 Cache First 策略
  if (/\.(js|css)(\?|$)/i.test(pathname + (urlObj.search || ''))) {
    return 'cacheFirst';
  }
  
  // 其他资源使用 Stale While Revalidate 策略
  return 'staleWhileRevalidate';
}

// Network First 策略 - 优先使用网络，失败时使用缓存
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache First 策略 - 优先使用缓存，失败时使用网络
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const requestUrl = request.url;
  
  // 先检查缓存（使用 URL 匹配，更可靠）
  const cachedResponse = await cache.match(requestUrl);
  
  if (cachedResponse) {
    console.log('[Service Worker] ✓ 从缓存返回:', requestUrl);
    return cachedResponse;
  }
  
  console.log('[Service Worker] → 缓存未命中，从网络获取:', requestUrl);
  
  // 缓存未命中，从网络获取
  try {
    const urlObj = new URL(requestUrl);
    const isExternal = urlObj.origin !== self.location.origin;
    
    let networkResponse;
    let useNoCors = false;
    
    if (isExternal) {
      // 外部资源：先尝试 cors，失败则使用 no-cors
      try {
        networkResponse = await fetch(requestUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-cache', // 确保获取最新资源
        });
        
        // 检查响应是否真的成功
        if (!networkResponse.ok && networkResponse.status !== 0) {
          throw new Error(`CORS 响应状态码: ${networkResponse.status}`);
        }
      } catch (corsError) {
        console.log('[Service Worker] CORS 模式失败，使用 no-cors:', requestUrl, corsError.message);
        useNoCors = true;
        // CORS 失败，使用 no-cors 模式
        networkResponse = await fetch(requestUrl, {
          method: 'GET',
          mode: 'no-cors',
          credentials: 'omit',
          cache: 'no-cache',
        });
      }
    } else {
      // 同源资源：直接 fetch
      networkResponse = await fetch(request);
    }
    
    // 检查响应是否成功
    // status === 0 或 type === 'opaque' 表示 no-cors 响应，也可以缓存
    const isValidResponse = networkResponse.ok || 
                           networkResponse.status === 0 || 
                           networkResponse.type === 'opaque' ||
                           networkResponse.type === 'basic' ||
                           networkResponse.type === 'cors';
    
    if (isValidResponse) {
      // 克隆响应以便缓存和返回
      const responseToCache = networkResponse.clone();
      
      // 使用 URL 作为 key 来缓存（更可靠）
      const cacheKey = new Request(requestUrl, {
        method: 'GET',
        // 对于 no-cors 响应，使用相同的模式
        mode: useNoCors ? 'no-cors' : 'cors',
      });
      
      // 尝试缓存响应
      try {
        await cache.put(cacheKey, responseToCache);
        console.log('[Service Worker] ✓ 缓存新资源:', requestUrl, {
          status: networkResponse.status,
          type: networkResponse.type,
          ok: networkResponse.ok,
          mode: useNoCors ? 'no-cors' : 'cors'
        });
      } catch (cacheError) {
        console.error('[Service Worker] ✗ 缓存失败:', requestUrl, cacheError);
        // 即使缓存失败，也返回响应
      }
      
      return networkResponse;
    } else {
      throw new Error(`HTTP ${networkResponse.status}: ${networkResponse.statusText}, type: ${networkResponse.type}`);
    }
  } catch (error) {
    console.error('[Service Worker] ✗ 获取资源失败:', requestUrl, error);
    throw error;
  }
}

// Stale While Revalidate 策略 - 立即返回缓存，后台更新
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // 网络请求失败，忽略错误
  });
  
  return cachedResponse || fetchPromise;
}

// 拦截 fetch 请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;
  
  // 开发环境下不拦截请求，直接返回
  if (isDevelopment()) {
    return;
  }
  
  // 只处理 GET 请求
  if (request.method !== 'GET') {
    return;
  }
  
  // 跳过 Service Worker 自身的请求
  if (url.includes('/sw.js')) {
    return;
  }
  
  // 判断是否应该缓存
  const shouldCacheResource = shouldCache(url);
  if (!shouldCacheResource) {
    // 如果不应该缓存，直接返回原始请求（不拦截）
    return;
  }
  
  // 记录拦截的资源
  console.log('[Service Worker] 🔄 拦截请求:', url);
  
  event.respondWith((async () => {
    const strategy = getCacheStrategy(url);
    const urlObj = new URL(url);
    const fullPath = urlObj.pathname + (urlObj.search || '');
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?|$|#)/i.test(fullPath);
    const isFont = /\.(woff|woff2|ttf|eot|otf)(\?|$|#)/i.test(fullPath);
    
    console.log('[Service Worker] 使用策略:', strategy, 'URL:', url);
    
    try {
      let response;
      switch (strategy) {
        case 'networkFirst':
          response = await networkFirst(request);
          break;
        case 'cacheFirst':
          response = await cacheFirst(request);
          break;
        case 'staleWhileRevalidate':
          response = await staleWhileRevalidate(request);
          break;
        default:
          response = await fetch(request);
      }
      
      if (response) {
        console.log('[Service Worker] ✓ 成功获取资源:', url);
        return response;
      }
      throw new Error('响应为空');
    } catch (error) {
      console.error('[Service Worker] ✗ 获取资源失败:', url, error);
      
      // 如果所有策略都失败，尝试返回缓存的响应（使用 URL 直接匹配）
      const cache = await caches.open(CACHE_NAME);
      // 尝试多种匹配方式
      let cachedResponse = await cache.match(url);
      
      if (!cachedResponse) {
        // 尝试使用原始 request 匹配
        cachedResponse = await cache.match(request);
      }
      
      if (!cachedResponse) {
        // 尝试使用 no-cors 模式的 request 匹配
        const noCorsRequest = new Request(url, { mode: 'no-cors' });
        cachedResponse = await cache.match(noCorsRequest);
      }
      
      if (cachedResponse) {
        console.log('[Service Worker] ✓ 使用缓存作为后备:', url);
        return cachedResponse;
      }
      
      // 对于图片和字体资源，如果 Service Worker 处理失败，回退到原始请求
      // 这样可以确保资源至少能加载，即使无法缓存
      if (isImage || isFont) {
        const resourceType = isImage ? '图片' : '字体';
        console.warn(`[Service Worker] ⚠️ ${resourceType}加载失败，回退到原始请求:`, url);
        try {
          // 尝试使用原始请求（不通过 SW 处理）
          const directResponse = await fetch(request.clone());
          console.log(`[Service Worker] ✓ ${resourceType}原始请求成功:`, url);
          return directResponse;
        } catch (directError) {
          console.error(`[Service Worker] ✗ ${resourceType}原始请求也失败:`, url, directError);
          // 最后尝试 no-cors 模式
          try {
            const noCorsResponse = await fetch(request.url, { 
              mode: 'no-cors',
              credentials: 'omit'
            });
            console.log(`[Service Worker] ✓ ${resourceType}no-cors 请求成功:`, url);
            return noCorsResponse;
          } catch (noCorsError) {
            console.error(`[Service Worker] ✗ ${resourceType}no-cors 请求也失败:`, url, noCorsError);
          }
        }
      }
      
      // 如果连缓存也没有，返回错误响应
      console.error('[Service Worker] ✗ 所有方法都失败，返回错误响应:', url);
      return new Response('资源加载失败', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/plain',
        }),
      });
    }
  })());
});

// 监听消息，用于手动更新缓存
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});
