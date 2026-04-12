import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { protectedGetApi, protectedPostApi } from '@/lib/api';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LineChart, CartesianGrid, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ClipboardList, CheckCircle2 } from 'lucide-react';

type PendingSession = {
  id: string;
  employee_id: string;
  department?: string;
  scheduled_date: string;
  status: string;
  hr_reviewed: boolean;
  emotion_analysis?: { dominant_emotion?: string; duration_seconds?: number; follow_up_required?: boolean };
};

type SessionResults = {
  id: string;
  employee_id: string;
  recording_url?: string | null;
  transcript: string;
  emotion_timeline: Array<{ segment: string; stress: number; confidence: number; hesitation?: number }>;
  emotion_analysis: { red_flags?: string[]; key_themes?: string[]; dominant_emotion?: string; hesitation_marker_count?: number };
  derived_scores: Record<string, number>;
  hr_summary: string;
};

function emotionBadge(value?: string): string {
  const normalized = (value || '').toLowerCase();
  if (normalized.includes('stress')) return '?? Stress Detected';
  if (normalized.includes('positive')) return '?? Positive';
  return '?? Neutral';
}

function durationLabel(seconds?: number): string {
  const value = Number(seconds || 0);
  const mins = Math.floor(value / 60);
  const secs = value % 60;
  return `${mins} min ${secs} sec`;
}

