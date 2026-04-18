import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { Briefcase, CheckCircle, XCircle, Pencil, Bot, AlertTriangle } from "lucide-react";

interface JobPosting {
  id: string;
  jira_issue_key: string | null;
  title: string;
  description: string;
  required_skills: string[];
  workplace_type: string;
  employment_type: string;
  status: "limbo" | "approved" | "closed";
  ai_reasoning: string;
  internal_match?: {
    fit_percent: number;
    recommended_name: string | null;
    recommended_email: string | null;
    status: string;
    ai_reasoning: string;
    no_internal_match: boolean;
  };
  manual_review_needed?: boolean;
  flagged_terms?: string[];
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

const WORKPLACE_LABELS: Record<string, string> = {
  ON_SITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

export default function JobBoardPage() {
  useDocumentTitle("NOVA - Job Board");
  const { token } = useAuth();
  const { toast } = useToast();

  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("limbo");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [editPosting, setEditPosting] = useState<JobPosting | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [editWorkplace, setEditWorkplace] = useState("HYBRID");
  const [editEmployment, setEditEmployment] = useState("FULL_TIME");
  const [editLoading, setEditLoading] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [publishPreview, setPublishPreview] = useState<JobPosting | null>(null);

  const authHeader = { Authorization: `Bearer ${token}` };

  const fetchPostings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/job-board?status=${activeTab}`, { headers: authHeader });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPostings(data.postings ?? []);
    } catch {
      setPostings([]);
    } finally {
      setLoading(false);
    }
  }, [token, activeTab]);

  useEffect(() => {
    void fetchPostings();
  }, [fetchPostings]);

  const approve = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/job-board/${id}/approve`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to approve");
      const payload = await res.json();
      await fetchPostings();
      toast({ title: `Job posted: ${payload.title || "Posting"}` });
    } finally {
      setActionLoading(null);
    }
  };

  const isRejection = (p: JobPosting) => {
    if (p.internal_match?.no_internal_match) return true;
    return p.ai_reasoning?.toLowerCase().includes("no match");
  };

