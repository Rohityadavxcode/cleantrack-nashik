'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/i18n/LanguageContext';
import { useAuth } from '@/features/auth/AuthContext';
import {
  CIVIC_CATEGORIES,
  NASHIK_COORDINATES,
  NASHIK_ZONES,
} from '@/lib/constants';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { LocationPickerMap } from '@/components/maps/LocationPickerMap';
import {
  CheckCircle2,
  Camera,
  Upload,
  X,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Shield,
  MapPin,
  ExternalLink,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react';

function ReportProblemContent() {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard Step: 1 to 6
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>('GARBAGE');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');

  const [photos, setPhotos] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('2-3 days');
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [isBlockingTraffic, setIsBlockingTraffic] = useState(false);
  const [isHealthHazard, setIsHealthHazard] = useState(false);

  // Geolocation
  const [latitude, setLatitude] = useState<number>(NASHIK_COORDINATES.center.lat);
  const [longitude, setLongitude] = useState<number>(NASHIK_COORDINATES.center.lng);
  const [address, setAddress] = useState<string>('Nashik, Maharashtra');
  const [zoneName, setZoneName] = useState<string>('Panchavati Zone');

  // Duplicate Detection
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);
  const [duplicateAcknowledged, setDuplicateAcknowledged] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  // Citizen Contact
  const [citizenName, setCitizenName] = useState(user?.name || '');
  const [citizenMobile, setCitizenMobile] = useState(user?.mobile || '');
  const [citizenEmail, setCitizenEmail] = useState(user?.email || '');
  const [citizenLanguage, setCitizenLanguage] = useState<'en' | 'mr'>(
    (language as 'en' | 'mr') || 'en'
  );
  const [useSavedDetails, setUseSavedDetails] = useState(!!user);

  // Auto-Save Draft State (Section 30)
  const [savedDraft, setSavedDraft] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check for unfinished draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cleantrack_draft');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.title || parsed.description || parsed.selectedCategoryId) {
          setSavedDraft(parsed);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Auto-save form draft whenever fields change
  useEffect(() => {
    if (submittedRefId) return; // Don't save after success
    const timer = setTimeout(() => {
      if (title || description || selectedCategoryId) {
        try {
          localStorage.setItem(
            'cleantrack_draft',
            JSON.stringify({
              title,
              description,
              selectedCategoryId,
              selectedCategoryCode,
              selectedSubcategoryId,
              duration,
              urgency,
              isBlockingTraffic,
              isHealthHazard,
              latitude,
              longitude,
              address,
              zoneName,
              citizenName,
              citizenMobile,
              citizenEmail,
              currentStep,
              savedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            })
          );
        } catch (e) {
          // ignore
        }
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [
    title,
    description,
    selectedCategoryId,
    selectedCategoryCode,
    selectedSubcategoryId,
    duration,
    urgency,
    isBlockingTraffic,
    isHealthHazard,
    latitude,
    longitude,
    address,
    zoneName,
    citizenName,
    citizenMobile,
    citizenEmail,
    currentStep,
    submittedRefId,
  ]);

  const restoreDraft = () => {
    if (!savedDraft) return;
    if (savedDraft.title) setTitle(savedDraft.title);
    if (savedDraft.description) setDescription(savedDraft.description);
    if (savedDraft.selectedCategoryId) setSelectedCategoryId(savedDraft.selectedCategoryId);
    if (savedDraft.selectedCategoryCode) setSelectedCategoryCode(savedDraft.selectedCategoryCode);
    if (savedDraft.selectedSubcategoryId) setSelectedSubcategoryId(savedDraft.selectedSubcategoryId);
    if (savedDraft.duration) setDuration(savedDraft.duration);
    if (savedDraft.urgency) setUrgency(savedDraft.urgency);
    if (savedDraft.isBlockingTraffic !== undefined) setIsBlockingTraffic(savedDraft.isBlockingTraffic);
    if (savedDraft.isHealthHazard !== undefined) setIsHealthHazard(savedDraft.isHealthHazard);
    if (savedDraft.latitude) setLatitude(savedDraft.latitude);
    if (savedDraft.longitude) setLongitude(savedDraft.longitude);
    if (savedDraft.address) setAddress(savedDraft.address);
    if (savedDraft.zoneName) setZoneName(savedDraft.zoneName);
    if (savedDraft.citizenName) setCitizenName(savedDraft.citizenName);
    if (savedDraft.citizenMobile) setCitizenMobile(savedDraft.citizenMobile);
    if (savedDraft.citizenEmail) setCitizenEmail(savedDraft.citizenEmail);
    if (savedDraft.currentStep) setCurrentStep(savedDraft.currentStep);
    setSavedDraft(null);
  };

  const discardDraft = () => {
    localStorage.removeItem('cleantrack_draft');
    setSavedDraft(null);
  };

  const copyRefIdToClipboard = async (idToCopy: string) => {
    try {
      await navigator.clipboard.writeText(idToCopy);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    } catch (e) {
      alert(`Complaint ID: ${idToCopy}`);
    }
  };

  // Fetch Categories from DB
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data.length > 0) {
            setCategories(json.data);

            // Check query param (e.g. /report?category=ROADS)
            const paramCat = searchParams.get('category');
            const target = json.data.find(
              (c: any) => c.code === (paramCat || 'GARBAGE')
            ) || json.data[0];

            setSelectedCategoryId(target.id);
            setSelectedCategoryCode(target.code);
          }
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, [searchParams]);

  // Sync auth user details if available
  useEffect(() => {
    if (user && useSavedDetails) {
      if (!citizenName) setCitizenName(user.name);
      if (!citizenMobile) setCitizenMobile(user.mobile);
      if (!citizenEmail && user.email) setCitizenEmail(user.email);
    }
  }, [user, useSavedDetails]);


  // Client-side image compression with Canvas
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 3) {
      alert('You can upload a maximum of 3 photos.');
      return;
    }

    setIsCompressing(true);
    const newPhotos: string[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert('Please upload image files only.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const scaleSize = MAX_WIDTH / img.width;
          const width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
          const height = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            newPhotos.push(compressed);

            if (newPhotos.length === files.length) {
              setPhotos((prev) => [...prev, ...newPhotos]);
              setIsCompressing(false);
            }
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Duplicate Check Trigger (When moving from Location to Contact)
  const triggerDuplicateCheck = async () => {
    if (!selectedCategoryId) return;
    setIsCheckingDuplicate(true);
    setErrorMessage(null);

    try {
      const res = await fetch(
        `/api/complaints/check-duplicate?categoryId=${selectedCategoryId}&lat=${latitude}&lng=${longitude}&radius=100`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.isDuplicateSuspected && !duplicateAcknowledged) {
          setDuplicateWarning(data.closestComplaint);
        } else {
          setDuplicateWarning(null);
        }
      }
    } catch (e) {
      console.warn('Duplicate check skipped:', e);
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // Step Validation
  const validateStep = () => {
    setErrorMessage(null);

    if (currentStep === 1) {
      if (!selectedCategoryId) {
        setErrorMessage('Please select a problem category.');
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      // Photos are recommended, but not strictly blocking if citizen doesn't have camera
      return true;
    }

    if (currentStep === 3) {
      if (!title.trim() || title.length < 5) {
        setErrorMessage('Please enter a clear title (at least 5 characters).');
        return false;
      }
      if (!description.trim() || description.length < 15) {
        setErrorMessage('Please provide a meaningful description (at least 15 characters).');
        return false;
      }
      return true;
    }

    if (currentStep === 4) {
      if (!address.trim()) {
        setErrorMessage('Please confirm a valid location or landmark in Nashik.');
        return false;
      }
      return true;
    }

    if (currentStep === 5) {
      if (!citizenName.trim() || citizenName.length < 2) {
        setErrorMessage('Please enter your full name.');
        return false;
      }
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(citizenMobile.trim())) {
        setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (currentStep === 4) {
      await triggerDuplicateCheck();
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Final Submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        title,
        description,
        categoryId: selectedCategoryId,
        subcategoryId: selectedSubcategoryId || null,
        urgency,
        duration,
        isBlockingTraffic,
        isHealthHazard,
        latitude,
        longitude,
        address,
        zoneName,
        citizenName,
        citizenMobile,
        citizenEmail: citizenEmail || null,
        citizenLanguage,
        photos,
      };

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedRefId(data.referenceId);
        try {
          localStorage.removeItem('cleantrack_draft');
          setSavedDraft(null);
        } catch (e) {}
      } else {
        setErrorMessage(data.error || 'Failed to submit complaint. Please check your inputs.');
      }
    } catch (err) {
      setErrorMessage('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategory = categories.find((c) => c.id === selectedCategoryId);

  // Success Screen
  if (submittedRefId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t.report.successTitle}
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              {t.report.successSubtitle}
            </p>
          </div>

          <div className="p-6 bg-slate-50 border-2 border-dashed border-civic-300 rounded-xl space-y-3">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              {t.report.yourRefId}
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-civic-700 select-all">
              {submittedRefId}
            </div>

            <button
              type="button"
              onClick={() => copyRefIdToClipboard(submittedRefId)}
              className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition inline-flex items-center space-x-1"
            >
              {copiedId ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Copy Reference ID</span>
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 pt-1">
              Save this ID for reference. An SMS confirmation was sent to{' '}
              <span className="font-semibold text-slate-700">******{citizenMobile.slice(-4)}</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={() => router.push(`/track?id=${submittedRefId}`)}
              className="px-6 py-3.5 rounded-xl bg-civic-700 hover:bg-civic-800 text-white font-bold text-sm shadow transition"
            >
              {t.report.trackNowBtn} &rarr;
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-civic-800 font-bold text-sm border border-sky-200 transition"
            >
              View in My Reports
            </button>
            <button
              onClick={() => {
                setSubmittedRefId(null);
                setCurrentStep(1);
                setTitle('');
                setDescription('');
                setPhotos([]);
              }}
              className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition"
            >
              {t.report.fileAnotherBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title & Progress Header */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold text-civic-700 uppercase tracking-wider">
            CleanTrack Nashik Citizen Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t.report.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">{t.report.subtitle}</p>
        </div>

        {/* Auto-Save Draft Recovery Banner (Section 30) */}
        {savedDraft && (
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center space-x-2 text-xs text-amber-900 font-medium">
              <span className="text-lg">💾</span>
              <div>
                <strong className="text-amber-950 font-bold block text-sm">
                  Unfinished report found ({savedDraft.savedAt || 'Saved'})
                </strong>
                <span>You have an autosaved report draft. Would you like to continue where you left off?</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={restoreDraft}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition"
              >
                Continue Draft
              </button>
              <button
                type="button"
                onClick={discardDraft}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-semibold text-xs transition"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* 6-Step Multi-Stage Stepper */}
        <div className="grid grid-cols-6 gap-1 sm:gap-2 pt-2">
          {[
            { step: 1, label: t.report.step1 },
            { step: 2, label: t.report.step2 },
            { step: 3, label: t.report.step3 },
            { step: 4, label: t.report.step4 },
            { step: 5, label: t.report.step5 },
            { step: 6, label: t.report.step6 },
          ].map((item) => (
            <div key={item.step} className="space-y-1">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentStep >= item.step ? 'bg-civic-600' : 'bg-slate-200'
                }`}
              />
              <span
                className={`hidden sm:block text-[11px] font-semibold truncate ${
                  currentStep === item.step ? 'text-civic-700' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Select Problem Category */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {t.report.selectCategoryTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.report.selectCategorySubtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setSelectedCategoryCode(cat.code);
                    setSelectedSubcategoryId('');
                  }}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-civic-600 bg-civic-50 ring-2 ring-civic-500 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                      isSelected ? 'bg-civic-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                      {language === 'mr' ? cat.nameMarathi : cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      SLA: ~{cat.defaultSlaHours} hrs
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Subcategories (if available for selected category) */}
          {currentCategory?.subcategories?.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                {t.report.selectSubcategoryTitle}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentCategory.subcategories.map((sub: any) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubcategoryId(sub.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition ${
                      selectedSubcategoryId === sub.id
                        ? 'border-civic-600 bg-sky-50 text-civic-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {language === 'mr' ? sub.nameMarathi : sub.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Upload Photo */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {t.report.photoTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.report.photoSubtitle}
            </p>
          </div>

          {/* Image Previews */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((photoUrl, index) => (
              <div
                key={index}
                className="relative h-36 rounded-xl overflow-hidden border border-slate-200 shadow-sm group"
              >
                <img
                  src={photoUrl}
                  alt={`Complaint upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white transition shadow"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-slate-950/60 px-1.5 py-0.5 rounded">
                  Photo {index + 1}
                </div>
              </div>
            ))}

            {photos.length < 3 && (
              <label className="h-36 border-2 border-dashed border-slate-300 hover:border-civic-500 rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-slate-50 transition text-center space-y-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-sky-50 text-civic-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {photos.length === 0 ? 'Click to Upload / Capture' : 'Add Another Photo'}
                </div>
                <span className="text-[10px] text-slate-400">
                  ({photos.length}/3 photos added)
                </span>
              </label>
            )}
          </div>

          {isCompressing && (
            <div className="flex items-center space-x-2 text-xs text-civic-700">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Optimizing image for quick upload...</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
            {t.report.photoRequirements}
          </div>
        </div>
      )}

      {/* STEP 3: Describe Problem */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {t.report.detailsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.report.detailsSubtitle}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.report.issueTitleLabel} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.report.issueTitlePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.report.issueDescLabel} *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.report.issueDescPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400">
                Minimum 15 characters. Current count: {description.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {t.report.durationLabel}
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white"
                >
                  <option value="Since today (< 24 hours)">Since today (&lt; 24 hours)</option>
                  <option value="2-3 days">2 - 3 days</option>
                  <option value="About 1 week">About 1 week</option>
                  <option value="More than 2 weeks">More than 2 weeks</option>
                  <option value="Recurring / chronic issue">Recurring / chronic issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {t.report.urgencyLabel}
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white font-semibold"
                >
                  <option value="LOW">Low (Routine maintenance)</option>
                  <option value="MEDIUM">Medium (Normal civic priority)</option>
                  <option value="HIGH">High (Immediate attention needed)</option>
                  <option value="CRITICAL">Critical (Life / safety emergency)</option>
                </select>
              </div>
            </div>

            {/* Checkbox toggles */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBlockingTraffic}
                  onChange={(e) => setIsBlockingTraffic(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-civic-600 focus:ring-civic-500 border-slate-300"
                />
                <span className="text-xs text-slate-700 font-medium">
                  {t.report.blockingTraffic}
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHealthHazard}
                  onChange={(e) => setIsHealthHazard(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <span className="text-xs text-slate-700 font-medium">
                  {t.report.healthHazard}
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Geolocation on Nashik Map */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {t.report.locationTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.report.locationSubtitle}
            </p>
          </div>

          <LocationPickerMap
            latitude={latitude}
            longitude={longitude}
            address={address}
            zoneName={zoneName}
            onLocationChange={(newLat, newLng, newAddr, newZ) => {
              setLatitude(newLat);
              setLongitude(newLng);
              setAddress(newAddr);
              setZoneName(newZ);
            }}
          />
        </div>
      )}

      {/* STEP 5: Citizen Contact Details & Duplicate Notice */}
      {currentStep === 5 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {t.report.contactTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.report.contactSubtitle}
            </p>
          </div>

          {/* Possible Duplicate Alert Banner (Section 22) */}
          {duplicateWarning && !duplicateAcknowledged && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-3">
              <div className="flex items-start space-x-2 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">
                    {t.report.duplicateAlertTitle}
                  </h4>
                  <p className="text-xs mt-1">
                    {t.report.duplicateAlertDesc}{' '}
                    <strong className="text-amber-950 font-bold">
                      {duplicateWarning.distanceMeters} {t.report.metersAway}
                    </strong>{' '}
                    (Existing ID: <span className="font-mono font-bold">{duplicateWarning.referenceId}</span> - &quot;{duplicateWarning.title}&quot;).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={`/track?id=${duplicateWarning.referenceId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center space-x-1"
                >
                  <span>{t.report.duplicateView}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setDuplicateAcknowledged(true)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-semibold"
                >
                  {t.report.duplicateContinue}
                </button>
              </div>
            </div>
          )}

          {/* Logged in auto-populate shortcut (Section 14) */}
          {user && (
            <label className="flex items-center space-x-2 text-xs font-bold text-civic-800 bg-sky-50 p-3 rounded-xl border border-sky-200 cursor-pointer shadow-sm">
              <input
                type="checkbox"
                checked={useSavedDetails}
                onChange={(e) => {
                  setUseSavedDetails(e.target.checked);
                  if (e.target.checked && user) {
                    setCitizenName(user.name);
                    setCitizenMobile(user.mobile);
                    if (user.email) setCitizenEmail(user.email);
                  }
                }}
                className="w-4 h-4 rounded text-civic-600 focus:ring-civic-500"
              />
              <span>✓ Use my saved account details ({user.name} - {user.mobile})</span>
            </label>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.report.fullNameLabel} *
              </label>
              <input
                type="text"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                placeholder="e.g., Ramesh Patil"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.report.mobileLabel} *
              </label>
              <input
                type="tel"
                maxLength={10}
                value={citizenMobile}
                onChange={(e) => setCitizenMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g., 9876543210"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.report.emailLabel}
              </label>
              <input
                type="email"
                value={citizenEmail}
                onChange={(e) => setCitizenEmail(e.target.value)}
                placeholder="e.g., ramesh@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.report.languageLabel}
              </label>
              <select
                value={citizenLanguage}
                onChange={(e) => setCitizenLanguage(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white font-medium"
              >
                <option value="en">English</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          {/* Privacy Guarantee Reassurance Banner (Section 11 & 27) */}
          <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 flex items-start space-x-3 text-xs text-sky-900 leading-relaxed">
            <Shield className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
            <span>{t.report.privacyNotice}</span>
          </div>
        </div>
      )}

      {/* STEP 6: Review & Confirmation */}
      {currentStep === 6 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {t.report.reviewTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.report.reviewSubtitle}
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm divide-y divide-slate-100">
            <div className="flex justify-between py-2">
              <span className="font-bold text-slate-500">{t.common.category}:</span>
              <span className="font-bold text-slate-900">
                {language === 'mr' ? currentCategory?.nameMarathi : currentCategory?.name}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="font-bold text-slate-500">Problem Title:</span>
              <span className="font-semibold text-slate-900">{title}</span>
            </div>

            <div className="py-2 space-y-1">
              <span className="font-bold text-slate-500 block">Description:</span>
              <p className="text-slate-800 bg-slate-50 p-3 rounded-lg leading-relaxed text-xs">
                {description}
              </p>
            </div>

            <div className="flex justify-between py-2">
              <span className="font-bold text-slate-500">{t.common.urgency}:</span>
              <span className="font-bold text-amber-700">{urgency}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="font-bold text-slate-500">Assigned Nashik Zone:</span>
              <span className="font-bold text-civic-800">{zoneName}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="font-bold text-slate-500">Confirmed Location:</span>
              <span className="text-right text-slate-800 max-w-xs">{address}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="font-bold text-slate-500">Citizen Contact:</span>
              <span className="font-mono text-slate-800">
                {citizenName} (******{citizenMobile.slice(-4)})
              </span>
            </div>

            {photos.length > 0 && (
              <div className="py-3 space-y-2">
                <span className="font-bold text-slate-500 block">Uploaded Evidence ({photos.length}):</span>
                <div className="flex gap-2">
                  {photos.map((p, idx) => (
                    <img
                      key={idx}
                      src={p}
                      alt="Review thumb"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons (Back & Next / Submit) */}
      <div className="flex justify-between items-center pt-2">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold flex items-center space-x-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.common.back}</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep < 6 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={isCheckingDuplicate}
            className="px-7 py-3 rounded-xl bg-civic-700 hover:bg-civic-800 text-white text-sm font-bold shadow-md hover:shadow-lg flex items-center space-x-2 transition"
          >
            {isCheckingDuplicate ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <span>{t.common.next}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold shadow-lg hover:shadow-xl flex items-center space-x-2 transition transform hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.report.submitting}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>{t.report.submitBtn}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ReportProblemPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500 text-sm">Loading reporting wizard...</div>}>
      <ReportProblemContent />
    </Suspense>
  );
}
