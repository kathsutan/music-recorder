import React, { useState, useRef, useEffect } from 'react';

const MusicPlayer = ({ currentTrack, playlist, onNext, onPrevious, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  
  const audioRef = useRef(null);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (repeatMode === 'all' || playlist.length > 1) {
      onNext();
    } else {
      setIsPlaying(false);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#30364F] text-white shadow-2xl border-t-4 border-[#ACBAC4] z-50">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={(currentTime / duration) * 100 || 0}
              onChange={handleSeek}
              className="w-full h-2 bg-[#ACBAC4]/30 rounded-full appearance-none cursor-pointer progress-bar"
            />
          </div>
          <div className="flex justify-between text-xs text-[#ACBAC4] mt-1 px-1">
            <span className="font-mono">{formatTime(currentTime)}</span>
            <span className="font-mono">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6">
          {/* Track Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 bg-gradient-to-br from-[#ACBAC4] to-[#E1D9BC] rounded-2xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
              🎵
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold truncate text-[#F0F0DB]">{currentTrack.title}</div>
              <div className="text-sm text-[#ACBAC4] truncate">{currentTrack.artist}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`transition-all duration-300 p-2 rounded-lg ${
                isShuffle 
                  ? 'text-[#E1D9BC] bg-[#ACBAC4]/20' 
                  : 'text-[#ACBAC4] hover:text-[#F0F0DB] hover:bg-white/10'
              }`}
              title="Shuffle"
            >
              <span className="text-xl">🔀</span>
            </button>

            {/* Previous */}
            <button
              onClick={onPrevious}
              disabled={!playlist || playlist.length <= 1}
              className="text-[#ACBAC4] hover:text-[#F0F0DB] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed p-2 hover:bg-white/10 rounded-lg"
              title="Previous"
            >
              <span className="text-2xl">⏮️</span>
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              className="bg-gradient-to-br from-[#E1D9BC] to-[#ACBAC4] text-[#30364F] rounded-full w-14 h-14 flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="text-2xl">{isPlaying ? '⏸️' : '▶️'}</span>
            </button>

            {/* Next */}
            <button
              onClick={onNext}
              disabled={!playlist || playlist.length <= 1}
              className="text-[#ACBAC4] hover:text-[#F0F0DB] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed p-2 hover:bg-white/10 rounded-lg"
              title="Next"
            >
              <span className="text-2xl">⏭️</span>
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={`transition-all duration-300 p-2 rounded-lg ${
                repeatMode !== 'off' 
                  ? 'text-[#E1D9BC] bg-[#ACBAC4]/20' 
                  : 'text-[#ACBAC4] hover:text-[#F0F0DB] hover:bg-white/10'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <span className="text-xl">{repeatMode === 'one' ? '🔂' : '🔁'}</span>
            </button>
          </div>

          {/* Volume & Close */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="flex items-center gap-2 max-w-[140px] w-full">
              <span className="text-lg">🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-[#ACBAC4]/30 rounded-full appearance-none cursor-pointer volume-slider"
              />
            </div>
            <button
              onClick={onClose}
              className="text-[#ACBAC4] hover:text-[#F0F0DB] transition-colors p-2 hover:bg-white/10 rounded-lg"
              title="Close player"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .progress-bar::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #E1D9BC;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.2s;
        }
        
        .progress-bar::-webkit-slider-thumb:hover {
          background: #F0F0DB;
          transform: scale(1.2);
        }
        
        .progress-bar::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #E1D9BC;
          cursor: pointer;
          border-radius: 50%;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          background: #ACBAC4;
          cursor: pointer;
          border-radius: 50%;
        }
        
        .volume-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: #ACBAC4;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default MusicPlayer;