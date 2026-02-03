import React, { useState, useRef } from 'react';
import SaveModal from './SaveModal';
import { saveRecording } from '../utils/indexedDB';

const AudioRecorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [currentRecording, setCurrentRecording] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;
      
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        alert('No audio track detected. Make sure "Share audio" is checked when selecting the tab.');
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      console.log('Audio tracks:', audioTracks);
      
      let mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }
      }
      
      console.log('Using mimeType:', mimeType);

      const mediaRecorder = new MediaRecorder(stream, 
        mimeType ? { mimeType } : undefined
      );
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        
        const recordingData = {
          blob,
          url,
          duration: recordingTime
        };
        
        setCurrentRecording(recordingData);
        
        stream.getTracks().forEach(track => track.stop());
        
        if (onRecordingComplete) {
          onRecordingComplete(recordingData);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not start recording. Error: ' + error.message);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioURL(null);
    setRecordingTime(0);
    setCurrentRecording(null);
    chunksRef.current = [];
  };

  const handleOpenSaveModal = () => {
    setShowSaveModal(true);
  };

  const handleSave = async (metadata) => {
    try {
      await saveRecording(metadata);
      alert('Recording saved successfully!');
      resetRecording();
    } catch (error) {
      console.error('Error saving:', error);
      throw error;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Audio Recorder</h2>
        
        <div className="text-center mb-6">
          <div className="text-4xl font-mono text-gray-700">
            {formatTime(recordingTime)}
          </div>
          {isRecording && !isPaused && (
            <div className="flex items-center justify-center mt-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-red-500 font-semibold">Recording...</span>
            </div>
          )}
          {isPaused && (
            <div className="text-yellow-600 font-semibold mt-2">Paused</div>
          )}
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
            >
              Start Recording
            </button>
          ) : (
            <>
              {!isPaused ? (
                <button
                  onClick={pauseRecording}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
                >
                  Resume
                </button>
              )}
              <button
                onClick={stopRecording}
                className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-full transition-colors"
              >
                Stop
              </button>
            </>
          )}
        </div>

        {audioURL && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Preview Recording</h3>
            <audio src={audioURL} controls className="w-full mb-3" />
            <div className="flex gap-2">
              <button
                onClick={resetRecording}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Record Again
              </button>
              <button
                onClick={handleOpenSaveModal}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Save to Library
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-600">
          <p className="font-semibold mb-1">How to use:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click "Start Recording"</li>
            <li>Select the browser tab you want to record</li>
            <li>Make sure "Share audio" is checked</li>
            <li>Play your music and click "Stop" when done</li>
          </ol>
        </div>
      </div>

      {currentRecording && (
        <SaveModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSave}
          recordingData={currentRecording}
        />
      )}
    </>
  );
};

export default AudioRecorder;