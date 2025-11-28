import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, ScanLine, CheckCircle, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { verifyUserIdentity } from '../services/geminiService';

interface ScannerProps {
  onScanComplete: (photoUrl: string) => void;
  onClose: () => void;
  mode: 'IN' | 'OUT';
  userAvatarUrl: string;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete, onClose, mode, userAvatarUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [scanning, setScanning] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<{failed: boolean; reason: string}>({ failed: false, reason: '' });

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }); // Use front camera for face verify
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Camera access denied. Please enable permissions.');
        console.error(err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Auto-scan simulation removed in favor of manual or timed trigger, 
  // but to keep UX smooth let's auto-capture after a few seconds like before.
  useEffect(() => {
    if (!scanning || error || verificationError.failed) return;

    const scanTimer = setTimeout(() => {
        handleCapture();
    }, 3000);

    return () => clearTimeout(scanTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning, error, verificationError.failed]);


  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current && scanning) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Capture frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/png');
        
        // Stop scanning, start verifying
        setScanning(false);
        setVerifying(true);

        // Verify Identity
        const result = await verifyUserIdentity(imageUrl, userAvatarUrl);
        setVerifying(false);

        if (result.match) {
          setCaptured(true);
          // Wait a moment to show success state before closing
          setTimeout(() => {
            onScanComplete(imageUrl);
          }, 1500);
        } else {
          setVerificationError({ failed: true, reason: result.reason });
        }
      }
    }
  };

  const handleRetry = () => {
    setVerificationError({ failed: false, reason: '' });
    setScanning(true);
    setCaptured(false);
    setVerifying(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-50">
        <button onClick={onClose} className="p-2 bg-white/20 rounded-full text-white backdrop-blur-sm hover:bg-white/30 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white text-center p-6">
            <Camera size={48} className="mx-auto mb-4 opacity-50" />
            <p>{error}</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-white text-black rounded">Close</button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transition-all duration-300 ${captured || verifying || verificationError.failed ? 'blur-md opacity-50' : 'opacity-100'}`} 
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning Overlay */}
            {scanning && !error && !verificationError.failed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-72 h-72 border-2 border-white/50 rounded-full relative overflow-hidden">
                   {/* Face guide */}
                   <div className="absolute inset-0 border-[60px] border-black/40 rounded-full pointer-events-none"></div>
                   <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_#3b82f6]"></div>
                </div>
                <div className="absolute bottom-24 text-white font-medium bg-black/40 px-6 py-3 rounded-full backdrop-blur-md flex flex-col items-center">
                   <span>Align face to check {mode}</span>
                   <span className="text-xs text-white/70 mt-1">Verifying identity...</span>
                </div>
              </div>
            )}

            {/* Verifying State */}
            {verifying && (
               <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
                 <Loader2 size={60} className="text-blue-400 animate-spin mb-4" />
                 <h2 className="text-xl font-bold text-white">Verifying Identity</h2>
                 <p className="text-white/80 mt-2">Analyzing facial features...</p>
               </div>
            )}

            {/* Success State */}
            {captured && (
               <div className="absolute inset-0 flex items-center justify-center flex-col animate-in fade-in zoom-in duration-300 z-20">
                 <CheckCircle size={80} className="text-green-500 mb-4 fill-white bg-white rounded-full" />
                 <h2 className="text-2xl font-bold text-white">Identity Verified</h2>
                 <p className="text-white/80 mt-1">Attendance Marked</p>
               </div>
            )}

            {/* Failure State */}
            {verificationError.failed && (
               <div className="absolute inset-0 flex items-center justify-center flex-col animate-in fade-in zoom-in duration-300 z-20 p-6 text-center">
                 <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 max-w-sm w-full">
                    <AlertTriangle size={60} className="text-red-500 mb-4 mx-auto" />
                    <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
                    <p className="text-white/80 text-sm mb-6">{verificationError.reason || "Face does not match profile photo."}</p>
                    
                    <button 
                      onClick={handleRetry}
                      className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                    >
                      <RefreshCw size={20} /> Try Again
                    </button>
                 </div>
               </div>
            )}
          </>
        )}
      </div>
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(288px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;
