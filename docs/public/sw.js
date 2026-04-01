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
  // 开发环境下不预缓存
  if (isDevelopment()) {
    event.waitUntil(self.skipWaiting());
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS.map(url => new Request(url, { cache: 'reload' })));
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  // 开发环境下不清理缓存
  if (isDevelopment()) {
    event.waitUntil(self.clients.claim());
    return;
  }

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('blog-cache-')) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    }).catch((error) => {
      console.error('[Service Worker] 激活出错:', error);
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

      return isImage || isFont || isCss;
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
    return hasCacheableExtension || matchesPattern || isRoot;
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
    return cachedResponse;
  }

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
          cache: 'no-cache',
        });

        if (!networkResponse.ok && networkResponse.status !== 0) {
          throw new Error(`CORS 响应状态码: ${networkResponse.status}`);
        }
      } catch (corsError) {
        useNoCors = true;
        networkResponse = await fetch(requestUrl, {
          method: 'GET',
          mode: 'no-cors',
          credentials: 'omit',
          cache: 'no-cache',
        });
      }
    } else {
      networkResponse = await fetch(request);
    }

    const isValidResponse = networkResponse.ok ||
                           networkResponse.status === 0 ||
                           networkResponse.type === 'opaque' ||
                           networkResponse.type === 'basic' ||
                           networkResponse.type === 'cors';

    if (isValidResponse) {
      const responseToCache = networkResponse.clone();

      const cacheKey = new Request(requestUrl, {
        method: 'GET',
        mode: useNoCors ? 'no-cors' : 'cors',
      });

      try {
        await cache.put(cacheKey, responseToCache);
      } catch (cacheError) {
        // 缓存失败时忽略错误，继续返回响应
      }

      return networkResponse;
    } else {
      throw new Error(`HTTP ${networkResponse.status}: ${networkResponse.statusText}`);
    }
  } catch (error) {
    console.error('[Service Worker] 获取资源失败:', requestUrl, error);
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
    return;
  }

  event.respondWith((async () => {
    const strategy = getCacheStrategy(url);
    const urlObj = new URL(url);
    const fullPath = urlObj.pathname + (urlObj.search || '');
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?|$|#)/i.test(fullPath);
    const isFont = /\.(woff|woff2|ttf|eot|otf)(\?|$|#)/i.test(fullPath);

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
        return response;
      }
      throw new Error('响应为空');
    } catch (error) {
      // 如果所有策略都失败，尝试返回缓存的响应
      const cache = await caches.open(CACHE_NAME);
      let cachedResponse = await cache.match(url);

      if (!cachedResponse) {
        cachedResponse = await cache.match(request);
      }

      if (!cachedResponse) {
        const noCorsRequest = new Request(url, { mode: 'no-cors' });
        cachedResponse = await cache.match(noCorsRequest);
      }

      if (cachedResponse) {
        return cachedResponse;
      }

      // 对于图片和字体资源，回退到原始请求
      if (isImage || isFont) {
        try {
          return await fetch(request.clone());
        } catch (directError) {
          try {
            return await fetch(request.url, {
              mode: 'no-cors',
              credentials: 'omit'
            });
          } catch (noCorsError) {
            // 所有方法都失败
          }
        }
      }

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
