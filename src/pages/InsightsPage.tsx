
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dog, PawPrint } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InsightsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pet Insights</h1>
        <p className="text-muted-foreground">Track your pet's progress over time</p>
      </div>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <PawPrint size={24} className="text-primary" />
          </div>
          <h4 className="font-medium mb-1">No Activity Data Yet</h4>
          <p className="text-sm text-muted-foreground mb-6">
            Start tracking your pet's activities to see insights and analytics.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button onClick={() => navigate("/tracker")}>
              Start Tracking Activities
            </Button>
            <Button variant="outline" onClick={() => navigate("/quiz")}>
              Take Pet Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <Dog size={24} className="text-primary" />
          </div>
          <h4 className="font-medium mb-1">Find Your Perfect Match</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Take our pet matching quiz to find the perfect pet for your lifestyle.
          </p>
          <Button variant="outline" onClick={() => navigate("/quiz")}>Start Quiz</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsPage;
