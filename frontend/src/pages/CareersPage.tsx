import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/lib/api";
import { Briefcase, MapPin, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicJobPosting {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  workplace_type: string;
  employment_type: string;
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

export default function CareersPage() {
  const [postings, setPostings] = useState<PublicJobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Careers - NOVA";
    fetch(`${API_BASE_URL}/api/job-board/public`)
      .then((r) => r.json())
      .then((d) => setPostings(d.postings ?? []))
      .catch(() => setPostings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-foreground bg-card px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            <span className="font-black text-lg tracking-tight">NOVA</span>
          </div>
          <span className="text-sm text-muted-foreground font-medium">Open Positions</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Hero */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight">We're hiring.</h1>
          <p className="text-muted-foreground">
            Join us and help build something meaningful. All positions are open until filled.
          </p>
        </div>

        {/* Listings */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-full" />
            ))}
          </div>
        ) : postings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-foreground text-center rounded-none">
            <Briefcase className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-semibold text-lg">No open positions right now</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon - we grow fast.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {postings.map((p) => (
              <Card
                key={p.id}
                className="border-2 border-foreground shadow-[3px_3px_0px_#000] cursor-pointer transition-shadow hover:shadow-[1px_1px_0px_#000]"
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 space-y-2">
                      <CardTitle className="text-lg">{p.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {WORKPLACE_LABELS[p.workplace_type] ?? p.workplace_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {EMPLOYMENT_LABELS[p.employment_type] ?? p.employment_type}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 mt-1">
                      {new Date(p.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Skills */}
                  <div className="flex flex-wrap gap-1">
                    {p.required_skills.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs font-medium">
                        {s}
                      </Badge>
                    ))}
                  </div>

                  {/* Expanded description */}
                  {expanded === p.id && (
                    <>
                      <div
                        className="prose prose-sm max-w-none text-sm pt-2 border-t border-muted"
                        dangerouslySetInnerHTML={{ __html: p.description }}
                      />
                      <a
                        href={`mailto:careers@gingerlabs.ai?subject=Application: ${encodeURIComponent(p.title)}&body=Hi,%0A%0AI'd like to apply for the ${encodeURIComponent(p.title)} role.%0A%0APlease find my resume and cover letter attached.%0A%0AThank you!`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button className="mt-2 border-2 border-foreground shadow-[2px_2px_0px_#000] w-full sm:w-auto">
                          <Mail className="h-4 w-4 mr-2" />
                          Apply - send resume &amp; cover letter to careers@gingerlabs.ai
                        </Button>
                      </a>
                    </>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {expanded === p.id ? "Click to collapse ↑" : "Click to read more ↓"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t-2 border-foreground mt-16 px-6 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} NOVA · Powered by AI talent matching
      </footer>
    </div>
  );
}
