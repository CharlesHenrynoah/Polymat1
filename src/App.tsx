import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AuthCallback from './pages/auth/callback';
import { SignupData, SignupFlow } from './pages/SignupFlow';
import { SignupLevel2 } from './pages/SignupFlow/SignupLevel2';
import { Login } from './pages/Login';
import { Navigate } from 'react-router-dom';
import { Workspace } from './pages/Workspace';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/signup" element={<SignupFlow />} />
          <Route
            path="/signup/level2"
            element={
              <ProtectedRoute>
                <SignupLevel2 
                  data={{}} 
                  onComplete={(data: SignupData) => {
                    // TODO: Implement signup completion logic
                    console.log('Signup completed:', data);
                  }}
                  onBack={() => {
                    // TODO: Implement back navigation
                    console.log('Going back');
                  }}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login onLogin={async (email: string, password: string) => {
            try {
              const { data: { session }, error } = await supabase.auth.signInWithPassword({
                email,
                password,
              });

              if (error) {
                console.error('Login failed:', error);
                return;
              }

              if (session?.user) {
                const { data: profile } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();

                if (profile?.username) {
                  navigate(`/workspace/${profile.username}`);
                } else {
                  navigate('/signup/level2', { state: { email, id: session.user.id } });
                }
              }
            } catch (error) {
              console.error('Login failed:', error);
            }
          }} />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route 
            path="/workspace/:username" 
            element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
