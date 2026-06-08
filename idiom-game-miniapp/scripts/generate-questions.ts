/**
 * 调用DeepSeek API批量生成成语答题题库
 * API: https://api.deepseek.com/v1/chat/completions
 * API Key从环境变量DEEPSEEK_API_KEY读取
 *
 * 使用方法：
 *   export DEEPSEEK_API_KEY=your_key
 *   cd scripts && npm run generate
 */

import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

// ==================== 类型定义 ====================

type QuestionType = 'fill' | 'meaning' | 'picture';
type Difficulty = 1 | 2 | 3;

interface Question {
  id: number;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface QuestionBank {
  questions: Question[];
}

interface GenerateConfig {
  difficulty: Difficulty;
  difficultyName: string;
  totalCount: number;
  batchSize: number;
  outputFile: string;
}

// ==================== 配置 ====================

const API_URL = 'https://api.deepseek.com/v1/chat/completions';
const API_KEY = process.env.DEEPSEEK_API_KEY || '';
const BATCH_SIZE = 20;
const MAX_RETRIES = 3;
const TOTAL_PER_DIFFICULTY = 100;

const OUTPUT_DIR = path.resolve(__dirname, '../src/data');

const CONFIGS: GenerateConfig[] = [
  {
    difficulty: 1,
    difficultyName: '简单',
    totalCount: TOTAL_PER_DIFFICULTY,
    batchSize: BATCH_SIZE,
    outputFile: path.join(OUTPUT_DIR, 'idioms-easy.json'),
  },
  {
    difficulty: 2,
    difficultyName: '中等',
    totalCount: TOTAL_PER_DIFFICULTY,
    batchSize: BATCH_SIZE,
    outputFile: path.join(OUTPUT_DIR, 'idioms-medium.json'),
  },
  {
    difficulty: 3,
    difficultyName: '困难',
    totalCount: TOTAL_PER_DIFFICULTY,
    batchSize: BATCH_SIZE,
    outputFile: path.join(OUTPUT_DIR, 'idioms-hard.json'),
  },
];

// ==================== Prompt构建 ====================

function buildPrompt(difficultyName: string, count: number): string {
  return `你是一个成语题库生成器。请生成${count}道${difficultyName}难度的成语答题题目。

要求：
1. 三种题型混合生成：fill(填空)、meaning(释义选择)、picture(看图猜)
2. ${difficultyName}难度的成语选择标准：
   - 简单：日常常见成语，如"画蛇添足""守株待兔"等
   - 中等：较常见但有一定难度的成语，如"鞭辟入里""不落窠臼"等
   - 困难：较生僻或易混淆的成语，如"厝火积薪""胶柱鼓瑟"等

3. 各题型格式要求：
   - fill类型：question用下划线___代替1-2个字，options提供6个候选字（必须包含正确答案中的被替换字）
   - meaning类型：question是成语的释义描述，options提供4个成语选项（含正确答案）
   - picture类型：question是对成语画面的生动文字描述，options提供4个成语选项（含正确答案）

4. answer必须是真实存在的四字成语，explanation要准确简明
5. 所有成语不得重复
6. options中正确答案的位置要随机分布

请严格按照以下JSON格式返回，不要包含任何其他文字：
{
  "questions": [
    {
      "id": 1,
      "type": "fill",
      "difficulty": ${difficultyName === '简单' ? 1 : difficultyName === '中等' ? 2 : 3},
      "question": "___然大___",
      "options": ["恍", "悟", "怡", "自", "梦", "雷"],
      "answer": "恍然大悟",
      "explanation": "形容一下子明白过来"
    }
  ]
}`;
}

// ==================== API调用 ====================

async function callDeepSeekAPI(prompt: string, retryCount = 0): Promise<string> {
  if (!API_KEY) {
    throw new Error('DEEPSEEK_API_KEY 环境变量未设置！请先运行: export DEEPSEEK_API_KEY=your_key');
  }

  try {
    log(`  正在调用API...${retryCount > 0 ? ` (重试第${retryCount}次)` : ''}`);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的成语题库生成助手，只返回JSON格式数据，不返回其他内容。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败 (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('API返回内容为空');
    }

    return content;
  } catch (error: any) {
    if (retryCount < MAX_RETRIES) {
      const delay = Math.pow(2, retryCount) * 1000;
      log(`  请求失败: ${error.message}，${delay / 1000}秒后重试...`);
      await sleep(delay);
      return callDeepSeekAPI(prompt, retryCount + 1);
    }
    throw error;
  }
}

// ==================== 解析响应 ====================

function parseResponse(content: string): Question[] {
  // 尝试从markdown代码块中提取JSON
  let jsonStr = content;

  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  // 尝试找到JSON对象的起止位置
  const jsonStart = jsonStr.indexOf('{');
  const jsonEnd = jsonStr.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
  }

  try {
    const parsed = JSON.parse(jsonStr) as QuestionBank;
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('返回数据缺少questions数组');
    }
    return parsed.questions;
  } catch (e) {
    log(`  JSON解析失败，原始内容前200字: ${content.substring(0, 200)}`);
    throw new Error(`解析API返回的JSON失败: ${(e as Error).message}`);
  }
}

// ==================== 去重 ====================

function deduplicateQuestions(existing: Question[], newQuestions: Question[]): Question[] {
  const existingAnswers = new Set(existing.map((q) => q.answer));
  return newQuestions.filter((q) => !existingAnswers.has(q.answer));
}

