import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import KnowledgeAssistant from './components/KnowledgeAssistant'
import { courseTopics } from './content/course'
import { ContentSection } from './types'

const progressKey = 'ai-play-progress-v2'

function loadProgress() {
  try {
    const saved = localStorage.getItem(progressKey)
    return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>()
  } catch {
    return new Set<string>()
  }
}

function countSections() {
  return courseTopics.reduce(
    (sum, topic) => sum + topic.levels.reduce((levelSum, level) => levelSum + level.sections.length, 0),
    0
  )
}

function sectionMatches(section: ContentSection, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const haystack = [
    section.title,
    section.content,
    section.keyPoint ?? '',
    ...(section.tags ?? []),
    ...(section.checklist ?? []),
    section.quiz?.question ?? '',
    section.quiz?.answer ?? ''
  ].join(' ').toLowerCase()

  return haystack.includes(normalized)
}

export default function App() {
  const [activeTopicId, setActiveTopicId] = useState(courseTopics[0].id)
  const [activeLevelId, setActiveLevelId] = useState(courseTopics[0].levels[0].id)
  const [expandedSectionId, setExpandedSectionId] = useState(courseTopics[0].levels[0].sections[0].id)
  const [completed, setCompleted] = useState<Set<string>>(() => loadProgress())
  const [query, setQuery] = useState('')

  const totalSections = useMemo(() => countSections(), [])
  const activeTopic = courseTopics.find((topic) => topic.id === activeTopicId) ?? courseTopics[0]
  const activeLevel = activeTopic.levels.find((level) => level.id === activeLevelId) ?? activeTopic.levels[0]

  const filteredSections = activeLevel.sections.filter((section) => sectionMatches(section, query))
  const topicDone = activeTopic.levels.reduce(
    (sum, level) => sum + level.sections.filter((section) => completed.has(section.id)).length,
    0
  )
  const topicTotal = activeTopic.levels.reduce((sum, level) => sum + level.sections.length, 0)
  const levelDone = activeLevel.sections.filter((section) => completed.has(section.id)).length
  const allDone = completed.size

  useEffect(() => {
    localStorage.setItem(progressKey, JSON.stringify([...completed]))
  }, [completed])

  function selectTopic(topicId: string) {
    const nextTopic = courseTopics.find((topic) => topic.id === topicId) ?? courseTopics[0]
    setActiveTopicId(nextTopic.id)
    setActiveLevelId(nextTopic.levels[0].id)
    setExpandedSectionId(nextTopic.levels[0].sections[0].id)
    setQuery('')
  }

  function selectLevel(levelId: string) {
    const nextLevel = activeTopic.levels.find((level) => level.id === levelId) ?? activeTopic.levels[0]
    setActiveLevelId(nextLevel.id)
    setExpandedSectionId(nextLevel.sections[0].id)
  }

  function toggleDone(sectionId: string) {
    setCompleted((current) => {
      const next = new Set(current)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  return (
    <div className="app-shell">
      <aside className="course-sidebar">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div>
            <h1>AI Play</h1>
            <p>系统化学习工作台</p>
          </div>
        </div>

        <div className="overall-progress">
          <div className="progress-copy">
            <span>总进度</span>
            <strong>{Math.round((allDone / totalSections) * 100)}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${(allDone / totalSections) * 100}%` }} />
          </div>
          <p>{allDone} / {totalSections} 个节点已完成</p>
        </div>

        <nav className="topic-list" aria-label="课程主题">
          {courseTopics.map((topic) => {
            const done = topic.levels.reduce(
              (sum, level) => sum + level.sections.filter((section) => completed.has(section.id)).length,
              0
            )
            const total = topic.levels.reduce((sum, level) => sum + level.sections.length, 0)

            return (
              <button
                key={topic.id}
                className={`topic-button ${activeTopic.id === topic.id ? 'topic-button--active' : ''}`}
                onClick={() => selectTopic(topic.id)}
                style={{ '--topic-color': topic.color } as CSSProperties}
              >
                <span className="topic-icon">{topic.icon}</span>
                <span className="topic-text">
                  <strong>{topic.title}</strong>
                  <small>{done}/{total} 完成</small>
                </span>
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="learning-workspace">
        <header className="workspace-header" style={{ '--topic-color': activeTopic.color } as CSSProperties}>
          <div className="topic-kicker">
            <span>{activeTopic.icon}</span>
            <span>{activeTopic.audience}</span>
          </div>
          <div className="header-grid">
            <div>
              <h2>{activeTopic.title}</h2>
              <p>{activeTopic.description}</p>
            </div>
            <div className="search-box">
              <label htmlFor="course-search">搜索当前层级</label>
              <input
                id="course-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="例如：评估、权限、chunk"
              />
            </div>
          </div>

          <div className="topic-meta">
            <div>
              <span>主题进度</span>
              <strong>{topicDone}/{topicTotal}</strong>
            </div>
            <div>
              <span>当前层级</span>
              <strong>{levelDone}/{activeLevel.sections.length}</strong>
            </div>
            <div>
              <span>预计耗时</span>
              <strong>{activeLevel.duration}</strong>
            </div>
          </div>
        </header>

        <section className="level-tabs" aria-label="学习层级">
          {activeTopic.levels.map((level, index) => (
            <button
              key={level.id}
              className={`level-tab ${activeLevel.id === level.id ? 'level-tab--active' : ''}`}
              onClick={() => selectLevel(level.id)}
            >
              <span>{index + 1}</span>
              {level.label}
            </button>
          ))}
        </section>

        <div className="content-grid">
          <section className="lesson-column">
            <div className="level-intro">
              <div>
                <h3>{activeLevel.label}</h3>
                <p>{activeLevel.description}</p>
              </div>
              <div className="level-project">
                <span>阶段练习</span>
                <strong>{activeLevel.project}</strong>
              </div>
            </div>

            <div className="outcome-strip">
              {(activeLevel.outcomes ?? []).map((outcome) => (
                <span key={outcome}>{outcome}</span>
              ))}
            </div>

            <div className="section-list">
              {filteredSections.map((section, index) => {
                const expanded = expandedSectionId === section.id
                const done = completed.has(section.id)

                return (
                  <article key={section.id} className={`lesson-card ${expanded ? 'lesson-card--open' : ''}`}>
                    <button className="lesson-head" onClick={() => setExpandedSectionId(expanded ? '' : section.id)}>
                      <span className={`done-dot ${done ? 'done-dot--checked' : ''}`}>{done ? '✓' : index + 1}</span>
                      <span>
                        <strong>{section.title}</strong>
                        <small>{section.tags?.join(' / ')}</small>
                      </span>
                      <span className="chevron">{expanded ? '−' : '+'}</span>
                    </button>

                    {expanded && (
                      <div className="lesson-body">
                        <div className="rich-text" dangerouslySetInnerHTML={{ __html: section.content }} />

                        {section.codeExample && (
                          <pre className="code-sample"><code>{section.codeExample}</code></pre>
                        )}

                        {section.keyPoint && (
                          <div className="key-note">
                            <span>重点</span>
                            <p>{section.keyPoint}</p>
                          </div>
                        )}

                        {section.checklist && (
                          <div className="checklist">
                            <h4>检查点</h4>
                            {section.checklist.map((item) => (
                              <label key={item}>
                                <input type="checkbox" />
                                <span>{item}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {section.quiz && (
                          <details className="quiz-box">
                            <summary>{section.quiz.question}</summary>
                            <p>{section.quiz.answer}</p>
                          </details>
                        )}

                        <button className="complete-button" onClick={() => toggleDone(section.id)}>
                          {done ? '标记为未完成' : '完成这个节点'}
                        </button>
                      </div>
                    )}
                  </article>
                )
              })}

              {filteredSections.length === 0 && (
                <div className="empty-state">
                  <strong>当前层级没有匹配内容</strong>
                  <p>换一个关键词，或者切到其他主题继续找。</p>
                </div>
              )}
            </div>
          </section>

          <aside className="study-panel">
            <KnowledgeAssistant />

            <section>
              <h3>学习前提</h3>
              <ul>
                {activeTopic.prerequisites?.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h3>推荐资源</h3>
              <ul>
                {activeTopic.resources?.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h3>使用建议</h3>
              <p>按主题从左到右学习；每个层级先扫目标，再展开章节。完成练习后再标记节点，进度会保存在本机。</p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}
