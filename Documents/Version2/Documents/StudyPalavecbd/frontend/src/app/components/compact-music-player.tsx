import { useState, useEffect } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface Ambience {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const ambiences: Ambience[] = [
  { id: 'lofi', name: 'Lo-fi', icon: '🎵', color: '#8B5CF6' },
  { id: 'rain', name: 'Pluie', icon: '🌧️', color: '#3B82F6' },
  { id: 'nature', name: 'Nature', icon: '🌿', color: '#10B981' },
  { id: 'cafe', name: 'Café', icon: '☕', color: '#F59E0B' },
  { id: 'ocean', name: 'Océan', icon: '🌊', color: '#06B6D4' },
  { id: 'white-noise', name: 'Bruit blanc', icon: '🔇', color: '#6B7280' },
];

export function CompactMusicPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAmbience, setSelectedAmbience] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const savedAmbience = localStorage.getItem('focusspace_music_ambience');
    const savedVolume = localStorage.getItem('focusspace_music_volume');
    
    if (savedVolume) {
      setVolume(Number(savedVolume));
    }
    if (savedAmbience) {
      setSelectedAmbience(savedAmbience);
    }
  }, []);

  const handleSelectAmbience = (ambienceId: string) => {
    if (selectedAmbience === ambienceId && isPlaying) {
      setIsPlaying(false);
    } else {
      setSelectedAmbience(ambienceId);
      setIsPlaying(true);
      localStorage.setItem('focusspace_music_ambience', ambienceId);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('focusspace_music_volume', String(newVolume));
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const currentAmbience = ambiences.find(a => a.id === selectedAmbience);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="mb-3 bg-card/95 backdrop-blur-lg border border-border rounded-2xl p-4 shadow-2xl w-80"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Music className="h-5 w-5" style={{ color: 'var(--focus-primary)' }} />
                <h4 className="font-medium">Ambiances</h4>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsExpanded(false)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Grille d'ambiances */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {ambiences.map((ambience) => {
                const isSelected = selectedAmbience === ambience.id;
                const isCurrentlyPlaying = isSelected && isPlaying;

                return (
                  <button
                    key={ambience.id}
                    onClick={() => handleSelectAmbience(ambience.id)}
                    className={`p-3 rounded-xl border transition-all text-center relative ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {isCurrentlyPlaying && (
                      <motion.div
                        className="absolute inset-0 opacity-10 rounded-xl"
                        style={{ backgroundColor: ambience.color }}
                        animate={{ opacity: [0.05, 0.15, 0.05] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    <div className="relative">
                      <div className="text-2xl mb-1">{ambience.icon}</div>
                      <div className="text-xs">{ambience.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Contrôles */}
            {selectedAmbience && (
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: currentAmbience?.color + '20' }}
                  >
                    {currentAmbience?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{currentAmbience?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {isPlaying ? 'En lecture' : 'En pause'}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlayPause}
                    className="h-10 w-10 rounded-full flex-shrink-0"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                  </Button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={toggleMute}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${currentAmbience?.color} 0%, ${currentAmbience?.color} ${volume}%, var(--muted) ${volume}%, var(--muted) 100%)`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground w-8 text-right flex-shrink-0">
                    {isMuted ? 0 : volume}%
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton flottant */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-14 w-14 rounded-full shadow-2xl relative overflow-hidden"
        style={{
          backgroundColor: isPlaying && currentAmbience ? currentAmbience.color : 'var(--primary)',
        }}
      >
        {isPlaying && currentAmbience ? (
          <>
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-2xl relative z-10">{currentAmbience.icon}</span>
          </>
        ) : (
          <Music className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