// ==================== 数据校验 ====================

function validateQuestion(q: Question, difficulty: Difficulty): boolean {
  if (!q.type || !['fill', 'meaning', 'picture'].includes(q.type)) {
    log(`  跳过无效题目: type=${q.type}`);
    return false;
  }
  if (q.difficulty !== difficulty) {
    q.difficulty = difficulty; // 自动修正difficulty
  }
  if (!q.answer || q.answer.length !== 4) {
    log(`  跳过无效答案: answer=${q.answer}`);
    return false;
  }
  if (!q.question || q.question.trim().length === 0) {
    log(`  跳过无效问题: question为空`);
    return false;
  }
  if (!q.options || q.options.length < 4) {
    log(`  跳过无效选项: options长度不足`);
    return false;
  }
  if (!q.explanation || q.explanation.trim().length === 0) {
    log(`  跳过无效解释: explanation为空`);
    return false;
  }
  return true;
}

// ==================== 工具函数 ====================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(message: string): void {
  const timestamp = new Date().toLocaleTimeString('zh-CN');
  console.log(`[${timestamp}] ${message}`);
}

function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

// ==================== 主生成逻辑 ====================

async function generateForDifficulty(config: GenerateConfig): Promise<void> {
  const { difficulty, difficultyName, totalCount, batchSize, outputFile } = config;

  log(`\n${'='.repeat(50)}`);
  log(`开始生成${difficultyName}难度题库 (目标: ${totalCount}道)`);
  log(`${'='.repeat(50)}`);

  // 读取已有数据（支持增量生成）
  let allQuestions: Question[] = [];
  let startId = 1;

  if (fs.existsSync(outputFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(outputFile, 'utf-8')) as QuestionBank;
      allQuestions = existing.questions || [];
      startId = allQuestions.length + 1;
      log(`已加载现有题库: ${allQuestions.length}道题，将从第${startId}道继续`);
    } catch {
      log('现有文件解析失败，将重新生成');
    }
  }

  const existingCount = allQuestions.length;
  const remainingCount = totalCount - existingCount;

  if (remainingCount <= 0) {
    log(`${difficultyName}难度题库已达目标数量 (${existingCount}/${totalCount})，跳过`);
    return;
  }

  const batchCount = Math.ceil(remainingCount / batchSize);
  log(`需要生成 ${remainingCount} 道题，分 ${batchCount} 批完成`);

  for (let batch = 0; batch < batchCount; batch++) {
    const currentBatchSize = Math.min(batchSize, remainingCount - batch * batchSize);
    log(`\n--- 第 ${batch + 1}/${batchCount} 批 (生成${currentBatchSize}道) ---`);

    const prompt = buildPrompt(difficultyName, currentBatchSize);

    try {
      const content = await callDeepSeekAPI(prompt);
      const questions = parseResponse(content);

      // 数据校验
      const validQuestions = questions.filter((q) => validateQuestion(q, difficulty));
      log(`  API返回 ${questions.length} 道题，有效 ${validQuestions.length} 道`);

      // 去重
      const newQuestions = deduplicateQuestions(allQuestions, validQuestions);
      log(`  去重后新增 ${newQuestions.length} 道题`);

      // 分配ID
      const questionsWithId = newQuestions.map((q, i) => ({
        ...q,
        id: startId + allQuestions.length + i,
      }));

      allQuestions.push(...questionsWithId);

      log(`  当前进度: ${allQuestions.length}/${totalCount}`);

      // 批次间延迟，避免API限流
      if (batch < batchCount - 1) {
        const delay = 2000;
        log(`  等待 ${delay / 1000} 秒...`);
        await sleep(delay);
      }
    } catch (error: any) {
      log(`  第${batch + 1}批生成失败: ${error.message}`);
      // 继续下一批
    }
  }

  // 保存结果
  const output: QuestionBank = { questions: allQuestions };
  ensureOutputDir();
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8');

  log(`\n${difficultyName}难度题库生成完成:`);
  log(`  总计: ${allQuestions.length} 道题`);
  log(`  填空题: ${allQuestions.filter((q) => q.type === 'fill').length} 道`);
  log(`  释义题: ${allQuestions.filter((q) => q.type === 'meaning').length} 道`);
  log(`  看图猜: ${allQuestions.filter((q) => q.type === 'picture').length} 道`);
  log(`  保存至: ${outputFile}`);
}

// ==================== 入口 ====================

async function main(): Promise<void> {
  log('成语题库生成器 v1.0');
  log(`API Key: ${API_KEY ? '已设置 ✓' : '未设置 ✗'}`);
  log(`输出目录: ${OUTPUT_DIR}`);

  if (!API_KEY) {
    log('\n⚠️  未检测到 DEEPSEEK_API_KEY 环境变量！');
    log('请先设置: export DEEPSEEK_API_KEY=your_key');
    log('然后重新运行: npm run generate\n');
    process.exit(1);
  }

  ensureOutputDir();

  for (const config of CONFIGS) {
    await generateForDifficulty(config);
  }

  log('\n🎉 所有题库生成完成！');
  log('生成的文件:');
  for (const config of CONFIGS) {
    if (fs.existsSync(config.outputFile)) {
      const data = JSON.parse(fs.readFileSync(config.outputFile, 'utf-8')) as QuestionBank;
      log(`  ${config.outputFile}: ${data.questions.length} 道题`);
    }
  }
}

main().catch((error) => {
  log(`程序异常退出: ${error.message}`);
  process.exit(1);
});
