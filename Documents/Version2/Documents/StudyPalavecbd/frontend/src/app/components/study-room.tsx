import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { BaseCard } from '@/app/components/base-card';
import { Pill } from '@/app/components/pill';
import { PrimaryButton, SecondaryButton } from '@/app/components/button-kit';
import { fetchRooms, type RoomListItem } from '@/app/api/rooms';
import { useRoomCall } from '@/app/context/room-call-context';

interface StudyRoomProps {
  authToken: string;
  onOpenRooms: () => void;
  onJoinRoom: (roomId: string) => void;
}

const statusBadgeStyles: Record<string, string> = {
  focus: 'bg-green-100 text-green-700',
  break: 'bg-amber-100 text-amber-700',
  idle: 'bg-gray-100 text-gray-600',
};

export function StudyRoom({ authToken, onOpenRooms, onJoinRoom }: StudyRoomProps) {
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinError, setJoinError] = useState('');
  const { activeRoomId, isInRoom, joinRoom } = useRoomCall();

  useEffect(() => {
    const loadRooms = async () => {
      if (!authToken) return;
      setLoading(true);
      setError('');
      try {
        const data = await fetchRooms(authToken);
        setRooms(data.slice(0, 3));
      } catch (err: any) {
        setError(err.message || 'Failed to load rooms.');
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [authToken]);

  return (
    <BaseCard className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-base font-semibold">Co-Study</h3>
        </div>
        <SecondaryButton variant="ghost" size="sm" onClick={onOpenRooms}>
          View all
        </SecondaryButton>
      </div>

      {error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : null}
      {joinError ? (
        <div className="text-sm text-destructive">{joinError}</div>
      ) : null}

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading rooms...</div>
      ) : null}

      {!loading && rooms.length === 0 ? (
        <div className="text-sm text-muted-foreground">No rooms available.</div>
      ) : null}

      <div className="space-y-3">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-3"
          >
            <div>
              <div className="font-medium">{room.title}</div>
              <div className="text-xs text-muted-foreground">
                Host: {room.host?.name ?? 'Unknown'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Pill className={statusBadgeStyles[room.status]}>
                {room.status}
              </Pill>
              <PrimaryButton
                size="sm"
                onClick={async () => {
                  if (isInRoom && activeRoomId && activeRoomId !== room._id) {
                    setJoinError('You are already in another room. Leave it before joining.');
                    return;
                  }
                  setJoinError('');
                  const result = await joinRoom(room._id, room.title);
                  if (!result.ok) {
                    setJoinError(result.message || 'Unable to join the room.');
                    return;
                  }
                  onJoinRoom(room._id);
                }}
              >
                Join
              </PrimaryButton>
            </div>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}
