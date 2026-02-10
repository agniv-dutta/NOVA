import { useState } from 'react';
import { analyzeSentiment, getSentimentEmoji } from '@/utils/sentimentAnalysis';
import { SentimentResult } from '@/types/employee';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareText, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import SentimentBreakdown from './SentimentBreakdown';

const SAMPLE_TEXTS = [
  "I'm really enjoying the new project. The team is fantastic and I feel motivated every day. Great leadership!",
  "Work is okay, nothing special. Some days are good, some are challenging. The role meets my basic expectations.",
  "I'm feeling overwhelmed and stressed. The constant overtime and pressure is leading to burnout. I dread Mondays.",
  "The company culture is amazing! I feel valued, supported, and excited about growth opportunities here.",
  "Frustrated with the lack of direction. Management seems disconnected. Considering my options elsewhere.",
];

export function SentimentAnalyzer() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 600));
    setResult(analyzeSentiment(text));
    setAnalyzing(false);
  };

  const loadSample = (sample: string) => {
    setText(sample);
    setResult(null);
  };

  const scoreColor = result
    ? result.label === 'Positive' ? 'text-risk-low'
    : result.label === 'Negative' ? 'text-risk-high'
    : 'text-muted-foreground'
    : '';

  const ScoreIcon = result?.label === 'Positive' ? TrendingUp : result?.label === 'Negative' ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Input area */}
      <div className="chart-container space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold">Analyze Employee Feedback</h3>
        </div>

        <Textarea
          value={text}
          onChange={e => { setText(e.target.value); setResult(null); }}
          placeholder="Paste employee feedback here to analyze sentiment..."
          rows={5}
          className="resize-none"
        />

        <div className="flex items-center gap-3">
          <Button onClick={handleAnalyze} disabled={!text.trim() || analyzing} className="gap-2">
            <Sparkles className="h-4 w-4" />
            {analyzing ? 'Analyzing...' : 'Analyze Sentiment'}
          </Button>
          <span className="text-xs text-muted-foreground">or try a sample →</span>
        </div>

        {/* Sample buttons */}
        <div className="flex flex-wrap gap-2">
          {SAMPLE_TEXTS.map((sample, i) => (
            <button
              key={i}
              onClick={() => loadSample(sample)}
              className="rounded-lg border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Sample {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Score card */}
            <div className="chart-container">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Overall Sentiment</p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-4xl">{getSentimentEmoji(result.score)}</span>
                    <div>
                      <p className={`text-2xl font-bold ${scoreColor}`}>{result.label}</p>
                      <p className="text-sm text-muted-foreground">
                        Score: <span className="font-semibold tabular-nums">{result.score > 0 ? '+' : ''}{result.score.toFixed(3)}</span>
                        {' · '}Confidence: <span className="font-semibold tabular-nums">{result.confidence}%</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`rounded-full p-3 ${
                  result.label === 'Positive' ? 'bg-risk-low/10' :
                  result.label === 'Negative' ? 'bg-risk-high/10' : 'bg-secondary'
                }`}>
                  <ScoreIcon className={`h-6 w-6 ${scoreColor}`} />
                </div>
              </div>

              {/* Score bar */}
              <div className="mt-4">
                <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-risk-high via-risk-medium to-risk-low" style={{ width: '100%' }} />
                  <div
                    className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-foreground shadow-md transition-all duration-500"
                    style={{ left: `${((result.score + 1) / 2) * 100}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>Very Negative (-1.0)</span>
                  <span>Neutral (0.0)</span>
                  <span>Very Positive (+1.0)</span>
                </div>
              </div>
            </div>

            {/* Keywords */}
            {result.keywords.length > 0 && (
              <div className="chart-container">
                <h4 className="text-sm font-semibold mb-3">Detected Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        kw.sentiment === 'positive' ? 'bg-risk-low/15 text-risk-low' :
                        kw.sentiment === 'negative' ? 'bg-risk-high/15 text-risk-high' :
                        'bg-secondary text-muted-foreground'
                      }`}
                      style={{ fontSize: `${Math.max(11, 11 + kw.weight * 3)}px` }}
                    >
                      {kw.word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Sentiment Breakdown */}
            <SentimentBreakdown text={text} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
