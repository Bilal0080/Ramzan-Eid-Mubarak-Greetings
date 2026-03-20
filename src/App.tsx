/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Moon, Star, Heart, Sparkles, Sun, CloudMoon, Edit3, User, Loader2, Share2, Check } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import confetti from "canvas-confetti";

const GreetingCard = ({ 
  title, 
  message, 
  icon: Icon, 
  delay = 0, 
  isCustom = false, 
  onHover,
  onShare,
  onEdit
}: { 
  title: string, 
  message: string, 
  icon: any, 
  delay?: number, 
  isCustom?: boolean, 
  onHover?: () => void,
  onShare?: () => void,
  onEdit?: () => void
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    onMouseEnter={onHover}
    transition={{ delay, duration: 0.8 }}
    className={`p-8 rounded-3xl shadow-xl border flex flex-col items-center text-center space-y-4 hover:shadow-2xl transition-all duration-300 cursor-default relative group ${
      isCustom 
        ? "bg-emerald-900 text-emerald-50 border-emerald-800 scale-105 ring-4 ring-emerald-500/20" 
        : "bg-white/80 backdrop-blur-sm border-emerald-100 text-stone-900"
    }`}
  >
    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {isCustom && onEdit && (
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className={`p-2 rounded-full transition-colors ${isCustom ? "bg-emerald-800 hover:bg-emerald-700 text-white" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"}`}
          title="Edit Greeting"
        >
          <Edit3 size={16} />
        </button>
      )}
      <button 
        onClick={(e) => { e.stopPropagation(); onShare?.(); }}
        className={`p-2 rounded-full transition-colors ${isCustom ? "bg-emerald-800 hover:bg-emerald-700 text-white" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"}`}
        title="Share Greeting"
      >
        <Share2 size={16} />
      </button>
    </div>

    <div className={`p-4 rounded-full ${isCustom ? "bg-emerald-800 text-gold" : "bg-emerald-50 text-emerald-700"}`}>
      <Icon size={32} />
    </div>
    <h3 className={`text-2xl serif font-bold ${isCustom ? "text-white" : "text-emerald-950"}`}>{title}</h3>
    <p className={`${isCustom ? "text-emerald-100" : "text-stone-600"} leading-relaxed italic`}>
      {message || "Your personalized message will appear here..."}
    </p>
    <div className="flex gap-3 mt-4">
      {title === "Eid Mubarak" && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onHover?.();
          }}
          className="px-4 py-2 bg-gold text-emerald-950 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
        >
          Celebrate
        </button>
      )}
      <button 
        onClick={(e) => { e.stopPropagation(); onShare?.(); }}
        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center gap-2 ${
          isCustom ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-700"
        }`}
      >
        <Share2 size={12} /> Share
      </button>
    </div>
  </motion.div>
);

export default function App() {
  const [customMessage, setCustomMessage] = useState("");
  const [senderName, setSenderName] = useState("Muhammad Bilal");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const triggerConfetti = useCallback(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }, []);

  const handleShare = async (title: string, message: string) => {
    const shareData = {
      title: `Blessed Greeting: ${title}`,
      text: `${message}\n\nSent with love via Blessed Greetings.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const scrollToEdit = () => {
    const element = document.getElementById("personalize-section");
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    // Focus the first input
    const input = element?.querySelector("input");
    input?.focus();
  };

  const generateBackground = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: 'A breathtaking, high-resolution festive background for a Ramzan and Eid Mubarak app. The scene features intricate traditional Islamic geometric patterns (arabesque) in gold, set against a deep, elegant emerald green silk-textured background. A very subtle, thin glowing crescent moon is visible in the upper corner. Soft, warm ambient lighting with a professional bokeh effect. Minimalist, sophisticated, and spiritually uplifting. 16:9 aspect ratio.',
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          },
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setBackgroundImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error("Failed to generate background:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateBackground();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-emerald-200">
      
      {/* Hero Section */}
      <header className="relative h-[70vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-emerald-950">
        <AnimatePresence mode="wait">
          {backgroundImage ? (
            <motion.div
              key="bg-image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <img 
                src={backgroundImage} 
                alt="Festive Background" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-emerald-950" />
            </motion.div>
          ) : (
            <motion.div
              key="bg-placeholder"
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from),_var(--tw-gradient-to))] from-emerald-900 to-emerald-950 opacity-50"
            />
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="z-10"
        >
          <span className="text-emerald-400 font-medium tracking-widest uppercase text-sm mb-4 block">Blessed Occasions</span>
          <h1 className="text-6xl md:text-8xl serif font-bold text-white mb-6 drop-shadow-2xl">
            Ramzan & Eid <br />
            <span className="italic text-gold">Mubarak</span>
          </h1>
          <p className="text-lg text-emerald-100/80 max-w-2xl mx-auto italic">
            "May Allah always give you a better way to success with His divine guidance."
          </p>
          
          <button 
            onClick={generateBackground}
            disabled={isGenerating}
            className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            {isGenerating ? "Generating Background..." : "Regenerate AI Background"}
          </button>
        </motion.div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-24 -mt-20 relative z-20 space-y-24">
        
        {/* Personalization Section */}
        <section id="personalize-section" className="max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-emerald-100 space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl serif font-bold text-emerald-950">Personalize Your Greeting</h2>
              <p className="text-stone-500">Add your own touch to the celebration</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                  <User size={14} /> Your Name
                </label>
                <input 
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Bilal Tanoli"
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                  <Edit3 size={14} /> Your Message
                </label>
                <textarea 
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Write your heartfelt wishes here..."
                  rows={3}
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Greetings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <GreetingCard 
            title="Suhur Mubarak" 
            message="May your pre-dawn meal be blessed and give you strength for the day's fast."
            icon={Sun}
            delay={0.1}
            onShare={() => handleShare("Suhur Mubarak", "May your pre-dawn meal be blessed and give you strength for the day's fast.")}
          />
          <GreetingCard 
            title="Ramzan Mubarak" 
            message="Wishing you a month filled with blessings, peace, and spiritual growth."
            icon={CloudMoon}
            delay={0.2}
            onShare={() => handleShare("Ramzan Mubarak", "Wishing you a month filled with blessings, peace, and spiritual growth.")}
          />
          <GreetingCard 
            title="Tarawih Mubarak" 
            message="May your prayers be accepted and your heart find tranquility in every Sajdah."
            icon={Star}
            delay={0.3}
            onShare={() => handleShare("Tarawih Mubarak", "May your prayers be accepted and your heart find tranquility in every Sajdah.")}
          />
          <GreetingCard 
            title="Iftar Mubarak" 
            message="May your fast-breaking be a time of gratitude, joy, and delicious blessings."
            icon={Heart}
            delay={0.4}
            onShare={() => handleShare("Iftar Mubarak", "May your fast-breaking be a time of gratitude, joy, and delicious blessings.")}
          />
          <GreetingCard 
            title="Chand Raat" 
            message="The moon is here! Wishing you a night of joy and anticipation for the big day."
            icon={Moon}
            delay={0.5}
            onShare={() => handleShare("Chand Raat", "The moon is here! Wishing you a night of joy and anticipation for the big day.")}
          />
          <GreetingCard 
            title="Eid Mubarak" 
            message="Celebrating the joy of Eid with you and your loved ones. Stay blessed!"
            icon={Sparkles}
            delay={0.6}
            onHover={triggerConfetti}
            onShare={() => handleShare("Eid Mubarak", "Celebrating the joy of Eid with you and your loved ones. Stay blessed!")}
          />
          
          <AnimatePresence>
            {(customMessage || senderName) && (
              <GreetingCard 
                title={senderName ? `Wishes from ${senderName}` : "Personalized Wishes"} 
                message={customMessage}
                icon={Heart}
                isCustom={true}
                onShare={() => handleShare(senderName ? `Wishes from ${senderName}` : "Personalized Wishes", customMessage)}
                onEdit={scrollToEdit}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Copy Success Toast */}
        <AnimatePresence>
          {showCopySuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-700"
            >
              <Check size={18} className="text-emerald-400" />
              <span>Link copied to clipboard!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special Message Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center bg-emerald-950 text-emerald-50 rounded-[3rem] p-12 md:p-20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <Sun size={120} />
          </div>
          <div className="absolute bottom-0 left-0 p-8 opacity-20">
            <Heart size={120} />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl serif italic">Best Wishes</h2>
            <p className="text-xl md:text-2xl font-light leading-relaxed">
              "Best wishes from Awami Governor Sindh IT Initiative with classmates, our teachers, and all. Ramzan Mubarak, Tarawih Mubarak, Chandraat Mubarak with best wishes. Eid Mubarak from all. May Allah always give you a better way to success."
            </p>
            <div className="space-y-4 pt-4">
              <p className="text-lg text-emerald-300 italic">— From Muhammad Bilal</p>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="inline-block px-8 py-4 border-2 border-gold/30 rounded-2xl bg-gold/5"
              >
                <p className="text-gold font-serif text-2xl md:text-3xl italic tracking-wide">
                  Specially from Governor Sindh <br className="md:hidden" />
                  <span className="font-bold not-italic">Kamran Khan Tessori</span>
                </p>
              </motion.div>
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-gold"
              >
                <Heart fill="currentColor" />
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-emerald-100 text-center text-stone-400 text-sm">
        <p>© 2026 Blessed Greetings • Made with Love</p>
      </footer>
    </div>
  );
}
