import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginScreen from '@/features/auth/LoginScreen';
import { AuthProvider } from '@/features/auth/AuthContext';
import SignupScreen from '@/features/auth/SignupScreen';
import RecipeBoxScreen from '@/features/box/RecipeBoxScreen';
import BrowseScreen from '@/features/discover/BrowseScreen';
import HomeScreen from '@/features/discover/HomeScreen';
import HouseholdScreen from '@/features/household/HouseholdScreen';
import JoinHouseholdScreen from '@/features/household/JoinHouseholdScreen';
import NotFound from '@/features/landing/NotFound';
import MealPlanScreen from '@/features/plan/MealPlanScreen';
import ProfileScreen from '@/features/profile/ProfileScreen';
import PublishScreen from '@/features/recipe/PublishScreen';
import RecipeDetailScreen from '@/features/recipe/RecipeDetailScreen';
import ShoppingListScreen from '@/features/shopping/ShoppingListScreen';
import { Toaster as Sonner } from '@/shared/components/ui/sonner';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import Layout from '@/shared/layout/Layout';
import { AppProvider } from './AppContext';
import ProtectedRoute from './ProtectedRoute';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <AppProvider>
          {/* Served under /nick-prototypes/strawberry-next/ on the preview, / with VITE_BASE=/. */}
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Layout>
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/recipes" element={<BrowseScreen />} />
                <Route path="/recipe/:id" element={<RecipeDetailScreen />} />
                <Route
                  path="/box"
                  element={
                    <ProtectedRoute>
                      <RecipeBoxScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/plan"
                  element={
                    <ProtectedRoute>
                      <MealPlanScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/list"
                  element={
                    <ProtectedRoute>
                      <ShoppingListScreen />
                    </ProtectedRoute>
                  }
                />
                <Route path="/publish" element={<PublishScreen />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfileScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/household"
                  element={
                    <ProtectedRoute>
                      <HouseholdScreen />
                    </ProtectedRoute>
                  }
                />
                <Route path="/join/:code" element={<JoinHouseholdScreen />} />
                <Route path="/@:handle" element={<ProfileScreen />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/signup" element={<SignupScreen />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
