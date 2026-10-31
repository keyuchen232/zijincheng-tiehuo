/* 演示用 AI 接入配置（B 方案：随页面发布，供匿名评审直接体验）
   接口：奇绩算力 api.openai-next.com（OpenAI 兼容）
   如需换 key / 模型，改这里即可，ai.js 会优先使用它。 */
window.WXL_AI = {
  base: 'https://api.openai-next.com/v1',
  key: 'sk-SIJDMT3DfzWrDkFi066f71FdAf274eD7A8Bd152b765dC9D0',
  models: ['gemini-2.5-flash', 'deepseek-v4-flash', 'chatgpt-4o-latest'],
};
