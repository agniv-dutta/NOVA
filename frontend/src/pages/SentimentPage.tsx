import { SentimentAnalyzer } from '@/components/sentiment/SentimentAnalyzer';
import WordCloud from '@/components/sentiment/WordCloud';

export default function SentimentPage() {
  return (
    <div className="space-y-6">
      <SentimentAnalyzer />
      <WordCloud />
    </div>
  );
}
