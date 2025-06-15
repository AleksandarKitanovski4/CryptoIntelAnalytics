// client/src/App.tsx
import React, { Suspense, lazy } from "react";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner"; // креирај еден спинер или користи постоечки

// Lazy-load pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {/* Suspense за lazy-loaded компоненти */}
        <Suspense
          fallback={
            <div className="flex h-screen w-full items-center justify-center">
              <Spinner size="lg" />
            </div>
          }
        >
          <Router />
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
