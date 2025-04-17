
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import DiscoverPage from "./pages/DiscoverPage";
import TrackerPage from "./pages/TrackerPage";
import InsightsPage from "./pages/InsightsPage";
import ProfilePage from "./pages/ProfilePage";
import QuizPage from "./pages/QuizPage";
import DietPlanPage from "./pages/DietPlanPage";
import PetCarePlanPage from "./pages/PetCarePlanPage";
import TrainingPlanPage from "./pages/TrainingPlanPage";
import ActivitiesPlanPage from "./pages/ActivitiesPlanPage";
import GroomingPlanPage from "./pages/GroomingPlanPage";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout><DiscoverPage /></MainLayout>} />
            <Route path="/home" element={<MainLayout><Index /></MainLayout>} />
            <Route path="/tracker" element={<MainLayout><TrackerPage /></MainLayout>} />
            <Route path="/insights" element={<MainLayout><InsightsPage /></MainLayout>} />
            <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/diet-plan" element={<MainLayout><DietPlanPage /></MainLayout>} />
            <Route path="/pet-care-plan" element={<MainLayout><PetCarePlanPage /></MainLayout>} />
            <Route path="/training-plan" element={<MainLayout><TrainingPlanPage /></MainLayout>} />
            <Route path="/activities-plan" element={<MainLayout><ActivitiesPlanPage /></MainLayout>} />
            <Route path="/grooming-plan" element={<MainLayout><GroomingPlanPage /></MainLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
