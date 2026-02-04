import React, { useState } from 'react';
import AudioRecorder from './components/AudioRecorder';
import Library from './components/Library';
import MusicPlayer from './components/MusicPlayer';

function App() {
  const [activeTab, setActiveTab] = useState('recorder');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleRecordingComplete = (recordingData) => {
    console.log('Recording completed:', recordingData);
  };

  const handlePlayTrack = (track, allTracks = []) => {
    setCurrentTrack(track);
    setPlaylist(allTracks);
    const index = allTracks.findIndex(t => t.id === track.id);
    setCurrentIndex(index !== -1 ? index : 0);
  };

  const handleNext = () => {
    if (playlist.length > 0) {
      const nextIndex = (currentIndex + 1) % playlist.length;
      setCurrentIndex(nextIndex);
      setCurrentTrack(playlist[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (playlist.length > 0) {
      const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentTrack(playlist[prevIndex]);
    }
  };

  const handleClosePlayer = () => {
    setCurrentTrack(null);
    setPlaylist([]);
    setCurrentIndex(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 py-12 px-4 pb-32">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8">
          Custom Music Recorder
        </h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('recorder')}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              activeTab === 'recorder'
                ? 'bg-white text-purple-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            🎙️ Recorder
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              activeTab === 'library'
                ? 'bg-white text-purple-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            📚 Library
          </button>
        </div>

        {/* Content */}
        {activeTab === 'recorder' ? (
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
        ) : (
          <Library onPlayTrack={handlePlayTrack} />
        )}
      </div>

      {/* Music Player */}
      <MusicPlayer
        currentTrack={currentTrack}
        playlist={playlist}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onClose={handleClosePlayer}
      />
    </div>
  );
};

export default App;