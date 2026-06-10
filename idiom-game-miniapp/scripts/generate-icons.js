/**
 * 生成 tabbar 图标 PNG 文件
 * 使用 Node.js 内置 zlib 模块创建简单的 PNG 图标
 */
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const SIZE = 81
const STATIC_DIR = path.join(__dirname, '..', 'src', 'static', 'tabbar')

// 确保 tabbar 目录存在
if (!fs.existsSync(STATIC_DIR)) {
  fs.mkdirSync(STATIC_DIR, { recursive: true })
}

// CRC32 计算
const crc32Table = new Int32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
  }
  crc32Table[i] = c
}

function crc32(buf) {
  let crc = -1
  for (let i = 0; i < buf.length; i++) {
    crc = crc32Table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
  }
  return (crc ^ -1) >>> 0
}

// 创建 PNG chunk
function createChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const crcData = Buffer.concat([typeBytes, data])
  const crcValue = Buffer.alloc(4)
  crcValue.writeUInt32BE(crc32(crcData), 0)
  return Buffer.concat([length, typeBytes, data, crcValue])
}

// 创建 PNG 文件
function createPNG(pixels) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(SIZE, 0)  // width
  ihdr.writeUInt32BE(SIZE, 4)  // height
  ihdr[8] = 8   // bit depth
  ihdr[9] = 6   // color type: RGBA
  ihdr[10] = 0  // compression
  ihdr[11] = 0  // filter
  ihdr[12] = 0  // interlace

  // IDAT - 添加 filter byte (0) 到每行开头
  const rawData = Buffer.alloc(SIZE * (SIZE * 4 + 1))
  for (let y = 0; y < SIZE; y++) {
    rawData[y * (SIZE * 4 + 1)] = 0  // filter: None
    for (let x = 0; x < SIZE; x++) {
      const srcIdx = (y * SIZE + x) * 4
      const dstIdx = y * (SIZE * 4 + 1) + 1 + x * 4
      rawData[dstIdx] = pixels[srcIdx]       // R
      rawData[dstIdx + 1] = pixels[srcIdx + 1] // G
      rawData[dstIdx + 2] = pixels[srcIdx + 2] // B
      rawData[dstIdx + 3] = pixels[srcIdx + 3] // A
    }
  }

  const compressed = zlib.deflateSync(rawData)

  // IEND
  const iend = Buffer.alloc(0)

  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressed),
    createChunk('IEND', iend)
  ])
}

// 初始化透明像素
function createTransparentPixels() {
  return new Uint8Array(SIZE * SIZE * 4)
}

// 绘制圆形
function drawCircle(pixels, cx, cy, r, color) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - cx
      const dy = y - cy
      if (dx * dx + dy * dy <= r * r) {
        const idx = (y * SIZE + x) * 4
        pixels[idx] = color[0]
        pixels[idx + 1] = color[1]
        pixels[idx + 2] = color[2]
        pixels[idx + 3] = color[3]
      }
    }
  }
}

// 绘制矩形
function drawRect(pixels, x1, y1, x2, y2, color) {
  for (let y = Math.max(0, y1); y <= Math.min(SIZE - 1, y2); y++) {
    for (let x = Math.max(0, x1); x <= Math.min(SIZE - 1, x2); x++) {
      const idx = (y * SIZE + x) * 4
      pixels[idx] = color[0]
      pixels[idx + 1] = color[1]
      pixels[idx + 2] = color[2]
      pixels[idx + 3] = color[3]
    }
  }
}

// 绘制三角形
function drawTriangle(pixels, x1, y1, x2, y2, x3, y3, color) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const d1 = (x - x3) * (y1 - y3) - (x1 - x3) * (y - y3)
      const d2 = (x - x1) * (y2 - y1) - (x2 - x1) * (y - y1)
      const d3 = (x - x2) * (y3 - y2) - (x3 - x2) * (y - y2)
      const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0)
      const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0)
      if (!(hasNeg && hasPos)) {
        const idx = (y * SIZE + x) * 4
        pixels[idx] = color[0]
        pixels[idx + 1] = color[1]
        pixels[idx + 2] = color[2]
        pixels[idx + 3] = color[3]
      }
    }
  }
}

// 颜色定义
const GRAY = [156, 163, 175, 255]       // #9CA3AF
const AMBER = [245, 158, 11, 255]        // #F59E0B

// 生成首页图标 - 简单的房子形状
function generateHomeIcon(color) {
  const pixels = createTransparentPixels()
  const c = color
  // 屋顶 - 三角形
  drawTriangle(pixels, 40, 16, 12, 42, 68, 42, c)
  // 房身 - 矩形
  drawRect(pixels, 20, 42, 60, 64, c)
  // 门 - 透明矩形（挖空）
  const transparent = [0, 0, 0, 0]
  drawRect(pixels, 34, 48, 46, 64, transparent)
  return createPNG(Buffer.from(pixels))
}

// 生成排行图标 - 奖杯形状
function generateRankIcon(color) {
  const pixels = createTransparentPixels()
  const c = color
  // 杯身
  drawRect(pixels, 26, 18, 54, 44, c)
  // 杯口加宽
  drawRect(pixels, 22, 18, 58, 26, c)
  // 底座
  drawRect(pixels, 30, 56, 50, 60, c)
  drawRect(pixels, 24, 60, 56, 64, c)
  // 把手左
  drawRect(pixels, 16, 24, 22, 36, c)
  // 把手右
  drawRect(pixels, 58, 24, 64, 36, c)
  // 杯柱
  drawRect(pixels, 36, 44, 44, 56, c)
  // 星星装饰 - 透明
  const transparent = [0, 0, 0, 0]
  drawRect(pixels, 36, 26, 44, 40, transparent)
  return createPNG(Buffer.from(pixels))
}

// 生成我的图标 - 人物形状
function generateMineIcon(color) {
  const pixels = createTransparentPixels()
  const c = color
  // 头 - 圆形
  drawCircle(pixels, 40, 26, 12, c)
  // 身体 - 梯形/圆弧
  drawCircle(pixels, 40, 68, 24, c)
  // 切掉下半部分，只保留上半部分身体
  const transparent = [0, 0, 0, 0]
  drawRect(pixels, 0, 68, SIZE, SIZE, transparent)
  return createPNG(Buffer.from(pixels))
}

// 生成所有图标
const icons = [
  { name: 'tab-home.png', generator: () => generateHomeIcon(GRAY) },
  { name: 'tab-home-active.png', generator: () => generateHomeIcon(AMBER) },
  { name: 'tab-rank.png', generator: () => generateRankIcon(GRAY) },
  { name: 'tab-rank-active.png', generator: () => generateRankIcon(AMBER) },
  { name: 'tab-mine.png', generator: () => generateMineIcon(GRAY) },
  { name: 'tab-mine-active.png', generator: () => generateMineIcon(AMBER) },
]

icons.forEach(({ name, generator }) => {
  const filePath = path.join(STATIC_DIR, name)
  const pngData = generator()
  fs.writeFileSync(filePath, pngData)
  console.log(`Created: ${filePath} (${pngData.length} bytes)`)
})

console.log('All tabbar icons generated!')
