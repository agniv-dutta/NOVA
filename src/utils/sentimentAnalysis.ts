import { SentimentResult } from '@/types/employee';

const POSITIVE_WORDS: Record<string, number> = {
  excellent: 1.0, great: 0.8, amazing: 0.9, motivated: 0.8, engaged: 0.7,
  satisfied: 0.7, happy: 0.8, love: 0.9, enjoy: 0.7, fantastic: 0.9,
  productive: 0.7, supported: 0.7, appreciated: 0.8, growing: 0.6,
  collaborative: 0.6, innovative: 0.7, inspiring: 0.8, rewarding: 0.8,
  thriving: 0.9, proud: 0.7, exciting: 0.7, empowered: 0.8, valued: 0.8,
  positive: 0.6, balanced: 0.5, comfortable: 0.5, flexible: 0.6,
  helpful: 0.6, successful: 0.7, opportunity: 0.5, growth: 0.6,
};

const NEGATIVE_WORDS: Record<string, number> = {
  stressed: -0.8, overwhelmed: -0.9, frustrated: -0.8, burned: -0.9,
  leaving: -1.0, exhausted: -0.9, unhappy: -0.8, underpaid: -0.7,
  toxic: -1.0, micromanaged: -0.8, ignored: -0.7, overworked: -0.9,
  demotivated: -0.8, disconnected: -0.7, boring: -0.5, stagnant: -0.6,
  undervalued: -0.8, anxious: -0.7, unfair: -0.8, quit: -1.0,
  burnout: -0.9, terrible: -0.9, hate: -0.9, awful: -0.9, dread: -0.8,
  miserable: -0.9, resentful: -0.7, unsupported: -0.7, chaotic: -0.7,
  disorganized: -0.6, pressure: -0.6, conflict: -0.6, struggle: -0.5,
};

export function analyzeSentiment(text: string): SentimentResult {
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  const keywords: SentimentResult['keywords'] = [];
  let totalScore = 0;
  let wordCount = 0;

  for (const word of words) {
    if (POSITIVE_WORDS[word]) {
      keywords.push({ word, sentiment: 'positive', weight: POSITIVE_WORDS[word] });
      totalScore += POSITIVE_WORDS[word];
      wordCount++;
    } else if (NEGATIVE_WORDS[word]) {
      keywords.push({ word, sentiment: 'negative', weight: Math.abs(NEGATIVE_WORDS[word]) });
      totalScore += NEGATIVE_WORDS[word];
      wordCount++;
    }
  }

  const score = wordCount > 0 ? Math.max(-1, Math.min(1, totalScore / wordCount)) : 0;
  const confidence = Math.min(100, wordCount * 15 + 30);
  const label = score > 0.15 ? 'Positive' : score < -0.15 ? 'Negative' : 'Neutral';

  // Sort keywords by weight desc
  keywords.sort((a, b) => b.weight - a.weight);

  return { score, label, confidence, keywords: keywords.slice(0, 10) };
}

export function getSentimentLabel(score: number): 'Positive' | 'Neutral' | 'Negative' {
  if (score > 0.15) return 'Positive';
  if (score < -0.15) return 'Negative';
  return 'Neutral';
}

export function getSentimentEmoji(score: number): string {
  if (score > 0.5) return '😊';
  if (score > 0.15) return '🙂';
  if (score > -0.15) return '😐';
  if (score > -0.5) return '😟';
  return '😢';
}
