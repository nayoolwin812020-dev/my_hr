import React, { useEffect, useRef, useState } from 'react';
import { X, CheckCircle, Zap } from 'lucide-react';

interface ScannerProps {
  onScanComplete: (photoUrl: string) => void;
  onClose: () => void;
  mode: 'IN' | 'OUT';
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete, onClose, mode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [scanning, setScanning] = useState(true);
  const [captured, setCaptured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // Defaulting to user/front camera for selfie attendance style check-in
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
        }); 
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Camera access required');
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

  // Auto-scan simulation (faster now)
  useEffect(() => {
    if (!scanning || error) return;

    // Simulate "Finding" code quickly (1.2s instead of 2s)
    const scanTimer = setTimeout(() => {
        handleCapture();
    }, 1200); 

    return () => clearTimeout(scanTimer);
  }, [scanning, error]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && scanning) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/png');
        
        setScanning(false);
        setCaptured(true);

        // Instant completion after visual cue (0.8s)
        setTimeout(() => {
            onScanComplete(imageUrl);
        }, 800);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50 bg-gradient-to-b from-black/60 to-transparent">
        <div className="text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
                {mode === 'IN' ? 'Check In' : 'Check Out'}
            </h2>
            <p className="text-xs text-white/70">Align QR code within frame</p>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white backdrop-blur-md hover:bg-white/20 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Main Camera View */}
      <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-slate-900">
        {error ? (
          <div className="text-white text-center p-6">
            <p className="mb-4">{error}</p>
            <button onClick={onClose} className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold">Close</button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transition-all duration-300 ${captured ? 'scale-105 blur-sm brightness-50' : ''}`} 
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning UI Layer */}
            {scanning && (
              <>
                 {/* Dark overlay with cutout */}
                 <div className="absolute inset-0 border-[3rem] border-black/40 box-border pointer-events-none transition-all duration-500"></div>
                 
                 {/* Active Scan Frame */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-white/30 rounded-3xl relative">
                        {/* Corners */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                        
                        {/* Scan Line */}
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_1.5s_ease-in-out_infinite]"></div>
                    </div>
                 </div>

                 {/* Manual Trigger (User Friendly) */}
                 <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-4 z-50">
                     <button 
                        onClick={handleCapture}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-full font-bold shadow-lg active:scale-95 transition-transform"
                     >
                         <Zap size={18} className="fill-blue-600" /> 
                         Scan Now
                     </button>
                 </div>
              </>
            )}

            {/* Success Overlay */}
            {captured && (
               <div className="absolute inset-0 flex items-center justify-center flex-col z-50 animate-in fade-in zoom-in duration-200">
                 <div className="bg-white rounded-full p-4 mb-4 shadow-2xl animate-bounce">
                    <CheckCircle size={48} className="text-green-500 fill-green-100" />
                 </div>
                 <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Success!</h2>
                 <p className="text-white/90 font-medium drop-shadow-md">Attendance Recorded</p>
               </div>
            )}
          </>
        )}
      </div>
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0.5; }
          50% { opacity: 1; }
          100% { transform: translateY(256px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;