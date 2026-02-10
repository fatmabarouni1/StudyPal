import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Headphones, Pause, Play } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';

type Ambience = {
  id: string;
  name: string;
  description: string;
  color: string;
};

type MusicPlatform = {
  id: string;
  name: string;
  logo: string;
  url: string;
};

const ambiences: Ambience[] = [
  {
    id: 'rain',
    name: 'Rain',
    description: 'Soft rain to calm the mind.',
    color: '#3B82F6',
  },
  {
    id: 'water',
    name: 'Water',
    description: 'Ocean and flowing water textures.',
    color: '#06B6D4',
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Forest ambience and birds.',
    color: '#10B981',
  },
  {
    id: 'cafe',
    name: 'Cafe',
    description: 'Cozy cafe background chatter.',
    color: '#F59E0B',
  },
];

const platforms: MusicPlatform[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    logo: '/brands/spotify.svg',
    url: 'https://open.spotify.com',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    logo: '/brands/youtube.svg',
    url: 'https://www.youtube.com',
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    logo: '/brands/youtube-music.svg',
    url: 'https://music.youtube.com',
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    logo: '/brands/apple-music.svg',
    url: 'https://music.apple.com',
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    logo: '/brands/soundcloud.svg',
    url: 'https://soundcloud.com',
  },
];

export function MusicPage() {
  const [selectedAmbience, setSelectedAmbience] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    const savedAmbience = localStorage.getItem('focusspace_music_ambience');
    const savedVolume = localStorage.getItem('focusspace_music_volume');

    if (savedAmbience) {
      setSelectedAmbience(savedAmbience);
    }
    if (savedVolume) {
      setVolume(Number(savedVolume));
    }
  }, []);

  useEffect(() => {
    if (selectedAmbience) {
      localStorage.setItem('focusspace_music_ambience', selectedAmbience);
    }
  }, [selectedAmbience]);

  useEffect(() => {
    localStorage.setItem('focusspace_music_volume', String(volume));
  }, [volume]);

  const currentAmbience = useMemo(
    () => ambiences.find((ambience) => ambience.id === selectedAmbience) ?? null,
    [selectedAmbience]
  );

  const toggleAmbience = (ambienceId: string) => {
    if (selectedAmbience === ambienceId) {
      setIsPlaying((prev) => !prev);
      return;
    }
    setSelectedAmbience(ambienceId);
    setIsPlaying(true);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--focus-light)' }}
        >
          <Headphones className="h-6 w-6" style={{ color: 'var(--focus-primary)' }} />
        </div>
        <div>
          <h1 className="text-3xl">Focus Audio</h1>
          <p className="text-muted-foreground">
            Ambient focus sounds and quick links to your favorite platforms.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg">Ambient Sounds</h3>
            <p className="text-sm text-muted-foreground">Quick play / pause without distractions.</p>
          </div>
        </div>
        <div className="space-y-2">
          {ambiences.map((ambience) => {
            const isActive = selectedAmbience === ambience.id;
            const isActivePlaying = isActive && isPlaying;
            return (
              <div
                key={ambience.id}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                  isActive ? 'border-primary/40 bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: ambience.color }}
                  />
                  <div>
                    <div className="text-sm font-medium">{ambience.name}</div>
                    <div className="text-xs text-muted-foreground">{ambience.description}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAmbience(ambience.id)}
                >
                  {isActivePlaying ? (
                    <>
                      <Pause className="mr-2 h-3 w-3" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-3 w-3" />
                      Play
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span>Volume</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="h-1 w-full max-w-xs"
          />
          <span>{volume}%</span>
        </div>
        {currentAmbience ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Now playing: {currentAmbience.name}
          </p>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            Select an ambience to begin.
          </p>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg">Audio Platforms</h3>
            <p className="text-sm text-muted-foreground">
              Open your favorite music apps in a new tab.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-muted/40 flex items-center justify-center">
                  <img
                    src={platform.logo}
                    alt={`${platform.name} logo`}
                    className="max-h-5 max-w-5"
                  />
                </div>
                <span className="text-sm font-medium">{platform.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(platform.url, '_blank', 'noreferrer')}
              >
                Open
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          All trademarks belong to their respective owners.
        </p>
      </Card>
    </div>
  );
}
