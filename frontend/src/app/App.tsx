import { useState, useEffect } from 'react';
import { LandingPage } from '@/app/components/landing-page';
import { AuthScreen } from '@/app/components/auth-screen';
import { Dashboard } from '@/app/components/dashboard';
import { TimerScreen } from '@/app/components/timer-screen';
import { GoalsScreen } from '@/app/components/goals-screen';
import { CalendarScreen } from '@/app/components/calendar-screen';
import { BookOpen, LogOut } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

type Screen = 'landing' | 'auth' | 'dashboard' | 'timer' | 'goals' | 'calendar';

interface User {
  name: string;
  email: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [user, setUser] = useState<User | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('focusspace_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setCurrentScreen('dashboard');
    }
  }, []);

  const handleAuthenticated = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setCurrentScreen('dashboard');
  };

  const handleSignOut = () => {
    localStorage.removeItem('focusspace_user');
    setUser(null);
    setCurrentScreen('landing');
  };

  if (currentScreen === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentScreen('auth')} />;
  }

  if (currentScreen === 'auth') {
    return (
      <AuthScreen 
        onAuthenticated={handleAuthenticated}
        onBack={() => setCurrentScreen('landing')}
      />
    );
  }

  if (currentScreen === 'timer') {
    return (
      <TimerScreen 
        onBack={() => setCurrentScreen('dashboard')}
      />
    );
  }

  if (currentScreen === 'goals') {
    return (
      <GoalsScreen 
        onBack={() => setCurrentScreen('dashboard')}
      />
    );
  }

  if (currentScreen === 'calendar') {
    return (
      <CalendarScreen 
        onBack={() => setCurrentScreen('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--focus-light)' }}
              >
                <BookOpen className="h-5 w-5" style={{ color: 'var(--focus-primary)' }} />
              </div>
              <div>
                <h1 className="text-xl">Focus Space</h1>
                <p className="text-sm text-muted-foreground">Your peaceful productivity companion</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-8">
        <Dashboard 
          userName={user?.name || 'User'} 
          onOpenTimer={() => setCurrentScreen('timer')}
          onOpenGoals={() => setCurrentScreen('goals')}
          onOpenCalendar={() => setCurrentScreen('calendar')}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-6 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Stay focused, stay present, achieve your goals ✨
          </p>
        </div>
      </footer>
    </div>
  );
}