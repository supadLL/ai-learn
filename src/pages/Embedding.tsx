import LearningLayout from '../components/LearningLayout'
import { embeddingContent } from '../content/embedding'

export default function EmbeddingPage() {
  return <LearningLayout levels={embeddingContent.levels} topicColor="#10b981" />
}
