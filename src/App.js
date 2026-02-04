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
    <div className="min-h-screen bg-[#F0F0DB] py-8 px-4 pb-32">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#30364F] to-[#ACBAC4] rounded-2xl flex items-center justify-center text-2xl shadow-lg">
              🎵
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#30364F]">
              SoundKeeper
            </h1>
          </div>
          <p className="text-[#30364F]/70 text-sm md:text-base">
            Capture and collect your favorite sounds from anywhere
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8 p-2 bg-[#E1D9BC] rounded-2xl shadow-sm max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('recorder')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'recorder'
                ? 'bg-[#30364F] text-white shadow-lg transform scale-105'
                : 'text-[#30364F]/70 hover:text-[#30364F] hover:bg-[#F0F0DB]/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">🎙️</span>
              <span className="hidden sm:inline">Recorder</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'library'
                ? 'bg-[#30364F] text-white shadow-lg transform scale-105'
                : 'text-[#30364F]/70 hover:text-[#30364F] hover:bg-[#F0F0DB]/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">📚</span>
              <span className="hidden sm:inline">Library</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="transition-all duration-300">
          {activeTab === 'recorder' ? (
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          ) : (
            <Library onPlayTrack={handlePlayTrack} />
          )}
        </div>
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
}

export default App;