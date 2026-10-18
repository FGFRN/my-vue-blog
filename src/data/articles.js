import { seedArticles } from './seed.js'

const readingMinutes = { interface: 8, quiet: 6, tools: 5, offline: 4 }
const coverIds = { interface: 'interface', quiet: 'quiet', tools: 'wave', offline: 'book' }
export const initialArticles = Object.entries(seedArticles).map(([id, article]) => ({
  id,
  title: article.title,
  category: article.category === '设计与科技' ? '科技' : article.category,
  tags: id === 'interface' ? ['人工智能', '设计'] : [article.category],
  excerpt: article.intro,
  content: article.sections.map(([heading, paragraph]) => `## ${heading}\n${paragraph}`).join('\n\n'),
  cover: coverIds[id],
  date: { interface: '2026-10-12', quiet: '2026-10-08', tools: '2026-10-03', offline: '2026-09-28' }[id],
  minutes: readingMinutes[id],
  views: 0,
  demo: true,
}))

// Additional examples make pagination observable without requiring any manual setup.
initialArticles.push(
  { id: 'small-steps', title: '把想法变成作品，从小处开始', category: '设计', tags: ['创作', '实践'], excerpt: '先做出一个能被使用的小作品，再在反馈中慢慢改进。', content: '## 从一个问题开始\n作品不一定需要宏大的目标。找一个每天都会遇到的小问题，描述清楚它给谁带来了什么困扰。\n\n## 留下迭代的痕迹\n记录每一次取舍，比一次性追求完美更有价值。把最重要的路径先走通，再逐步完善边缘细节。', cover: 'quiet', date: '2026-09-20', minutes: 3, views: 0, demo: true },
  { id: 'notes-on-learning', title: '学习笔记，也是一种与自己对话', category: '生活与创作', tags: ['学习', '随笔'], excerpt: '比起收藏更多链接，试着用自己的语言解释一个刚刚理解的概念。', content: '## 用自己的话解释\n如果不能清楚地解释一个概念，也许还有值得继续追问的地方。写下自己的理解，能让这些空白变得可见。\n\n## 定期重新阅读\n旧笔记会记录我们思考方式的变化。重新阅读时，补充新的例子，也允许自己修正过去的判断。', cover: 'book', date: '2026-09-12', minutes: 3, views: 0, demo: true },
)
