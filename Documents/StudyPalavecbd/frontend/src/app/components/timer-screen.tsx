import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { CompactMusicPlayer } from '@/app/components/compact-music-player';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { motion } from 'motion/react';

type TimerMode = 'focus' | 'break';

interface TimerSettings {
  focusDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

interface TimerScreenProps {
  onBack: () => void;
  onSessionComplete?: () => void;
}

export function TimerScreen({ onBack, onSessionComplete }: TimerScreenProps) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>({
    focusDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
  });
  const [sessionCount, setSessionCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Update document title with time
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.title = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} - Focus Space`;
    
    return () => {
      document.title = 'Focus Space';
    };
  }, [timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (mode === 'focus') {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      
      // Update daily stats
      const today = new Date().toDateString();
      const statsKey = `focusspace_stats_${today}`;
      const currentStats = JSON.parse(localStorage.getItem(statsKey) || '{"sessions": 0, "focusTime": 0}');
      currentStats.sessions += 1;
      currentStats.focusTime += settings.focusDuration;
      localStorage.setItem(statsKey, JSON.stringify(currentStats));
      
      // Notify parent component
      if (onSessionComplete) {
        onSessionComplete();
      }
      
      // Determine if long break
      const isLongBreak = newSessionCount % settings.sessionsBeforeLongBreak === 0;
      setMode('break');
      setTimeLeft(isLongBreak ? settings.longBreakDuration * 60 : settings.breakDuration * 60);
      
      if (soundEnabled) {
        playNotificationSound();
      }
    } else {
      setMode('focus');
      setTimeLeft(settings.focusDuration * 60);
      
      if (soundEnabled) {
        playNotificationSound();
      }
    }
  };

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = mode === 'focus' ? 528 : 440;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.8);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? settings.focusDuration * 60 : settings.breakDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    };
  };

  const progress = mode === 'focus'
    ? ((settings.focusDuration * 60 - timeLeft) / (settings.focusDuration * 60)) * 100
    : ((settings.breakDuration * 60 - timeLeft) / (settings.breakDuration * 60)) * 100;

  const handleSettingsSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSettings = {
      focusDuration: Number(formData.get('focusDuration')),
      breakDuration: Number(formData.get('breakDuration')),
      longBreakDuration: Number(formData.get('longBreakDuration')),
      sessionsBeforeLongBreak: Number(formData.get('sessionsBeforeLongBreak')),
    };
    setSettings(newSettings);
    
    if (!isRunning) {
      setTimeLeft(mode === 'focus' ? newSettings.focusDuration * 60 : newSettings.breakDuration * 60);
    }
  };

  const time = formatTime(timeLeft);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: mode === 'focus'
              ? 'radial-gradient(circle at 30% 40%, rgba(91, 124, 153, 0.15), transparent 60%), radial-gradient(circle at 70% 60%, rgba(91, 124, 153, 0.1), transparent 60%)'
              : 'radial-gradient(circle at 30% 40%, rgba(169, 143, 180, 0.15), transparent 60%), radial-gradient(circle at 70% 60%, rgba(169, 143, 180, 0.1), transparent 60%)',
          }}
          transition={{ duration: 2 }}
        />
        
        {/* Animated particles */}
        {isRunning && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full opacity-20"
                style={{
                  backgroundColor: mode === 'focus' ? 'var(--focus-primary)' : 'var(--break-primary)',
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  x: [-10, 10, -10],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between p-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Timer Settings</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSettingsSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="focusDuration">Focus Duration (minutes)</Label>
                  <Input
                    id="focusDuration"
                    name="focusDuration"
                    type="number"
                    min="1"
                    max="120"
                    defaultValue={settings.focusDuration}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breakDuration">Short Break (minutes)</Label>
                  <Input
                    id="breakDuration"
                    name="breakDuration"
                    type="number"
                    min="1"
                    max="30"
                    defaultValue={settings.breakDuration}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longBreakDuration">Long Break (minutes)</Label>
                  <Input
                    id="longBreakDuration"
                    name="longBreakDuration"
                    type="number"
                    min="1"
                    max="60"
                    defaultValue={settings.longBreakDuration}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionsBeforeLongBreak">Sessions before long break</Label>
                  <Input
                    id="sessionsBeforeLongBreak"
                    name="sessionsBeforeLongBreak"
                    type="number"
                    min="2"
                    max="10"
                    defaultValue={settings.sessionsBeforeLongBreak}
                  />
                </div>
                <Button type="submit" className="w-full">Save Settings</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main timer display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Mode indicator */}
        <motion.div
          className="mb-8 flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="w-4 h-4 rounded-full"
            style={{
              backgroundColor: mode === 'focus' ? 'var(--focus-primary)' : 'var(--break-primary)',
            }}
            animate={{
              scale: isRunning ? [1, 1.2, 1] : 1,
              boxShadow: isRunning
                ? [
                    `0 0 10px ${mode === 'focus' ? 'var(--focus-primary)' : 'var(--break-primary)'}`,
                    `0 0 20px ${mode === 'focus' ? 'var(--focus-primary)' : 'var(--break-primary)'}`,
                    `0 0 10px ${mode === 'focus' ? 'var(--focus-primary)' : 'var(--break-primary)'}`,
                  ]
                : 'none',
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-lg text-muted-foreground">
            {mode === 'focus' ? 'Focus Session' : 'Break Time'}
          </span>
        </motion.div>

        {/* Timer */}
        <div className="relative mb-12">
          {/* Circular progress */}
          <svg className="w-80 h-80 md:w-96 md:h-96 -rotate-90 absolute inset-0 mx-auto">
            {/* Background circle */}
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted/30"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className="transition-colors duration-1000"
              style={{
                color: mode === 'focus' ? 'var(--focus-primary)' : 'var(--break-primary)',
                strokeDasharray: '283%',
                strokeDashoffset: `${283 - (progress / 100) * 283}%`,
              }}
              initial={{ strokeDashoffset: '283%' }}
              animate={{ strokeDashoffset: `${283 - (progress / 100) * 283}%` }}
              transition={{ duration: 0.5 }}
            />
          </svg>

          {/* Time display */}
          <div className="relative z-10 flex items-center justify-center w-80 h-80 md:w-96 md:h-96">
            <motion.div
              className="text-center"
              animate={{
                scale: isRunning && timeLeft % 2 === 0 ? 1.02 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="flex items-baseline justify-center gap-2 mb-4"
                style={{ color: mode === 'focus' ? 'var(--focus-primary)' : 'var(--break-primary)' }}
              >
                <span className="text-8xl md:text-9xl font-light tracking-tight">
                  {time.minutes}
                </span>
                <span className="text-6xl md:text-7xl font-light opacity-50">:</span>
                <span className="text-8xl md:text-9xl font-light tracking-tight">
                  {time.seconds}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={toggleTimer}
            size="lg"
            className="w-40 h-14 text-lg shadow-lg hover:shadow-xl transition-all"
            style={{
              backgroundColor: mode === 'focus' ? 'var(--focus-primary)' : 'var(--break-primary)',
              color: 'white',
            }}
          >
            {isRunning ? (
              <>
                <Pause className="h-6 w-6 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-6 w-6 mr-2" />
                Start
              </>
            )}
          </Button>

          <Button onClick={resetTimer} variant="outline" size="lg" className="h-14 w-14">
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>

        {/* Session count */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Sessions completed today
          </p>
          <div className="flex items-center justify-center gap-2">
            {[...Array(Math.max(4, sessionCount))].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full transition-all"
                style={{
                  backgroundColor: i < sessionCount ? 'var(--focus-primary)' : 'var(--muted)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom message */}
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {mode === 'focus'
            ? 'Stay focused and eliminate distractions'
            : 'Take a break, you deserve it'}
        </p>
      </div>

      {/* Compact Music Player */}
      <CompactMusicPlayer />
    </div>
  );
}