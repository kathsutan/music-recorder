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
      alert('✨ Recording saved successfully!');
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
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto border-2 border-[#E1D9BC]">
        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-[#E1D9BC] to-[#ACBAC4] rounded-3xl p-8 mb-4 shadow-lg">
            <div className="text-6xl font-bold text-[#30364F] font-mono tabular-nums">
              {formatTime(recordingTime)}
            </div>
          </div>
          
          {isRecording && !isPaused && (
            <div className="flex items-center justify-center gap-2 animate-pulse">
              <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>
              <span className="text-red-500 font-semibold text-lg">Recording in progress...</span>
            </div>
          )}
          {isPaused && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-600 font-semibold text-lg">Paused</span>
            </div>
          )}
          {!isRecording && !audioURL && (
            <p className="text-[#30364F]/60 text-sm">Ready to capture your favorite sounds</p>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="group bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <div className="w-4 h-4 rounded-full bg-white"></div>
              </div>
              <span className="text-lg">Start Recording</span>
            </button>
          ) : (
            <div className="flex gap-3">
              {!isPaused ? (
                <button
                  onClick={pauseRecording}
                  className="bg-gradient-to-br from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                >
                  <span className="text-2xl">⏸</span>
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                >
                  <span className="text-2xl">▶</span>
                  <span>Resume</span>
                </button>
              )}
              <button
                onClick={stopRecording}
                className="bg-gradient-to-br from-[#30364F] to-[#30364F]/80 hover:to-[#30364F] text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <span className="text-2xl">⏹</span>
                <span>Stop</span>
              </button>
            </div>
          )}
        </div>

        {/* Preview Player */}
        {audioURL && (
          <div className="mt-8 p-6 bg-gradient-to-br from-[#E1D9BC] to-[#ACBAC4]/30 rounded-2xl border-2 border-[#ACBAC4]/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎧</span>
              <h3 className="text-lg font-bold text-[#30364F]">Preview Your Recording</h3>
            </div>
            
            <div className="bg-white rounded-xl p-4 mb-4 shadow-inner">
              <audio src={audioURL} controls className="w-full" />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={resetRecording}
                className="flex-1 bg-white hover:bg-gray-50 text-[#30364F] font-semibold py-3 px-4 rounded-xl transition-all duration-300 border-2 border-[#ACBAC4] shadow-sm hover:shadow-md"
              >
                <span className="mr-2">🔄</span>
                Record Again
              </button>
              <button
                onClick={handleOpenSaveModal}
                className="flex-1 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="mr-2">💾</span>
                Save to Library
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!audioURL && (
          <div className="mt-6 p-5 bg-gradient-to-br from-[#ACBAC4]/20 to-[#E1D9BC]/30 rounded-2xl border border-[#ACBAC4]/30">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-1">💡</span>
              <div>
                <p className="font-semibold text-[#30364F] mb-2">How to use:</p>
                <ol className="space-y-2 text-sm text-[#30364F]/80">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#30364F] min-w-[20px]">1.</span>
                    <span>Click "Start Recording" button above</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#30364F] min-w-[20px]">2.</span>
                    <span>Select the browser tab playing your music</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#30364F] min-w-[20px]">3.</span>
                    <span>Check the "Share audio" box</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-[#30364F] min-w-[20px]">4.</span>
                    <span>Play your music and click "Stop" when finished</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}
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