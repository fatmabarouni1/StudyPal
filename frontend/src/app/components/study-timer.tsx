import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Maximize2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';

type TimerMode = 'focus' | 'break';

interface TimerSettings {
  focusDuration: number;
  breakDuration: number;
}

interface StudyTimerProps {
  onSessionComplete?: () => void;
  onFullscreen?: () => void;
}

export function StudyTimer({ onSessionComplete, onFullscreen }: StudyTimerProps) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>({
    focusDuration: 25,
    breakDuration: 5,
  });
  const [sessionCount, setSessionCount] = useState(0);
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

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (mode === 'focus') {
      setSessionCount((prev) => prev + 1);
      
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
      
      setMode('break');
      setTimeLeft(settings.breakDuration * 60);
      // Play a gentle notification sound
      playNotificationSound();
    } else {
      setMode('focus');
      setTimeLeft(settings.focusDuration * 60);
      playNotificationSound();
    }
  };

  const playNotificationSound = () => {
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 440;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    };
    setSettings(newSettings);
    
    // Reset timer with new settings if not running
    if (!isRunning) {
      setTimeLeft(mode === 'focus' ? newSettings.focusDuration * 60 : newSettings.breakDuration * 60);
    }
  };

  return (
    <Card className="p-8 relative overflow-hidden">
      {/* Background gradient based on mode */}
      <div 
        className="absolute inset-0 opacity-10 transition-all duration-1000"
        style={{
          background: mode === 'focus' 
            ? 'radial-gradient(circle at 50% 50%, var(--focus-primary), transparent)'
            : 'radial-gradient(circle at 50% 50%, var(--break-primary), transparent)'
        }}
      />
      
      <div className="relative z-10">
        {/* Mode indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: mode === 'focus' ? 'var(--focus-primary)' : 'var(--break-primary)',
                boxShadow: `0 0 10px ${mode === 'focus' ? 'var(--focus-primary)' : 'var(--break-primary)'}`
              }}
            />
            <span className="text-muted-foreground">
              {mode === 'focus' ? 'Focus Session' : 'Break Time'}
            </span>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
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
                  <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                  <Input
                    id="breakDuration"
                    name="breakDuration"
                    type="number"
                    min="1"
                    max="60"
                    defaultValue={settings.breakDuration}
                  />
                </div>
                <Button type="submit" className="w-full">Save Settings</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Timer display */}
        <div className="text-center mb-8">
          <div 
            className="text-8xl mb-4 transition-colors duration-500"
            style={{
              color: mode === 'focus' ? 'var(--focus-primary)' : 'var(--break-primary)'
            }}
          >
            {formatTime(timeLeft)}
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-1000 ease-linear"
              style={{
                width: `${progress}%`,
                backgroundColor: mode === 'focus' ? 'var(--focus-primary)' : 'var(--break-primary)'
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={toggleTimer}
            size="lg"
            className="w-32"
            style={{
              backgroundColor: mode === 'focus' ? 'var(--focus-primary)' : 'var(--break-primary)',
              color: 'white'
            }}
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Start
              </>
            )}
          </Button>
          
          <Button onClick={resetTimer} variant="outline" size="lg">
            <RotateCcw className="h-5 w-5" />
          </Button>
          
          <Button onClick={onFullscreen} variant="outline" size="lg">
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Session count */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Completed sessions today: <span className="font-medium">{sessionCount}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}