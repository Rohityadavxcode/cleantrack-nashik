'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/LanguageContext';
import {
  HelpCircle,
  PhoneCall,
  MapPin,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { NASHIK_ZONES } from '@/lib/constants';

export default function HelpFaqPage() {
  const { t, language } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      qEn: 'Is CleanTrack Nashik an official government portal?',
      qMr: 'क्लिनट्रॅक नाशिक हे अधिकृत शासकीय पोर्टल आहे का?',
      aEn: 'No. CleanTrack Nashik is an independent civic complaint reporting and transparency portal built to help residents document, track, and monitor public civic issues. It prepares structured reports with GPS coordinates and evidence photos that can integrate with municipal grievance mechanisms.',
      aMr: 'नाही. क्लिनट्रॅक नाशिक हे नाशिककरांसाठी नागरी समस्यांची नोंदणी आणि पारदर्शक ट्रॅकिंग करण्यासाठी तयार केलेले स्वतंत्र नागरी व्यासपीठ आहे. हे जीपीएस स्थान आणि फोटो पुराव्यासह तक्रार नोंदवते जेणेकरून भविष्यात पालिका प्रणालीशी समन्वय साधता येईल.',
    },
    {
      qEn: 'How do I know my complaint has been received?',
      qMr: 'माझी तक्रार नोंदवली गेली आहे हे मला कसे समजेल?',
      aEn: 'Immediately upon submitting, the system generates a unique Reference ID (e.g. CTN-2026-000101) and sends an SMS notification to your mobile number. You can enter this ID on the "Track Complaint" page at any time to see the live status.',
      aMr: 'तक्रार दाखल करताच प्रणाली एक युनिक तक्रार क्रमांक (उदा. CTN-2026-000101) तयार करते आणि आपल्या मोबाईलवर एसएमएस पाठवते. आपण कधीही "तक्रार स्थिती" पृष्ठावर हा क्रमांक टाकून प्रगती पाहू शकता.',
    },
    {
      qEn: 'Will my phone number and personal details be shown publicly?',
      qMr: 'माझा मोबाईल क्रमांक आणि वैयक्तिक माहिती सर्वांना दिसेल का?',
      aEn: 'Never. CleanTrack Nashik protects your privacy. On public tracking pages, your name and phone number are heavily masked (e.g., R**** P****, ******3210). Only authorized municipal divisional officers can view your verified phone number to coordinate repairs.',
      aMr: 'कधीही नाही. क्लिनट्रॅक नाशिक आपली गोपनीयता पूर्णपणे सुरक्षित ठेवते. सार्वजनिक ट्रॅकिंगवर आपले नाव आणि फोन नंबर मास्क केले जातात (उदा. R**** P****, ******3210). केवळ अधिकृत पालिका अधिकाऱ्यांनाच संपर्क साधण्यासाठी माहिती दिसते.',
    },
    {
      qEn: 'What happens if my GPS location permission is denied?',
      qMr: 'जर जीपीएस लोकेशन परवानगी नाकारली तर काय होईल?',
      aEn: 'You do not need GPS to submit! You can simply type your locality (e.g., "College Road", "Ramkund", "Untwadi") into the search box or manually click/drag the pin on the Nashik interactive map.',
      aMr: 'जीपीएस शिवायही आपण तक्रार करू शकता! आपण शोधपेटीत आपला परिसर (उदा. "कॉलेज रोड", "रामकुंड", "उंटवाडी") लिहू शकता किंवा नकाशावर मार्कर हलवून अचूक ठिकाण निवडू शकता.',
    },
    {
      qEn: 'What should I do if a problem is marked resolved but is still not fixed?',
      qMr: 'समस्या सुटल्याचे दाखवले पण प्रत्यक्षात काम झाले नसेल तर काय करावे?',
      aEn: 'On the tracking page, when a ticket is marked Resolved, you can click "No, Problem Still Exists". This reopens the ticket, requires the department to investigate further, and preserves the entire audit trail.',
      aMr: 'ट्रॅकिंग पृष्ठावर तक्रार "निवारण झाले" (Resolved) झाल्यावर आपण "नाही, समस्या अजूनही कायम आहे" हा पर्याय निवडू शकता. यामुळे तक्रार पुन्हा उघडली जाते आणि अधिकाऱ्याला पुन्हा दखल घ्यावी लागते.',
    },
    {
      qEn: 'What should I do in life-threatening emergencies?',
      qMr: 'जीवघेण्या आणीबाणीच्या परिस्थितीत काय करावे?',
      aEn: 'CleanTrack Nashik is for municipal civic grievances. For immediate police, medical, fire, or disaster emergencies, please dial 112 (National Emergency Helpline) or 101 (Fire Brigade) directly.',
      aMr: 'क्लिनट्रॅक हे नागरी तक्रारींसाठी आहे. तात्काळ पोलीस, वैद्यकीय किंवा अग्निशामक आणीबाणीसाठी थेट ११२ किंवा १०१ या हेल्पलाईनवर संपर्क साधा.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-civic-700 uppercase tracking-wider">
          Support & Frequently Asked Questions
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Help & Civic Directory
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Frequently asked questions about CleanTrack Nashik, citizen privacy, and municipal division offices.
        </p>
      </div>

      {/* FAQs Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
          <HelpCircle className="w-5 h-5 text-civic-700" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 flex justify-between items-center transition"
                >
                  <span>{language === 'mr' ? faq.qMr : faq.qEn}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {language === 'mr' ? faq.aMr : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Nashik Municipal Corporation Divisional Ward Offices Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
          <MapPin className="w-5 h-5 text-civic-700" />
          <span>Nashik Municipal Divisional Offices Directory</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NASHIK_ZONES.map((zone) => (
            <div
              key={zone.code}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
            >
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'mr' ? zone.nameMarathi : zone.name}
              </h3>
              <p className="text-slate-600 leading-snug">
                {zone.officeAddress}
              </p>
              <div className="pt-1 flex items-center space-x-1.5 text-civic-700 font-mono font-bold">
                <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                <span>{zone.emergencyContact}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Localities: {zone.localities.slice(0, 4).join(', ')}...
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
