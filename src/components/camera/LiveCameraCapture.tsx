'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  X,
  Check,
  RotateCcw,
  AlertCircle,
  Upload,
  Sparkles,
  ShieldAlert,
  Loader2,
  Trash2,
} from 'lucide-react';

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  capturedAt: string; // ISO string
  source: 'CAMERA' | 'FILE';
  sizeBytes?: number;
}

interface LiveCameraCaptureProps {
  photos: CapturedPhoto[];
  onPhotosChange: (photos: CapturedPhoto[]) => void;
  maxPhotos?: number;
  language?: 'en' | 'mr';
}

export const LiveCameraCapture: React.FC<LiveCameraCaptureProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 3,
  language = 'en',
}) => {
  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showPermissionPrimer, setShowPermissionPrimer] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);

  // Freeze / Preview state for single capture
  const [stagedPhoto, setStagedPhoto] = useState<CapturedPhoto | null>(null);

  // File fallback input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isMarathi = language === 'mr';

  // Stop media stream tracks cleanly
  const stopStream = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  // When stream changes, bind to video element
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current
        .play()
        .catch((e) => console.warn('Video play interrupted:', e));
    }
  }, [cameraStream]);

  // Launch camera stream with requested facingMode
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setIsInitializingCamera(true);
    setCameraError(null);

    // Check browser support
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setIsInitializingCamera(false);
      setCameraError(
        isMarathi
          ? 'तुमचा ब्राउझर थेट कॅमेरा समर्थित करत नाही. कृपया फोटो अपलोड करा.'
          : 'Your browser does not support live camera access. Please use file upload.'
      );
      return;
    }

    try {
      // Stop any existing stream
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setFacingMode(mode);
      setIsCameraOpen(true);
      setShowPermissionPrimer(false);
    } catch (err: any) {
      console.error('Camera access error:', err);
      let message = isMarathi
        ? 'कॅमेरा परवानगी नाकारली गेली आहे किंवा कॅमेरा उपलब्ध नाही.'
        : 'Camera access was denied or device is not available.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = isMarathi
          ? 'कॅमेरा ॲक्सेस नाकारला गेला. कृपया ब्राउझर सेटिंग्जमध्ये कॅमेरा परवानगी द्या.'
          : 'Camera access was denied. Please allow camera permissions in your browser.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = isMarathi
          ? 'कोणताही कॅमेरा आढळला नाही.'
          : 'No camera hardware found on this device.';
      }
      setCameraError(message);
    } finally {
      setIsInitializingCamera(false);
    }
  };

  // User clicked "Take Photo" button
  const handleInitiateCamera = () => {
    if (photos.length >= maxPhotos) {
      alert(
        isMarathi
          ? `कमाल मर्यादा गाठली आहे (कमाल ${maxPhotos} फोटो).`
          : `Maximum photos reached (max ${maxPhotos} photos).`
      );
      return;
    }
    // Show primer explaining purpose before triggering browser prompt
    setShowPermissionPrimer(true);
  };

  // Toggle between front and rear cameras
  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextMode);
  };

  // Close live camera
  const handleCloseCamera = () => {
    stopStream();
    setIsCameraOpen(false);
    setStagedPhoto(null);
    setCameraError(null);
    setShowPermissionPrimer(false);
  };

  // Compress and capture image from video frame using canvas
  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Maintain aspect ratio with max dimension constraint (1600px max)
    const MAX_DIM = 1600;
    let width = video.videoWidth || 1280;
    let height = video.videoHeight || 720;

    if (width > height) {
      if (width > MAX_DIM) {
        height = Math.round((height * MAX_DIM) / width);
        width = MAX_DIM;
      }
    } else {
      if (height > MAX_DIM) {
        width = Math.round((width * MAX_DIM) / height);
        height = MAX_DIM;
      }
    }

    canvas.width = width;
    canvas.height = height;

    // Draw the current video frame onto canvas
    ctx.drawImage(video, 0, 0, width, height);

    // Export optimized JPEG data URL (0.82 quality keeps evidence crisp under 250KB)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    const capturedAt = new Date().toISOString();

    const photoObj: CapturedPhoto = {
      id: `cam_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      dataUrl,
      capturedAt,
      source: 'CAMERA',
      sizeBytes: Math.round((dataUrl.length * 3) / 4),
    };

    setStagedPhoto(photoObj);
    // Pause video to provide clear visual feedback
    video.pause();
  };

  // Accept captured staged photo
  const handleConfirmStagedPhoto = () => {
    if (!stagedPhoto) return;
    onPhotosChange([...photos, stagedPhoto]);
    setStagedPhoto(null);
    handleCloseCamera();
  };

  // Retake photo: discard staged frame and unpause video stream
  const handleRetakeStagedPhoto = () => {
    setStagedPhoto(null);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Handle fallback file upload
  const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = maxPhotos - photos.length;
    const filesToProcess = Array.from(files).slice(0, availableSlots);

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const MAX_DIM = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          const newPhoto: CapturedPhoto = {
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            dataUrl: compressed,
            capturedAt: new Date().toISOString(),
            source: 'FILE',
            sizeBytes: Math.round((compressed.length * 3) / 4),
          };

          onPhotosChange([...photos, newPhoto]);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    handleCloseCamera();
  };

  const handleRemovePhoto = (id: string) => {
    onPhotosChange(photos.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative h-40 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-900 group shadow-sm transition hover:shadow-md"
          >
            <img
              src={photo.dataUrl}
              alt={`Evidence photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Top Bar with Badge & Delete */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-white backdrop-blur-sm pointer-events-auto">
                {photo.source === 'CAMERA' ? '📷 Real Camera' : '📁 Uploaded'}
              </span>
              <button
                type="button"
                onClick={() => handleRemovePhoto(photo.id)}
                className="w-7 h-7 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center pointer-events-auto shadow transition"
                title={isMarathi ? 'फोटो हटवा' : 'Remove photo'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom timestamp badge */}
            <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-white/90 bg-slate-950/70 px-2 py-1 rounded backdrop-blur-sm">
              <span className="font-semibold">Photo #{index + 1}</span>
              <span className="font-mono text-[9px]">
                {new Date(photo.capturedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Action Tile if more slots available */}
        {photos.length < maxPhotos && (
          <div className="h-40 rounded-xl border-2 border-dashed border-civic-300 bg-sky-50/50 hover:bg-sky-50 flex flex-col items-center justify-center p-4 text-center transition space-y-2">
            <button
              type="button"
              onClick={handleInitiateCamera}
              className="w-full h-full flex flex-col items-center justify-center space-y-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-civic-600 group-hover:bg-civic-700 text-white flex items-center justify-center shadow-md transition group-hover:scale-105">
                <Camera className="w-6 h-6" />
              </div>
              <div className="text-xs font-black text-civic-900">
                {isMarathi ? 'थेट फोटो काढा' : 'Take Photo (Camera)'}
              </div>
              <span className="text-[10px] text-slate-500">
                {photos.length === 0
                  ? isMarathi
                    ? 'पुराव्यासाठी फोटो आवश्यक'
                    : 'Evidence photo required'
                  : `${photos.length}/${maxPhotos} ${isMarathi ? 'फोटो जोडले' : 'added'}`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Alternative actions & Help text */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-civic-600 shrink-0" />
          <span>
            {isMarathi
              ? 'थेट कॅमेरा वापरून समस्या स्पष्ट दिसेल असा फोटो काढा.'
              : 'Stand at the civic issue and photograph clearly in natural daylight.'}
          </span>
        </div>

        {/* Fallback File Upload Link */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handleFileFallback}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-civic-700 hover:text-civic-900 font-bold underline inline-flex items-center space-x-1"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>
              {isMarathi ? 'गॅलरीतून फोटो निवडा' : 'Or Upload Existing Photo'}
            </span>
          </button>
        </div>
      </div>

      {/* 1. PERMISSION PRIMER MODAL */}
      {showPermissionPrimer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-sky-100 text-civic-700 flex items-center justify-center mx-auto shadow-inner">
              <Camera className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                {isMarathi ? 'कॅमेरा परवानगी आवश्यक' : 'Camera Access Required'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isMarathi
                  ? 'CleanTrack नाशिकला नागरी समस्येचा थेट फोटो काढण्यासाठी तुमच्या कॅमेऱ्याची परवानगी हवी आहे. आम्ही केवळ समस्येचा पुरावा नोंदवण्यासाठी कॅमेरा वापरतो.'
                  : 'CleanTrack Nashik needs access to your device camera so you can photograph the civic problem on the spot.'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-left text-[11px] text-slate-600 border border-slate-200 space-y-1">
              <div className="flex items-center space-x-1 font-bold text-slate-800">
                <span>🛡️</span>
                <span>{isMarathi ? 'नागरिक गोपनीयता हमी' : 'Privacy Protection'}</span>
              </div>
              <p>
                {isMarathi
                  ? 'कॅमेरा केवळ तक्रार दाखल करताना वापरला जातो. पार्श्वभूमीत कोणताही डेटा गोळा केला जात नाही.'
                  : 'Camera is activated only while reporting. No background photo collection is ever performed.'}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => startCamera('environment')}
                disabled={isInitializingCamera}
                className="w-full py-3 rounded-xl bg-civic-700 hover:bg-civic-800 text-white font-bold text-sm shadow transition flex items-center justify-center space-x-2"
              >
                {isInitializingCamera ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isMarathi ? 'कॅमेरा सुरू होत आहे...' : 'Opening Camera...'}</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>{isMarathi ? 'कॅमेरा सुरू करा' : 'Open Camera'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPermissionPrimer(false);
                  fileInputRef.current?.click();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                {isMarathi ? 'गॅलरीतून फोटो वापरा' : 'Upload From Gallery Instead'}
              </button>

              <button
                type="button"
                onClick={() => setShowPermissionPrimer(false)}
                className="text-xs text-slate-400 hover:text-slate-600 block mx-auto pt-1"
              >
                {isMarathi ? 'रद्द करा' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REAL-TIME LIVE CAMERA VIEWPORT MODAL */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Top Bar */}
          <div className="p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white z-10">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {stagedPhoto ? (
                  isMarathi ? 'फोटो पडताळणी' : 'Photo Preview'
                ) : (
                  isMarathi ? 'थेट कॅमेरा (Live)' : 'Live Camera Viewfinder'
                )}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {!stagedPhoto && (
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-semibold flex items-center space-x-1.5 transition"
                  title={isMarathi ? 'कॅमेरा बदला' : 'Switch Camera'}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {facingMode === 'environment' ? 'Rear (Back)' : 'Front'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCloseCamera}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition"
                title={isMarathi ? 'बंद करा' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Camera Error State */}
          {cameraError && (
            <div className="m-auto max-w-sm p-6 bg-slate-900/90 border border-slate-800 rounded-2xl text-center text-white space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-900/50 text-rose-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-rose-300">
                  {isMarathi ? 'कॅमेरा उघडता आला नाही' : 'Camera Access Issue'}
                </h4>
                <p className="text-xs text-slate-300">{cameraError}</p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="w-full py-2.5 rounded-xl bg-civic-600 hover:bg-civic-700 text-white font-bold text-xs shadow transition flex items-center justify-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isMarathi ? 'पुन्हा प्रयत्न करा' : 'Try Again'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCloseCamera();
                    fileInputRef.current?.click();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition flex items-center justify-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isMarathi ? 'फाइल / गॅलरीतून निवडा' : 'Upload Existing Photo'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Video Viewport / Staged Preview */}
          {!cameraError && (
            <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black">
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`w-full h-full object-cover ${stagedPhoto ? 'hidden' : 'block'}`}
              />

              {/* Viewfinder Target Guidelines */}
              {!stagedPhoto && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-72 h-72 sm:w-96 sm:h-96 border-2 border-white/40 rounded-2xl relative">
                    {/* Corner Crosshairs */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-civic-400 rounded-tl" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-civic-400 rounded-tr" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-civic-400 rounded-bl" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-civic-400 rounded-br" />
                    <div className="absolute inset-x-0 bottom-2 text-center text-[11px] font-semibold text-white/80 bg-black/40 py-1 rounded backdrop-blur-sm mx-4">
                      {isMarathi
                        ? 'समस्या चौकटीत व्यवस्थित ठेवा'
                        : 'Align civic issue within frame'}
                    </div>
                  </div>
                </div>
              )}

              {/* Staged Photo Captured Preview */}
              {stagedPhoto && (
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
                  <img
                    src={stagedPhoto.dataUrl}
                    alt="Captured photo review"
                    className="max-w-full max-h-full object-contain"
                  />
                  <div className="absolute top-4 bg-emerald-600/90 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm flex items-center space-x-1.5 animate-bounce">
                    <Check className="w-4 h-4" />
                    <span>
                      {isMarathi ? 'फोटो यशस्वीरित्या टिपला ✓' : 'Photo Captured ✓'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Controls Bar */}
          {!cameraError && (
            <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-around z-10">
              {stagedPhoto ? (
                /* Actions after capture: Retake or Confirm */
                <div className="w-full max-w-sm flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleRetakeStagedPhoto}
                    className="flex-1 py-3.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm backdrop-blur-md transition flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{isMarathi ? 'पुन्हा काढा' : 'Retake'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmStagedPhoto}
                    className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl transition flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isMarathi ? 'हा फोटो वापरा' : 'Use This Photo'}</span>
                  </button>
                </div>
              ) : (
                /* Capture Button */
                <div className="flex items-center justify-center space-x-8">
                  <button
                    type="button"
                    onClick={handleSwitchCamera}
                    className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-md"
                    title={isMarathi ? 'कॅमेरा बदला' : 'Switch Camera'}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>

                  {/* Shutter Button */}
                  <button
                    type="button"
                    onClick={handleCaptureFrame}
                    className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1.5 transition active:scale-95 shadow-2xl hover:scale-105"
                    title={isMarathi ? 'फोटो काढा' : 'Capture Photo'}
                  >
                    <div className="w-full h-full rounded-full bg-white transition hover:bg-slate-200" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleCloseCamera();
                      fileInputRef.current?.click();
                    }}
                    className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-md"
                    title={isMarathi ? 'गॅलरीतून निवडा' : 'Upload File'}
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
