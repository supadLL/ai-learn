// 学习内容的节点类型
export interface ContentSection {
  id: string
  title: string
  content: string
  codeExample?: string
  keyPoint?: string
  tags?: string[]
  checklist?: string[]
  quiz?: {
    question: string
    answer: string
  }
}

// 每个技术主题下的学习层级
export interface LearningLevel {
  id: string
  label: string           // 入门 / 进阶 / 深入
  description: string
  duration?: string
  outcomes?: string[]
  project?: string
  sections: ContentSection[]
}

// 整个技术主题
export interface TechTopic {
  id: string
  title: string
  icon: string
  description: string
  color?: string
  audience?: string
  prerequisites?: string[]
  resources?: string[]
  levels: LearningLevel[]
}

// Tab 导航项
export interface TabItem {
  id: string
  label: string
  icon: string
}
