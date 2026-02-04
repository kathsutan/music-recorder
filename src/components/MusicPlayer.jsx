import React, { useState, useRef, useEffect } from 'react';

const MusicPlayer = ({ currentTrack, playlist, onNext, onPrevious, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  
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

  const getRepeatIcon = () => {
    if (repeatMode === 'off') return '🔁';
    if (repeatMode === 'all') return '🔁';
    return '🔂'; // repeat one
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white shadow-2xl border-t border-gray-700">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Progress Bar */}
        <div className="mb-2">
          <input
            type="range"
            min="0"
            max="100"
            value={(currentTime / duration) * 100 || 0}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center text-2xl">
              🎵
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">{currentTrack.title}</div>
              <div className="text-sm text-gray-400 truncate">{currentTrack.artist}</div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              title="Close player"
            >
              ✕
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`transition-colors ${
                isShuffle ? 'text-purple-400' : 'text-gray-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              🔀
            </button>

            {/* Previous */}
            <button
              onClick={onPrevious}
              disabled={!playlist || playlist.length <= 1}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous"
            >
              ⏮️
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              className="bg-white text-gray-900 rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            {/* Next */}
            <button
              onClick={onNext}
              disabled={!playlist || playlist.length <= 1}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next"
            >
              ⏭️
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={`transition-colors ${
                repeatMode !== 'off' ? 'text-purple-400' : 'text-gray-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {getRepeatIcon()}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 flex-1 max-w-[150px]">
            <span>🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: white;
          cursor: pointer;
          border-radius: 50%;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: white;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default MusicPlayer;