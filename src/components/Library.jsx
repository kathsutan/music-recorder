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
      // Convert blob to URL for each recording
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
        alert('Recording deleted successfully');
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
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-xl text-gray-600">Loading your library...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Library</h2>
        <div className="text-sm text-gray-600">
          {recordings.length} {recordings.length === 1 ? 'track' : 'tracks'}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title, artist, or source..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Recordings List */}
      {filteredRecordings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? (
            <p>No recordings found matching "{searchTerm}"</p>
          ) : (
            <div>
              <p className="text-xl mb-2">No recordings yet</p>
              <p className="text-sm">Start recording to build your library!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecordings.map((recording) => (
            <div
              key={recording.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {recording.title}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {recording.artist}
                  </p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span>📁 {recording.source}</span>
                    <span>⏱️ {formatDuration(recording.duration)}</span>
                    <span>📅 {formatDate(recording.dateAdded)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onPlayTrack(recording)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                  >
                    ▶ Play
                  </button>
                  <button
                    onClick={() => handleDelete(recording.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {/* Audio Preview (optional) */}
              <audio 
                src={recording.url} 
                controls 
                className="w-full mt-3"
                controlsList="nodownload"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;