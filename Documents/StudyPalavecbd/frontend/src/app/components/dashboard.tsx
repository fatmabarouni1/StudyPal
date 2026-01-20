import { useState, useEffect } from 'react';
import { StudyTimer } from '@/app/components/study-timer';
import { NotesPanel } from '@/app/components/notes-panel';
import { StudyRoom } from '@/app/components/study-room';
import { MusicPlayer } from '@/app/components/music-player';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  Award,
  Coffee,
  Maximize2
} from 'lucide-react';

interface DashboardProps {
  userName: string;
  onOpenTimer: () => void;
  onOpenGoals: () => void;
  onOpenCalendar: () => void;
}

interface DailyStats {
  sessionsCompleted: number;
  totalFocusTime: number;
  currentStreak: number;
}

export function Dashboard({ userName, onOpenTimer, onOpenGoals, onOpenCalendar }: DashboardProps) {
  const [todayStats, setTodayStats] = useState<DailyStats>({
    sessionsCompleted: 0,
    totalFocusTime: 0,
    currentStreak: 0,
  });

  const dailyGoal = 4;

  const loadTodayStats = () => {
    const today = new Date().toDateString();
    const statsKey = `focusspace_stats_${today}`;
    const stats = JSON.parse(localStorage.getItem(statsKey) || '{"sessions": 0, "focusTime": 0}');
    
    // Load streak
    const streakData = JSON.parse(localStorage.getItem('focusspace_streak') || '{"count": 0, "lastDate": ""}');
    
    setTodayStats({
      sessionsCompleted: stats.sessions,
      totalFocusTime: stats.focusTime,
      currentStreak: streakData.count,
    });
  };

  useEffect(() => {
    loadTodayStats();
    
    // Check and update streak
    updateStreak();
  }, []);

  const updateStreak = () => {
    const today = new Date().toDateString();
    const streakData = JSON.parse(localStorage.getItem('focusspace_streak') || '{"count": 0, "lastDate": ""}');
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    const todayStatsKey = `focusspace_stats_${today}`;
    const todayData = JSON.parse(localStorage.getItem(todayStatsKey) || '{"sessions": 0}');
    
    if (todayData.sessions > 0) {
      if (streakData.lastDate === yesterday) {
        // Continue streak
        streakData.count += 1;
        streakData.lastDate = today;
      } else if (streakData.lastDate !== today) {
        // Start new streak
        streakData.count = 1;
        streakData.lastDate = today;
      }
      localStorage.setItem('focusspace_streak', JSON.stringify(streakData));
    }
  };

  const handleSessionComplete = () => {
    loadTodayStats();
    updateStreak();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getDayOfWeek = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const getFormattedDate = () => {
    const date = new Date();
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl mb-2">
            {getGreeting()}, {userName}
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {getDayOfWeek()}, {getFormattedDate()}
            </p>
            <Button variant="ghost" size="sm" onClick={onOpenCalendar}>
              View Calendar
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-3">
          <Card className="px-4 py-3 min-w-[120px]">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--focus-light)' }}
              >
                <Target className="h-4 w-4" style={{ color: 'var(--focus-primary)' }} />
              </div>
            </div>
            <div className="text-2xl mb-1">{todayStats.sessionsCompleted}</div>
            <div className="text-xs text-muted-foreground">Sessions today</div>
          </Card>
          
          <Card className="px-4 py-3 min-w-[120px]">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--success-light)' }}
              >
                <Clock className="h-4 w-4" style={{ color: 'var(--success)' }} />
              </div>
            </div>
            <div className="text-2xl mb-1">{formatMinutes(todayStats.totalFocusTime)}</div>
            <div className="text-xs text-muted-foreground">Focus time</div>
          </Card>
          
          <Card className="px-4 py-3 min-w-[120px]">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--break-light)' }}
              >
                <Award className="h-4 w-4" style={{ color: 'var(--break-primary)' }} />
              </div>
            </div>
            <div className="text-2xl mb-1">{todayStats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Day streak</div>
          </Card>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Timer and Study Room */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Goal */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" style={{ color: 'var(--focus-primary)' }} />
                <h3>Today's Goal</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{todayStats.sessionsCompleted} / {dailyGoal} sessions</span>
                <Button variant="ghost" size="sm" onClick={onOpenGoals}>
                  View Goals
                </Button>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="space-y-3">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(todayStats.sessionsCompleted / dailyGoal) * 100}%`,
                    backgroundColor: 'var(--focus-primary)'
                  }}
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                Complete {dailyGoal} focus sessions to reach your daily goal
              </p>
            </div>
          </Card>

          {/* Timer */}
          <StudyTimer 
            onSessionComplete={handleSessionComplete} 
            onFullscreen={onOpenTimer}
          />

          {/* Study Room */}
          <StudyRoom />

          {/* Tips Card */}
          <Card className="p-6 bg-gradient-to-br from-accent/30 to-accent/10 border-2 border-accent">
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--break-light)' }}
              >
                <Coffee className="h-5 w-5" style={{ color: 'var(--break-primary)' }} />
              </div>
              <div>
                <h4 className="mb-1">Take mindful breaks</h4>
                <p className="text-sm text-muted-foreground">
                  Step away from your screen during break time. Stretch, hydrate, or take a short walk to recharge effectively.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column - Notes */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Music Player */}
            <MusicPlayer />
            
            {/* Notes Panel */}
            <NotesPanel />
          </div>
        </div>
      </div>
    </div>
  );
}