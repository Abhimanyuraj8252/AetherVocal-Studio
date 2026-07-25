import React from 'react';
import { HelpCircle, CheckCircle2, Zap, ShieldCheck, Download, Mic, FileText } from 'lucide-react';

export function SeoSection() {
  const faqs = [
    {
      q: "हिंदी टेक्स्ट टू स्पीच (Text to Speech) कैसे यूज़ करें?",
      a: "AetherVocal Studio में अपनी हिंदी या इंग्लिश स्क्रिप्ट टाइप करें या पेस्ट करें। अपनी पसंद की AI आवाज़ (Male/Female) चुनें और 'Save Audio (MP3)' बटन पर क्लिक करें। आपका ऑडियो तुरंत डाउनलोड हो जाएगा।"
    },
    {
      q: "क्या यह ऑडियो जनरेटर फ्री है और क्या MP3 डाउनलोड कर सकते हैं?",
      a: "जी हाँ! AetherVocal Studio बिल्कुल 100% फ्री है। आप बिना किसी लिमिट के अनलिमिटेड अक्षरों की स्क्रिप्ट को हाई-क्वालिटी MP3 ऑडियो फाइल में बदलकर मोबाइल और PC दोनों पर डाउनलोड कर सकते हैं।"
    },
    {
      q: "क्या यह मोबाइल और कंप्यूटर दोनों में काम करता है?",
      a: "हाँ, AetherVocal Studio पूरी तरह से टच-रेस्पॉन्सिव है और Android, iPhone, iPad, Windows, and Mac पर स्मूथ काम करता है।"
    },
    {
      q: "AetherVocal Studio की मुख्य विशेषताएं क्या हैं?",
      a: "इसमें हिंदी और इंग्लिश वॉइस प्रोफाइल, ऑटो-मार्कडाउन सिंबल क्लीनर, रियल-टाइम ऑडियो प्लेयर, अनलिमिटेड कैरेक्टर लिमिट और डायरेक्ट MP3 एक्सपोर्ट की सुविधा शामिल है।"
    }
  ];

  return (
    <section className="seo-content-section mt-12 mb-16 px-4 max-w-6xl mx-auto">
      {/* Brand & Keyword Rich Overview */}
      <article className="glass-card p-6 md:p-8 rounded-3xl mb-8 border border-white/10 bg-slate-900/60 backdrop-blur-xl">
        <header className="flex items-center gap-3 mb-4">
          <img src="/favicon.svg" alt="AetherVocal Studio Logo" className="w-10 h-10 object-contain" />
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              AetherVocal Studio — Best Hindi &amp; English Text to Speech (TTS) Generator
            </h2>
            <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase mt-0.5">
              Natural AI Voices • High Quality MP3 Download • Unlimited Free Usage
            </p>
          </div>
        </header>

        <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-4">
          Welcome to <strong className="text-white">AetherVocal Studio</strong>, the most advanced free online <strong>Hindi and English Text to Speech (TTS) AI voice generator</strong>. Convert your written stories, YouTube scripts, podcast narrations, educational lessons, and reels into crystal-clear human-like male and female speech in seconds.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <Mic className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">Realistic AI Voices</h3>
              <p className="text-xs text-slate-400 mt-0.5">Natural male &amp; female speech tones in Hindi &amp; English.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <Download className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">Direct MP3 Download</h3>
              <p className="text-xs text-slate-400 mt-0.5">Save studio-quality MP3 audio files directly to Mobile &amp; PC.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">Unlimited &amp; Fast</h3>
              <p className="text-xs text-slate-400 mt-0.5">No character limits, instant processing, and Markdown auto-cleaning.</p>
            </div>
          </div>
        </div>
      </article>

      {/* Frequently Asked Questions (FAQ) for Google Rich Snippets */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 mb-6">
          <HelpCircle className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl md:text-2xl font-bold text-white">
            अक्सर पूछे जाने वाले सवाल (Frequently Asked Questions)
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group p-4 rounded-2xl bg-slate-800/40 border border-white/5 transition-all duration-200">
              <summary className="font-semibold text-slate-200 cursor-pointer list-none flex justify-between items-center text-sm md:text-base">
                <span>{faq.q}</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform duration-200 ml-2">▼</span>
              </summary>
              <p className="mt-3 text-xs md:text-sm text-slate-400 leading-relaxed pl-1 border-l-2 border-indigo-500/50">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
