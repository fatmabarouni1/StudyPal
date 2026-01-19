import { useState, useEffect } from 'react';
import { Users, Clock } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';

interface Participant {
  id: string;
  name: string;
  status: 'focus' | 'break';
  timeElapsed: number;
  avatar: string;
}

// Mock data for participants
const mockParticipants: Participant[] = [
  { id: '1', name: 'Alex', status: 'focus', timeElapsed: 1234, avatar: 'A' },
  { id: '2', name: 'Jordan', status: 'focus', timeElapsed: 2456, avatar: 'J' },
  { id: '3', name: 'Sam', status: 'break', timeElapsed: 345, avatar: 'S' },
  { id: '4', name: 'Casey', status: 'focus', timeElapsed: 3678, avatar: 'C' },
  { id: '5', name: 'Morgan', status: 'focus', timeElapsed: 1890, avatar: 'M' },
];

export function StudyRoom() {
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);

  // Simulate real-time updates of participant times
  useEffect(() => {
    const interval = setInterval(() => {
      setParticipants((prev) =>
        prev.map((p) => ({
          ...p,
          timeElapsed: p.timeElapsed + 1,
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${remainingMins}m`;
    }
    return `${mins}m`;
  };

  const focusCount = participants.filter((p) => p.status === 'focus').length;

  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-green-100 text-green-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h3>Study Room</h3>
        </div>
        <Badge variant="secondary">
          {focusCount} focusing now
        </Badge>
      </div>

      <div className="space-y-3">
        {participants.map((participant, index) => (
          <div
            key={participant.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <Avatar className={`h-10 w-10 ${colors[index % colors.length]}`}>
              <AvatarFallback className={colors[index % colors.length]}>
                {participant.avatar}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium truncate">{participant.name}</span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    participant.status === 'focus'
                      ? 'bg-green-500'
                      : 'bg-amber-500'
                  }`}
                  title={participant.status === 'focus' ? 'Focusing' : 'On break'}
                />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTime(participant.timeElapsed)}
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground capitalize">
              {participant.status}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-dashed border-border">
        <p className="text-xs text-center text-muted-foreground">
          Study together, stay motivated 🌟
        </p>
      </div>
    </Card>
  );
}
