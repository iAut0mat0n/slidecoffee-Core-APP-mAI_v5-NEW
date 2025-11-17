import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Brands from "./pages/Brands";
import Projects from "./pages/Projects";
import ProjectChat from "./pages/ProjectChatComplete";
import Onboarding from "./pages/Onboarding";
import Subscription from "./pages/Subscription";
import Templates from "./pages/Templates";
import Create from "./pages/Create";
import Analytics from "./pages/Analytics";
import AdminPanel from "./pages/AdminPanel";
import Settings from "./pages/Settings";
import SystemStatus from "./pages/SystemStatus";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Team from "./pages/Team";
import Help from "./pages/Help";
import Community from "./pages/Community";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import CookieNotice from "./pages/CookieNotice";
import CookiePreferences from "./pages/CookiePreferences";
import Pricing from "./pages/Pricing";
import Inspiration from "./pages/Inspiration";
import Insights from "./pages/Insights";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/onboarding"} component={Onboarding} />
      <Route path={"/subscription"} component={Subscription} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/brands"} component={Brands} />
      <Route path={"/projects"} component={Projects} />
      <Route path={"/project/:id"} component={ProjectChat} />
      <Route path={"/templates"} component={Templates} />
      <Route path={"/create"} component={Create} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/system-status"} component={SystemStatus} />
      <Route path={"/admin-10e8da8c6b8a1940fbe8d0fbc5dd553e"} component={AdminPanel} />
      {/* Footer Pages - Product */}
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/inspiration"} component={Inspiration} />
      <Route path={"/insights"} component={Insights} />
      {/* Footer Pages - Company */}
      <Route path={"/about"} component={About} />
      <Route path={"/careers"} component={Careers} />
      <Route path={"/team"} component={Team} />
      <Route path={"/help"} component={Help} />
      <Route path={"/community"} component={Community} />
      <Route path={"/contact"} component={Contact} />
      {/* Footer Pages - Privacy */}
      <Route path={"/terms"} component={Terms} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/cookie-notice"} component={CookieNotice} />
      <Route path={"/cookie-preferences"} component={CookiePreferences} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <SupabaseAuthProvider>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </SupabaseAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
