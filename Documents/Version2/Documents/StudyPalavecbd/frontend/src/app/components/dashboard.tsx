import { useState, useEffect } from 'react';
import { StudyTimer } from '@/app/components/study-timer';
import { StudyRoom } from '@/app/components/study-room';
import { fetchSuggestions, type Suggestion } from '@/app/api/suggestions';
import { fetchDashboard, useFreezeToken, type DashboardPayload } from '@/app/api/dashboard';
import { completeSession } from '@/app/api/sessions';
import { BaseCard } from '@/app/components/base-card';
import { SecondaryButton } from '@/app/components/button-kit';
import { Pill } from '@/app/components/pill';
import { usePomodoro } from '@/app/context/pomodoro-context';
import {
  Calendar,
  Clock,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

interface DashboardProps {
  userName: string;
  authToken: string;
  onOpenTimer: () => void;
  onOpenGoals: () => void;
  onOpenCalendar: () => void;
  onOpenNotes: () => void;
  onOpenRooms: () => void;
  onJoinRoom: (roomId: string) => void;
}

export function Dashboard({
  userName,
  authToken,
  onOpenTimer,
  onOpenGoals,
  onOpenCalendar,
  onOpenNotes,
  onOpenRooms,
  onJoinRoom,
}: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardPayload | null>(null);
  const [dashboardError, setDashboardError] = useState("");
  const [courseSuggestions, setCourseSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState("");
  const [ambientSound, setAmbientSound] = useState<'silence' | 'rain' | 'cafe'>('silence');
  const { mode, setMode, soundEnabled, setSoundEnabled } = usePomodoro();

  useEffect(() => {
    loadDashboard();
  }, [authToken]);

  useEffect(() => {
    if (authToken) {
      loadCourseSuggestions();
    } else {
      setCourseSuggestions([]);
    }
  }, [authToken]);

  const loadDashboard = async () => {
    if (!authToken) {
      setDashboardData(null);
      return;
    }
    setDashboardError("");
    try {
      const data = await fetchDashboard(authToken);
      setDashboardData(data);
    } catch (error: any) {
      setDashboardError(error.message || "Failed to load dashboard.");
    } finally {
    }
  };

  const handleSessionComplete = async (durationMinutes: number) => {
    if (!authToken) return;
    try {
      await completeSession(authToken, { durationMinutes });
      await loadDashboard();
    } catch (error: any) {
      setDashboardError(error.message || "Failed to record session.");
    }
  };

  const handleUseFreezeToken = async () => {
    if (!authToken) return;
    try {
      const updatedStreaks = await useFreezeToken(authToken);
      setDashboardData((prev) => (prev ? { ...prev, streaks: updatedStreaks } : prev));
    } catch (error: any) {
      setDashboardError(error.message || "Failed to use freeze token.");
    }
  };

  const loadCourseSuggestions = async () => {
    setLoadingSuggestions(true);
    setSuggestionError("");
    try {
      const suggestions = await fetchSuggestions(authToken);
      setCourseSuggestions(suggestions);
    } catch (error: any) {
      setSuggestionError(error.message || "Failed to load course suggestions.");
    } finally {
      setLoadingSuggestions(false);
    }
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

  const stats = dashboardData?.stats;
  const targets = dashboardData?.targets;
  const streaks = dashboardData?.streaks;

  const suggestionPreview = courseSuggestions[0];

  return (
    <div className="space-y-8">
      <BaseCard className="p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {getDayOfWeek()}, {getFormattedDate()}
            </div>
            <h2 className="mt-2 text-3xl font-semibold">
              {getGreeting()}, {userName}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Pill className="bg-muted text-muted-foreground">
              Streak {streaks?.streakCount ?? 0} days
            </Pill>
            {streaks?.streakStatus === 'frozen' ? (
              <Pill className="bg-muted text-muted-foreground">Freeze used</Pill>
            ) : null}
            {streaks?.warningActive ? (
              <Pill className="bg-amber-100 text-amber-700">Streak at risk</Pill>
            ) : null}
            {streaks?.warningActive && (streaks?.freezeTokens ?? 0) > 0 ? (
              <SecondaryButton size="sm" onClick={handleUseFreezeToken}>
                Use freeze token
              </SecondaryButton>
            ) : null}
          </div>
        </div>
      </BaseCard>

      {dashboardError ? <div className="text-sm text-destructive">{dashboardError}</div> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1fr]">
        <BaseCard className="p-6 md:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  Primary focus
                </div>
                <h3 className="mt-2 text-2xl font-semibold">Focus Timer</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <SecondaryButton
                  size="sm"
                  variant={mode === 'focus' ? 'default' : 'outline'}
                  onClick={() => setMode('focus')}
                >
                  Focus
                </SecondaryButton>
                <SecondaryButton
                  size="sm"
                  variant={mode === 'break' ? 'default' : 'outline'}
                  onClick={() => setMode('break')}
                >
                  Break
                </SecondaryButton>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Ambient sound</span>
              <SecondaryButton
                size="sm"
                variant={ambientSound === 'silence' ? 'default' : 'outline'}
                onClick={() => {
                  setAmbientSound('silence');
                  setSoundEnabled(false);
                }}
              >
                Silence
              </SecondaryButton>
              <SecondaryButton
                size="sm"
                variant={ambientSound === 'rain' ? 'default' : 'outline'}
                onClick={() => {
                  setAmbientSound('rain');
                  setSoundEnabled(true);
                }}
              >
                Rain
              </SecondaryButton>
              <SecondaryButton
                size="sm"
                variant={ambientSound === 'cafe' ? 'default' : 'outline'}
                onClick={() => {
                  setAmbientSound('cafe');
                  setSoundEnabled(true);
                }}
              >
                Cafe
              </SecondaryButton>
              <Pill className="bg-muted text-muted-foreground">
                Alerts {soundEnabled ? 'on' : 'off'}
              </Pill>
            </div>

            <StudyTimer
              embedded
              className="pt-2"
              onSessionComplete={handleSessionComplete}
              onFullscreen={onOpenTimer}
            />
          </div>
        </BaseCard>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <BaseCard className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Target className="h-4 w-4" />
                Sessions today
              </div>
              <div className="mt-2 text-2xl font-semibold">{stats?.sessionsToday ?? 0}</div>
              <div className="text-xs text-muted-foreground">
                Target {targets?.dailySessionsTarget ?? 0}
              </div>
            </BaseCard>

            <BaseCard className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" />
                Focus time today
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {formatMinutes(stats?.focusMinutesToday ?? 0)}
              </div>
              <div className="text-xs text-muted-foreground">
                Target {formatMinutes(targets?.dailyFocusMinutesTarget ?? 0)}
              </div>
            </BaseCard>
          </div>

          <StudyRoom authToken={authToken} onOpenRooms={onOpenRooms} onJoinRoom={onJoinRoom} />

          <BaseCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <h3 className="text-base font-semibold">AI suggestion</h3>
              </div>
              <SecondaryButton
                size="sm"
                variant="ghost"
                onClick={loadCourseSuggestions}
                disabled={loadingSuggestions}
              >
                {loadingSuggestions ? 'Loading...' : 'Refresh'}
              </SecondaryButton>
            </div>

            {suggestionError ? (
              <div className="text-sm text-destructive">{suggestionError}</div>
            ) : suggestionPreview ? (
              <div className="space-y-2">
                <div className="text-sm font-semibold">{suggestionPreview.title}</div>
                {suggestionPreview.level ? (
                  <Pill className="bg-muted text-muted-foreground">
                    Level: {suggestionPreview.level}
                  </Pill>
                ) : null}
                {suggestionPreview.description ? (
                  <p className="text-sm text-muted-foreground">{suggestionPreview.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Short, focused prompts to shape your next study sprint.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No suggestions yet. Refresh to see the latest ideas.
              </div>
            )}
          </BaseCard>
        </div>
      </div>
    </div>
  );
}
