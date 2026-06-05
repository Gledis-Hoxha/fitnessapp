import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from '@/components/layout/AppLayout';
import Fitness from '@/pages/Fitness.jsx';
import Nutrition from '@/pages/Nutrition.jsx';
import StartWorkout from '@/pages/fitness/StartWorkout';
import ExercisePicker from '@/pages/fitness/ExercisePicker';
import Routines from '@/pages/fitness/Routines';
import Explore from '@/pages/fitness/Explore';
import DailyReview from '@/pages/fitness/DailyReview';
import Profile from '@/pages/Profile.jsx';
import Coach from '@/pages/Coach.jsx';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/fitness" element={<Fitness />} />
        <Route path="/fitness/start-workout" element={<StartWorkout />} />
        <Route path="/fitness/exercise-picker" element={<ExercisePicker />} />
        <Route path="/fitness/routines" element={<Routines />} />
        <Route path="/fitness/explore" element={<Explore />} />
        <Route path="/fitness/daily-review" element={<DailyReview />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/coach" element={<Coach />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App