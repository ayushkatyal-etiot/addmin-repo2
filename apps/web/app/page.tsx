import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { DashboardLayout } from "../components/layout/dashboard-layout";

const placeholderStats = [
  { label: "Due this week", value: "—" },
  { label: "Overdue", value: "—" },
  { label: "Expiring soon", value: "—" },
];

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Office Home</h1>
          <p className="text-muted-foreground">
            Everything due, overdue, or expiring across your offices — once the obligation engine
            ships, this fills in automatically.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {placeholderStats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            My Actions queue will list here once obligations, approvals, and compliance items are
            wired up.
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
