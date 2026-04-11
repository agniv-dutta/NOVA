import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployees } from "@/contexts/EmployeeContext";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import ScoreExplanationDrawer from "@/components/explainability/ScoreExplanationDrawer";

function scoreColor(value: number): string {
  if (value >= 70) return "text-red-600";
  if (value >= 40) return "text-amber-600";
  return "text-green-600";
}

export default function EmployeeProfilePage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const { getEmployee } = useEmployees();
  const navigate = useNavigate();

  const employee = employeeId ? getEmployee(employeeId) : undefined;

  const overview = useMemo(() => {
    if (!employee) return [];
    return [
      { label: "Burnout Risk", value: employee.burnoutRisk, trend: employee.performanceHistory },
      { label: "Engagement Score", value: employee.engagementScore, trend: employee.performanceHistory },
      { label: "Sentiment Trend", value: Math.round((employee.sentimentScore + 1) * 50), trend: employee.sentimentHistory },
      { label: "Flight Risk", value: employee.attritionRisk, trend: employee.performanceHistory },
    ];
  }, [employee]);

  if (!employee) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee profile not found</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/employees")}>Back to Employees</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate("/employees")}>← All Employees</Button>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                {employee.name.split(" ").map((part) => part[0]).join("")}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{employee.name}</h1>
                <p className="text-sm text-muted-foreground">{employee.role} · {employee.department}</p>
                <p className="text-sm text-muted-foreground">{employee.email} · {employee.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{employee.tenure} months</Badge>
              {employee.tenure < 3 && <Badge variant="secondary">Onboarding</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="jira">Jira Signals</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
          <TabsTrigger value="sessions">Feedback Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overview.map((item) => (
              <Card key={item.label}>
                <CardContent className="pt-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <ScoreExplanationDrawer employeeId={employee.id} scoreType="burnout" />
                  </div>
                  <p className={`text-3xl font-bold ${scoreColor(item.value)}`}>{item.value}</p>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={item.trend}>
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Line dataKey="score" stroke="#0ea5e9" dot={false} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Events from meetings, recognitions, sentiment shifts, and interventions are available in employee side panel timeline and connected APIs.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jira">
          <Card>
            <CardHeader><CardTitle>Jira Signals</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Integration not connected.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interventions">
          <Card>
            <CardHeader><CardTitle>Interventions</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Pending and completed interventions are available via interventions APIs.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader><CardTitle>Feedback Sessions</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Session schedule/review status is shown in the employee dashboard and sessions APIs.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
