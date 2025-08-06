import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Analyzer from "@/pages/analyzer";
import { useBaseLocation } from "@/hooks/use-base-location";

// Create a custom Router that handles GitHub Pages base path
const RouterWithBasePath = () => {
  // Use our custom location hook
  const [location, setLocation] = useBaseLocation();
  
  // Create a custom hook that properly handles the base path
  const useBasePath = () => [location, setLocation];
  
  return (
    <WouterRouter hook={useBasePath}>
      <Switch>
        <Route path="/" component={Analyzer} />
        <Route path="/analyzer" component={Analyzer} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
};

function Router() {
  return <RouterWithBasePath />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground" dir="rtl">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
