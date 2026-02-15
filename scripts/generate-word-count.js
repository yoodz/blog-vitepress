import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 计算中文字数的函数（汉字+标点）
function countChineseWords(text) {
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/[#*_~`>-]/g, '')
    .replace(/\s+/g, '');

  const chineseChars = cleanText.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g);
  return chineseChars ? chineseChars.length : 0;
}

// 计算英文单词数的函数
function countEnglishWords(text) {
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/[#*_~`>-]/g, '');

  const englishWords = cleanText.match(/[a-zA-Z]+/g);
  return englishWords ? englishWords.length : 0;
}

// 计算总字数（中文+英文）
function countWords(text) {
  const chinese = countChineseWords(text);
  const english = countEnglishWords(text);
  return { chinese, english, total: chinese + english };
}

// 读取所有 markdown 文件并计算字数
const docsDir = path.join(__dirname, '../docs');
const publicDir = path.join(__dirname, '../docs/public');
const wordCountMap = {};
let processedCount = 0;
let skippedCount = 0;

// 递归读取目录
function readDirRecursive(dir, baseDir = dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);

    // 跳过隐藏文件和目录
    if (file.startsWith('.')) continue;

    // 跳过 node_modules 和 .vitepress 目录
    if (file === 'node_modules' || file === '.vitepress') continue;

    try {
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        readDirRecursive(filePath, baseDir);
      } else if (file.endsWith('.md')) {
        const content = fs.readFileSync(filePath, 'utf-8');

        // 检查是否应该隐藏
        const lines = content.split('\n');
        let hasTitle = false;
        let shouldHide = false;
        let inFrontmatter = false;

        for (const line of lines) {
          if (line.trim() === '---') {
            if (!inFrontmatter) {
              inFrontmatter = true;
            } else {
              // frontmatter 结束
              break;
            }
            continue;
          }

          if (inFrontmatter) {
            if (line.startsWith('title:')) {
              hasTitle = true;
            } else if (line.trim() === 'hide: true' || line.trim() === 'hide:  true') {
              shouldHide = true;
            }
          } else {
            // frontmatter 结束后
            break;
          }
        }

        if (!hasTitle) {
          console.log(`跳过无标题文件: ${filePath}`);
          skippedCount++;
          continue;
        }

        if (shouldHide) {
          console.log(`跳过隐藏文件: ${filePath}`);
          skippedCount++;
          continue;
        }

        const wordCount = countWords(content);

        // 计算相对路径作为 URL
        const relativePath = path.relative(baseDir, filePath);
        const urlPath = '/' + relativePath.replace(/\.md$/, '').replace(/\\/g, '/').replace(/\/index$/, '') || '/';

        wordCountMap[urlPath] = {
          words: wordCount.total,
          readingTime: Math.ceil(wordCount.total / 400)
        };

        // 同时保存带 .html 的版本
        if (urlPath !== '/' && !urlPath.endsWith('.html')) {
          wordCountMap[urlPath + '.html'] = wordCountMap[urlPath];
          wordCountMap[urlPath + '/'] = wordCountMap[urlPath];
        }

        processedCount++;
        console.log(`${urlPath}: ${wordCount.total} 字`);
      }
    } catch (error) {
      console.warn(`处理文件失败: ${filePath}`, error.message);
    }
  }
}

// 确保 public 目录存在
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('开始扫描 markdown 文件...');
readDirRecursive(docsDir);

// 写入字数统计文件
fs.writeFileSync(
  path.join(publicDir, 'word-count.json'),
  JSON.stringify(wordCountMap, null, 2),
  'utf-8'
);

console.log('\n====================');
console.log(`字数统计文件已生成: docs/public/word-count.json`);
console.log(`共处理 ${processedCount} 个页面`);
console.log(`跳过 ${skippedCount} 个文件`);
console.log('====================');
