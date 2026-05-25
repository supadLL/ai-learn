import { useState } from 'react'
import { LearningLevel, ContentSection } from '../types'

interface LearningLayoutProps {
  levels: LearningLevel[]
  topicColor: string
}

function SectionCard({ section, index }: { section: ContentSection; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`section-card ${expanded ? 'section-card--expanded' : ''}`}>
      <button className="section-header" onClick={() => setExpanded(!expanded)}>
        <span className="section-number">{String(index + 1).padStart(2, '0')}</span>
        <span className="section-title">{section.title}</span>
        <span className="section-arrow">{expanded ? '▾' : '▸'}</span>
      </button>
      <div className="section-body">
        <div className="section-content" dangerouslySetInnerHTML={{ __html: section.content }} />
        {section.codeExample && (
          <div className="code-block">
            <div className="code-header">
              <span>示例代码</span>
            </div>
            <pre><code>{section.codeExample}</code></pre>
          </div>
        )}
        {section.keyPoint && (
          <div className="key-point">
            <span className="key-point-icon">💡</span>
            <span>{section.keyPoint}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LearningLayout({ levels, topicColor }: LearningLayoutProps) {
  const [activeLevel, setActiveLevel] = useState(0)

  const currentLevel = levels[activeLevel]

  return (
    <div className="learning-layout">
      {/* 层级选择器 */}
      <div className="level-selector">
        {levels.map((level, i) => (
          <button
            key={level.id}
            className={`level-btn ${activeLevel === i ? 'level-btn--active' : ''}`}
            style={activeLevel === i ? { borderColor: topicColor, color: topicColor } : {}}
            onClick={() => setActiveLevel(i)}
          >
            <span className="level-index">{i + 1}</span>
            <span className="level-label">{level.label}</span>
          </button>
        ))}
        {/* 进度指示器 */}
        <div className="level-progress">
          <div
            className="level-progress-bar"
            style={{
              width: `${((activeLevel + 1) / levels.length) * 100}%`,
              backgroundColor: topicColor
            }}
          />
        </div>
      </div>

      {/* 当前层级内容 */}
      <div className="level-content">
        <div className="level-header">
          <h2 className="level-title">{currentLevel.label}</h2>
          <p className="level-desc">{currentLevel.description}</p>
        </div>
        <div className="sections-list">
          {currentLevel.sections.map((section, i) => (
            <SectionCard key={section.id} section={section} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
