import React, { useState, useEffect } from 'react';
import { getAllRecordings, deleteRecording } from '../utils/indexedDB';

const Library = ({ onPlayTrack }) => {
  const [recordings, setRecordings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    setIsLoading(true);
    try {
      const allRecordings = await getAllRecordings();
      const recordingsWithURLs = allRecordings.map(recording => ({
        ...recording,
        url: URL.createObjectURL(recording.blob)
      }));
      setRecordings(recordingsWithURLs);
    } catch (error) {
      console.error('Error loading recordings:', error);
      alert('Failed to load recordings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      try {
        await deleteRecording(id);
        setRecordings(recordings.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting recording:', error);
        alert('Failed to delete recording');
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const filteredRecordings = recordings.filter(recording => 
    recording.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recording.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recording.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-12 max-w-4xl mx-auto border-2 border-[#E1D9BC]">
        <div className="text-center">
          <div className="inline-block animate-spin text-6xl mb-4">🎵</div>
          <div className="text-xl text-[#30364F]/60">Loading your collection...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-4xl mx-auto border-2 border-[#E1D9BC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#30364F] mb-1">My Collection</h2>
          <p className="text-[#30364F]/60">
            {recordings.length} {recordings.length === 1 ? 'track' : 'tracks'} saved
          </p>
        </div>
        <div className="bg-gradient-to-br from-[#ACBAC4] to-[#E1D9BC] px-6 py-3 rounded-2xl shadow-lg">
          <div className="text-2xl font-bold text-[#30364F]">{recordings.length}</div>
          <div className="text-xs text-[#30364F]/70 uppercase tracking-wide">Total Tracks</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
          <input
            type="text"
            placeholder="Search your collection..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-[#E1D9BC] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ACBAC4] focus:border-transparent transition-all bg-[#F0F0DB]/30 text-[#30364F] placeholder-[#30364F]/40"
          />
        </div>
      </div>

      {/* Recordings Grid */}
      {filteredRecordings.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-block bg-gradient-to-br from-[#E1D9BC] to-[#ACBAC4]/50 rounded-3xl p-8 mb-4">
            <div className="text-6xl mb-3">🎵</div>
          </div>
          {searchTerm ? (
            <div>
              <p className="text-xl text-[#30364F] font-semibold mb-2">No matches found</p>
              <p className="text-[#30364F]/60">Try a different search term</p>
            </div>
          ) : (
            <div>
              <p className="text-xl text-[#30364F] font-semibold mb-2">Your collection is empty</p>
              <p className="text-[#30364F]/60">Start recording to build your library!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecordings.map((recording) => (
            <div
              key={recording.id}
              className="group border-2 border-[#E1D9BC] rounded-2xl p-5 hover:border-[#ACBAC4] hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-[#F0F0DB]/30"
            >
              <div className="flex items-center gap-4 mb-4">
                {/* Album Art */}
                <div className="w-16 h-16 bg-gradient-to-br from-[#30364F] to-[#ACBAC4] rounded-2xl flex items-center justify-center text-3xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  🎵
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-[#30364F] truncate mb-1">
                    {recording.title}
                  </h3>
                  <p className="text-sm text-[#30364F]/70 truncate mb-2">
                    {recording.artist}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-[#30364F]/60">
                    <span className="bg-[#E1D9BC] px-3 py-1 rounded-full">📁 {recording.source}</span>
                    <span className="bg-[#E1D9BC] px-3 py-1 rounded-full">⏱️ {formatDuration(recording.duration)}</span>
                    <span className="bg-[#E1D9BC] px-3 py-1 rounded-full">📅 {formatDate(recording.dateAdded)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => onPlayTrack(recording, filteredRecordings)}
                    className="bg-gradient-to-br from-[#30364F] to-[#30364F]/80 hover:to-[#30364F] text-white px-5 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2"
                  >
                    <span className="text-xl">▶</span>
                    <span className="hidden sm:inline">Play</span>
                  </button>
                  <button
                    onClick={() => handleDelete(recording.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    title="Delete"
                  >
                    <span className="text-xl">🗑️</span>
                  </button>
                </div>
              </div>

              {/* Waveform placeholder / Audio player */}
              <div className="bg-white rounded-xl p-3 shadow-inner border border-[#E1D9BC]">
                <audio 
                  src={recording.url} 
                  controls 
                  className="w-full"
                  style={{ height: '40px' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;