  const close = async (id: string) => {
    setActionLoading(id);
    try {
      await fetch(`${API_BASE_URL}/api/job-board/${id}/close`, { method: "POST", headers: authHeader });
      await fetchPostings();
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (p: JobPosting) => {
    setEditPosting(p);
    setEditTitle(p.title);
    setEditDescription(p.description);
    setEditSkills(p.required_skills.join(", "));
    setEditWorkplace(p.workplace_type);
    setEditEmployment(p.employment_type);
  };

  const saveEdit = async () => {
    if (!editPosting) return;
    setEditLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/job-board/${editPosting.id}`, {
        method: "PUT",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          required_skills: editSkills.split(",").map((s) => s.trim()).filter(Boolean),
          workplace_type: editWorkplace,
          employment_type: editEmployment,
        }),
      });
      setEditPosting(null);
      await fetchPostings();
    } finally {
      setEditLoading(false);
    }
  };

  const renderPosting = (p: JobPosting) => (
    <Card key={p.id} className="border-2 border-foreground shadow-[2px_2px_0px_#000]">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            {p.jira_issue_key && (
              <span className="text-xs font-mono font-bold bg-foreground text-background px-1.5 py-0.5 mr-2">
                {p.jira_issue_key}
              </span>
            )}
            <CardTitle className="text-base mt-1">{p.title}</CardTitle>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="outline">{WORKPLACE_LABELS[p.workplace_type] ?? p.workplace_type}</Badge>
              <Badge variant="outline">{EMPLOYMENT_LABELS[p.employment_type] ?? p.employment_type}</Badge>
            </div>
          </div>
          {p.status === "approved" && (
            <Badge className="shrink-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Published
            </Badge>
          )}
          {p.status === "closed" && (
            <Badge variant="secondary" className="shrink-0">
              <XCircle className="h-3 w-3 mr-1" />
              Closed
            </Badge>
          )}
          {p.status === "limbo" && (
            <Badge variant="secondary" className="shrink-0 bg-yellow-100 text-yellow-800 border-yellow-300">
              Awaiting Approval
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Required skills */}
        <div className="flex flex-wrap gap-1">
          {p.required_skills.map((s) => (
            <span key={s} className="text-xs border border-foreground px-1.5 py-0.5 font-medium bg-card">
              {s}
            </span>
          ))}
        </div>

        {/* AI reasoning */}
        {(p.ai_reasoning || p.internal_match) && (
          <div className="rounded-md bg-[#fef3c7] border-l-4 border-amber-500 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
              <div className="space-y-1 min-w-0 w-full">
                <p className="text-sm font-bold text-amber-900">AI Talent Analysis</p>
                {isRejection(p) ? (
                  <span className="inline-flex rounded-full bg-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                    No Internal Match Found - External Hire Recommended
                  </span>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs text-amber-900 font-semibold">
                      Best internal match: {p.internal_match?.recommended_name || "Candidate"} - {p.internal_match?.fit_percent ?? 0}% fit
                    </p>
                    <div className="h-2 rounded bg-amber-100 overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, Math.max(0, p.internal_match?.fit_percent ?? 0))}%` }} />
                    </div>
                    <a href="/work-profiles" className="text-xs text-amber-900 underline underline-offset-2">View candidate profile →</a>
                  </div>
                )}
                {p.ai_reasoning && <p className="text-xs text-amber-900">{p.ai_reasoning}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Description preview */}
        <div
          className="text-xs text-muted-foreground prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html: (expandedDescriptions[p.id] ? p.description : (p.description.length > 200 ? `${p.description.slice(0, 200)}...` : p.description)),
          }}
        />
        {p.description.length > 200 && (
          <button
            type="button"
            className="text-xs text-primary underline underline-offset-2"
            onClick={() => setExpandedDescriptions((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
          >
            {expandedDescriptions[p.id] ? "Read less" : "Read more"}
          </button>
        )}

        <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
          <p className="text-xs text-muted-foreground">
            Created {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            {p.approved_by && ` · Approved by ${p.approved_by}`}
          </p>

          <div className="flex gap-2">
            {(p.status === "limbo" || p.status === "approved") && (
              <Button
                size="sm"
                variant="outline"
                className="border-2 border-foreground"
                onClick={() => openEdit(p)}
                disabled={actionLoading === p.id}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            )}
            {p.status === "limbo" && (
              <Button
                size="sm"
                className="border-2 border-foreground shadow-[2px_2px_0px_#000]"
                onClick={() => setPublishPreview(p)}
                disabled={actionLoading === p.id}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Publish
              </Button>
            )}
            {p.status === "approved" && (
              <Button
                size="sm"
                variant="outline"
                className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
                onClick={() => close(p.id)}
                disabled={actionLoading === p.id}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Close Posting
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Job Board</h1>
        <p className="text-sm text-muted-foreground">
          Job postings auto-generated when JIRA tickets have no matching talent. Approve to publish.
        </p>
      </div>

      {/* Edit dialog */}
      {editPosting && (
        <Dialog open={!!editPosting} onOpenChange={() => setEditPosting(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job Posting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Job Title</Label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="border-2 border-foreground mt-1"
                />
              </div>
              <div>
                <Label>Required Skills (comma-separated)</Label>
                <Input
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  className="border-2 border-foreground mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Workplace</Label>
                  <Select value={editWorkplace} onValueChange={setEditWorkplace}>
                    <SelectTrigger className="border-2 border-foreground mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ON_SITE">On-site</SelectItem>
                      <SelectItem value="REMOTE">Remote</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Employment Type</Label>
                  <Select value={editEmployment} onValueChange={setEditEmployment}>
                    <SelectTrigger className="border-2 border-foreground mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Full-time</SelectItem>
                      <SelectItem value="PART_TIME">Part-time</SelectItem>
                      <SelectItem value="CONTRACT">Contract</SelectItem>
                      <SelectItem value="INTERNSHIP">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description (HTML)</Label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="border-2 border-foreground mt-1 font-mono text-xs"
                  rows={12}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditPosting(null)}>Cancel</Button>
                <Button
                  className="border-2 border-foreground shadow-[2px_2px_0px_#000]"
                  onClick={saveEdit}
                  disabled={editLoading}
                >
                  {editLoading ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {publishPreview && (
        <Dialog open={!!publishPreview} onOpenChange={() => setPublishPreview(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview Before Publishing</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm font-semibold">{publishPreview.title}</p>
              <div className="flex flex-wrap gap-2">
                {(publishPreview.required_skills || []).map((skill) => (
                  <Badge key={skill} variant="outline">{skill}</Badge>
                ))}
              </div>
              <div className="rounded border p-3 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: publishPreview.description }} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPublishPreview(null)}>Cancel</Button>
                <Button
                  className="border-2 border-foreground shadow-[2px_2px_0px_#000]"
                  onClick={async () => {
                    await approve(publishPreview.id);
                    setPublishPreview(null);
                    setActiveTab("approved");
                  }}
                >
                  Confirm & Publish
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-2 border-foreground">
          <TabsTrigger value="limbo">Awaiting Approval</TabsTrigger>
          <TabsTrigger value="approved">Published</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        {["limbo", "approved", "closed"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <Skeleton key={i} className="h-56 w-full" />)}
              </div>
            ) : postings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-foreground text-center">
                <Briefcase className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-semibold">No {tab === "limbo" ? "pending" : tab} postings</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {tab === "limbo"
                    ? "Job postings appear here when JIRA tickets have no matching employee."
                    : `No ${tab} job postings.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">{postings.map(renderPosting)}</div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