export default function SessionReviewPanel() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [pending, setPending] = useState<PendingSession[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const selected = useMemo(() => pending.find((item) => item.id === selectedId) ?? null, [pending, selectedId]);
  const selectedIsCompleted = (selected?.status || '').toLowerCase() === 'completed';

  const fetchPending = async () => {
    if (!token) return;
    const payload = await protectedGetApi<{ sessions?: PendingSession[] }>('/api/feedback/sessions/pending-review', token);
    setPending(payload.sessions || []);
    if (!selectedId && payload.sessions?.length) {
      setSelectedId(payload.sessions[0].id);
    }
  };

  const fetchResults = async (id: string) => {
    if (!token) return;
    const payload = await protectedGetApi<SessionResults>(`/api/feedback/sessions/${id}/results`, token);
    setResults(payload);
  };

  useEffect(() => {
    void fetchPending();
  }, [token]);

  useEffect(() => {
    if (selectedId && selectedIsCompleted) {
      void fetchResults(selectedId);
    } else {
      setResults(null);
    }
  }, [selectedId, token, selectedIsCompleted]);

  const ingest = async () => {
    if (!token || !selectedId || !selected) return;
    setBusy(true);
    try {
      await protectedPostApi(`/api/feedback/sessions/${selectedId}/hr-ingest`, token, { notes });
      toast({ title: 'Success', description: `Scores updated for ${selected.employee_id}` });
      setNotes('');
      await fetchPending();
      setResults(null);
      setSelectedId(null);
    } catch (err) {
      toast({ title: 'Ingestion failed', description: err instanceof Error ? err.message : 'Try again' });
    } finally {
      setBusy(false);
    }
  };

  const flagFollowUp = async () => {
    if (!token || !selectedId) return;
    setBusy(true);
    try {
      await protectedPostApi(`/api/feedback/sessions/${selectedId}/flag-follow-up`, token, {});
      toast({ title: 'Follow-up flagged', description: 'Session remains in queue with follow-up tag.' });
      await fetchPending();
    } catch (err) {
      toast({ title: 'Action failed', description: err instanceof Error ? err.message : 'Try again' });
    } finally {
      setBusy(false);
    }
  };

  const transcriptBlocks = useMemo(() => {
    const transcript = results?.transcript || '';
    const parts = transcript.split(/Q\d:/).filter(Boolean);
    const redFlags = results?.emotion_analysis?.red_flags || [];

    return parts.map((part, index) => {
      let text = part.trim();
      redFlags.forEach((flag) => {
        if (!flag) return;
        const escaped = flag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'ig');
        text = text.replace(regex, '[[H]]$1[[/H]]');
      });
      return { question: `Question ${index + 1}`, text };
    });
  }, [results?.transcript, results?.emotion_analysis?.red_flags]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle>Session Queue ({pending.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {pending.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`w-full text-left rounded border p-3 ${selectedId === item.id ? 'border-primary bg-primary/5' : 'border-border'}`}
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full border flex items-center justify-center text-xs font-semibold">
                  {(item.employee_id || 'E').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.employee_id}</p>
                  <p className="text-xs text-muted-foreground">{item.department || 'Unknown department'}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Scheduled: {new Date(item.scheduled_date).toLocaleDateString()}</p>
              <p className="text-xs text-muted-foreground">Duration: {durationLabel(item.emotion_analysis?.duration_seconds)}</p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{emotionBadge(item.emotion_analysis?.dominant_emotion)}</Badge>
                <Badge variant="outline" className="uppercase">{item.status || 'scheduled'}</Badge>
                {item.emotion_analysis?.follow_up_required ? <Badge className="bg-orange-500">Follow-up</Badge> : null}
              </div>
            </button>
          ))}
          {pending.length === 0 && (
            <div className="rounded border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800 space-y-3">
              <div className="flex flex-col items-center text-center gap-2">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                <p className="font-semibold">All caught up!</p>
              </div>
              <p>
                Use the Schedule Sessions tab to create a recorded feedback session, or seed demo data to populate the queue immediately.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={async () => {
                    if (!token) return;
                    await protectedPostApi('/api/feedback/sessions/seed-demo', token, {});
                    await fetchPending();
                  }}
                >
                  Seed Demo Reviews
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Session Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selected && (
            <div className="rounded border p-8 text-center text-muted-foreground space-y-3">
              <ClipboardList className="h-12 w-12 mx-auto text-slate-400" />
              <p>Select a session from the left to view status or begin review</p>
            </div>
          )}

          {selected && !selectedIsCompleted && (
            <div className="rounded border p-6 text-center text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Session not ready for HR review yet</p>
              <p>Status: <span className="uppercase">{selected.status}</span></p>
              <p>Once this session is completed by the employee, transcript and emotion analysis will appear here automatically.</p>
            </div>
          )}

          {selected && selectedIsCompleted && results && (
            <>
              <div className="rounded border p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{selected.employee_id}</p>
                  <p className="text-xs text-muted-foreground">{selected.department || 'Department unavailable'}</p>
                </div>
                <Badge>Burnout risk: review required</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded border p-3">
                  <p className="text-muted-foreground">Date recorded</p>
                  <p className="font-medium">{new Date(selected.scheduled_date).toLocaleString()}</p>
                </div>
                <div className="rounded border p-3">
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{durationLabel(selected.emotion_analysis?.duration_seconds)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Transcript Viewer</h3>
                <Accordion type="single" collapsible className="w-full">
                  {transcriptBlocks.map((block, index) => (
                    <AccordionItem key={index} value={`q-${index}`}>
                      <AccordionTrigger>{block.question}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm leading-relaxed">
                          {block.text.split(/(\[\[H\]\].*?\[\[\/H\]\])/g).map((part, i) => {
                            if (part.startsWith('[[H]]') && part.endsWith('[[/H]]')) {
                              const inner = part.replace('[[H]]', '').replace('[[/H]]', '');
                              return (
                                <span key={i} className="bg-red-100 text-red-800 font-medium px-0.5" title="AI flagged: High stress markers detected">
                                  {inner}
                                </span>
                              );
                            }
                            return <span key={i}>{part}</span>;
                          })}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Emotion Analysis</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.emotion_timeline || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="segment" />
                      <YAxis domain={[0, 1]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="confidence" stroke="#22c55e" strokeWidth={2} />
                      <Line type="monotone" dataKey="hesitation" stroke="#eab308" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary">Dominant Emotion: {results.emotion_analysis?.dominant_emotion || 'neutral'}</Badge>
                  <Badge variant="outline">Hesitation markers detected: {results.emotion_analysis?.hesitation_marker_count || 0} times</Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Derived Scores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(results.derived_scores || {}).map(([key, value]) => (
                    <div key={key} className="rounded border p-3">
                      <p className="text-xs text-muted-foreground mb-1">{key.replace(/_/g, ' ')}</p>
                      <Progress value={Math.round(Number(value) * 100)} />
                      <p className="text-xs mt-1 font-medium">{Number(value).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded border p-3">
                <h3 className="font-semibold mb-1">AI Summary</h3>
                <p className="text-xs text-muted-foreground mb-2">AI-generated summary - verify against transcript</p>
                <p className="text-sm">{results.hr_summary}</p>
              </div>

              <div className="space-y-2">
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="HR Notes (optional)" />
                <div className="flex gap-2">
                  <Button onClick={ingest} disabled={busy} className="bg-yellow-500 hover:bg-yellow-600 text-black">Ingest into NOVA Analytics</Button>
                  <Button variant="outline" onClick={flagFollowUp} disabled={busy}>Flag for Follow-up</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
