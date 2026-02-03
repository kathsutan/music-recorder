import React, { useState } from 'react';
import AudioRecorder from './components/AudioRecorder';
import Library from './components/Library';

function App() {
  const [activeTab, setActiveTab] = useState('recorder'); // 'recorder' or 'library'
  const [currentTrack, setCurrentTrack] = useState(null);

  const handleRecordingComplete = (recordingData) => {
    console.log('Recording completed:', recordingData);
  };

  const handlePlayTrack = (track) => {
    setCurrentTrack(track);
    console.log('Playing track:', track);
    // We'll build a proper player in the next step
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 py-12 px-4">
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
    </div>
  );
}

export default App;