import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SessionReviewPanel from '@/components/hr/SessionReviewPanel';
import { useAuth } from '@/contexts/AuthContext';

export default function HRSessionsReviewPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sessions to Review</h1>
          <p className="text-sm text-muted-foreground">Review completed mandatory feedback sessions and ingest derived scores into NOVA analytics.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/hr/sessions-schedule')}>
            Schedule a Session
          </Button>
          <Button
            onClick={async () => {
              if (!token) return;
              await fetch('/api/feedback/sessions/seed-demo', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
              });
              window.location.reload();
            }}
          >
            Load Demo Reviews
          </Button>
        </div>
      </div>
      <SessionReviewPanel />
    </div>
  );
}
