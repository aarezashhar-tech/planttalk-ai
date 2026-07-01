import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

const LOADING_MESSAGES = [
  'Analyzing your plant image...',
  'AI is examining leaf patterns...',
  'Checking for disease markers...',
  'Generating diagnosis report...',
  'Finding best treatments...',
];

export const PlantDoctor = ({ userProfile }) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [analysisText, setAnalysisText] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('plantDoctorHistory');
      if (stored) setHistory(JSON.parse(stored));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (err) => reject(err);
  });

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setAnalysisText(null);
    setSelectedImage(URL.createObjectURL(file));
    setImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setError(null);
    setAnalysisText(null);
    setSelectedImage(URL.createObjectURL(file));
    setImageFile(file);
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    setAnalysisText(null);
    setError(null);
    setLoadingMsgIdx(0);

    try {
      const base64Image = await fileToBase64(imageFile);
      const mimeType = imageFile.type || 'image/jpeg';

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          mime_type: mimeType,
        }),
      });

      const data = await response.json();

      if (data.success && data.analysis) {
        setAnalysisText(data.analysis);
        const firstLine = data.analysis.split('\n')[0].replace(/[#*]/g, '').trim();
        const title = firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;

        // Bug 7: Save full analysis text and image in history
        const entry = {
          id: Date.now(),
          title: title,
          fullAnalysis: data.analysis,
          imageUrl: selectedImage,
          timestamp: Date.now(),
        };
        const updated = [entry, ...history].slice(0, 10);
        setHistory(updated);
        localStorage.setItem('plantDoctorHistory', JSON.stringify(updated));
      } else {
        const errMsg = data.error || 'Unknown error from API';
        setError(`❌ ${errMsg}`);
      }
    } catch (networkErr) {
      console.error('Network error:', networkErr);
      setError('❌ Cannot reach the backend server.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const timeAgo = (ts) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const renderAnalysis = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={i} />;
      if (trimmed.startsWith('##')) return <h3 key={i} className="text-lg font-bold text-secondary mt-4 mb-2">{trimmed.replace(/^#+\s*/, '')}</h3>;
      if (trimmed.startsWith('# ')) return <h2 key={i} className="text-xl font-bold text-secondary mt-4 mb-2">{trimmed.replace(/^#+\s*/, '')}</h2>;
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        return (
          <div key={i} className="flex items-start gap-2 my-1">
            <span className="text-primary mt-0.5">•</span>
            <p className="text-gray-100" dangerouslySetInnerHTML={{ __html: trimmed.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
          </div>
        );
      }
      return <p key={i} className="text-gray-100 my-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />;
    });
  };

  return (
    <div className="text-white min-h-screen overflow-x-hidden selection:bg-secondary selection:text-on-secondary bg-[#0F1C14]">
      {/* Background Mesh */}
      <div className="fixed inset-0 -z-10 pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 15% 50%, rgba(26, 71, 49, 0.4) 0%, transparent 50%),
                          radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                          radial-gradient(circle at 50% 80%, rgba(0, 165, 114, 0.2) 0%, transparent 50%)`,
        backgroundAttachment: 'fixed',
        animation: 'pulse-bg 15s ease-in-out infinite alternate'
      }}></div>

      {/* SideNavBar */}
      <nav className="fixed left-0 top-0 h-full w-64 rounded-r-xl bg-surface-container dark:bg-surface-container bg-gradient-to-b from-primary-container to-surface-container-lowest backdrop-blur-xl border-r border-white/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] flex flex-col p-6 z-50 hidden md:flex">
        <div className="mb-12">
          <h1 className="font-headline-lg text-headline-lg font-bold text-secondary tracking-tight">PLANTTALK AI</h1>
          <p className="font-label-mono text-label-mono text-gray-100 mt-1 uppercase tracking-wider">Living Intelligence</p>
        </div>
        <ul className="space-y-2 flex-grow">
          <li>
            <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg" href="/">
              <span className="material-icons">home</span>
              <span className="font-label-mono text-label-mono">{t('Home')}</span>
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 text-secondary bg-white/10 rounded-lg border-l-2 border-secondary scale-95 transition-transform duration-200" style={{boxShadow: '0 0 10px #10B981'}} href="/doctor">
              <span className="material-icons">medical_services</span>
              <span className="font-label-mono text-label-mono">{t('Doctor')}</span>
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg" href="/india">
              <span className="material-icons">location_on</span>
              <span className="font-label-mono text-label-mono">{t('India')}</span>
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg" href="/community">
              <span className="material-icons">groups</span>
              <span className="font-label-mono text-label-mono">{t('Community')}</span>
            </a>
          </li>
          <li>
            <a className="flex items-center gap-3 px-4 py-3 text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-md transition-all duration-300 rounded-lg" href="/settings">
              <span className="material-icons">settings</span>
              <span className="font-label-mono text-label-mono">{t('Settings')}</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen flex flex-col relative z-10">
        {/* Mobile Header — Bug 4: removed bell icon */}
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a1a10]/80 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-4 z-40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/50">
              <span className="material-icons text-secondary text-sm" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
            </div>
            <span className="font-bold text-secondary text-base tracking-tight">PlantTalk AI</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="text-gray-100 hover:text-secondary min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full">
              <span className="material-icons text-xl">account_circle</span>
            </button>
          </div>
        </header>

        {/* Desktop Header — Bug 4: removed bell icon */}
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-20 bg-transparent backdrop-blur-md border-b border-white/5 justify-between items-center px-8 z-40 hidden md:flex">
          <div className="text-primary dark:text-primary"></div>
          <div className="flex items-center gap-6">
            <button className="text-gray-100 hover:text-secondary transition-colors hover:translate-y-[-1px] transition-transform">
              <span className="material-icons">account_circle</span>
            </button>
          </div>
        </header>

        <div className="pt-20 md:pt-32 px-4 md:px-8 pb-24 md:pb-12 flex-grow flex flex-col lg:flex-row gap-6 md:gap-8 max-w-7xl mx-auto w-full">
          {/* Main Center Zone */}
          <div className="flex-1 flex flex-col animate-slide-up" style={{animationDelay: '0.1s', animationFillMode: 'both'}}>
            <header className="mb-8">
              <h2 className="font-display-lg text-2xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2 md:gap-3">
                <span className="material-icons text-secondary text-3xl md:text-5xl font-bold" style={{fontVariationSettings: "'FILL' 1"}}>psychiatry</span>
                {t('AI Plant Doctor')}
              </h2>
              <p className="font-body-md text-body-md text-gray-100 max-w-2xl text-sm md:text-base">
                {t('Upload a photo of your plant for an instant diagnosis powered by Gemini Vision API.')}
              </p>
            </header>

            {/* Drag & Drop Container */}
            <div 
              className="bg-white/5 backdrop-blur-xl border border-white/10 border-t-white/20 border-l-white/15 rounded-2xl flex-grow flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden group min-h-[280px] md:min-h-[400px] cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-90"></div>
              
              {!selectedImage && (
                <div className="absolute inset-4 z-0 opacity-90 group-hover:opacity-100 transition-opacity rounded-xl" style={{
                  backgroundImage: `linear-gradient(90deg, #10B981 50%, transparent 50%), linear-gradient(90deg, #10B981 50%, transparent 50%), linear-gradient(0deg, #10B981 50%, transparent 50%), linear-gradient(0deg, #10B981 50%, transparent 50%)`,
                  backgroundRepeat: 'repeat-x, repeat-x, repeat-y, repeat-y',
                  backgroundSize: '16px 2px, 16px 2px, 2px 16px, 2px 16px',
                  backgroundPosition: '0% 0%, 100% 100%, 0% 100%, 100% 0px',
                  animation: 'march 1s linear infinite'
                }}></div>
              )}

              <div className="relative z-10 flex flex-col items-center text-center space-y-6 w-full h-full justify-center">
                {selectedImage ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img src={selectedImage} alt="Selected" className="max-h-[250px] md:max-h-[350px] object-contain rounded-lg shadow-sm" />
                    <div className="mt-4 text-sm font-semibold text-secondary bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20">{t('Click or drop to change image')}</div>
                  </div>
                ) : (
                  <>
                    <div className="w-24 h-24 rounded-full bg-surface-container-highest flex items-center justify-center shadow-lg border border-white/10 animate-[bounce_2s_infinite_cubic-bezier(0.28,0.84,0.42,1)] mb-4">
                      <span className="material-icons text-4xl font-bold text-secondary">add_a_photo</span>
                    </div>
                    <div>
                      <h3 className="font-headline-lg text-xl md:text-2xl font-bold text-white mb-2">{t('Drag and drop an image here')}</h3>
                      <p className="font-body-md text-body-md text-gray-100">{t('or')} <span className="text-secondary cursor-pointer hover:underline">{t('click to browse')}</span> {t('your files')}</p>
                    </div>
                    <p className="font-label-mono text-label-mono text-gray-100/90 uppercase">{t('Supports JPG, PNG, WEBP (Max 10MB)')}</p>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </div>
            </div>

            {error && (
              <div className="mt-6 bg-error/20 border border-error/50 p-4 rounded-xl text-error font-medium whitespace-pre-line animate-fade-in">
                {error}
              </div>
            )}

            {/* Action Button */}
            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleAnalyze}
                disabled={!imageFile || isAnalyzing}
                className="bg-secondary text-on-secondary px-6 md:px-8 py-4 rounded-xl font-headline-lg text-base md:text-xl font-bold flex items-center gap-3 transition-all disabled:opacity-90 disabled:cursor-not-allowed hover:shadow-[0_0_25px_rgba(16,185,129,0.7)] hover:-translate-y-[2px] min-h-[52px] w-full sm:w-auto justify-center"
                style={{boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'}}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t(LOADING_MESSAGES[loadingMsgIdx])}
                  </>
                ) : (
                  <>
                    <span className="material-icons">auto_awesome</span>
                    {t('Analyze Plant Image')}
                  </>
                )}
              </button>
            </div>
            
            {/* Analysis Result */}
            {analysisText && !isAnalyzing && (
              <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-lg animate-slide-up">
                <div className="bg-white/5 p-4 border-b border-white/10 flex items-center gap-3">
                  <span className="text-2xl font-bold text-secondary material-icons">psychiatry</span>
                  <div>
                    <h2 className="font-bold text-white">{t('Diagnostic Report')}</h2>
                    <p className="text-xs text-gray-100">{t('Generated by Gemini 3.5-flash')}</p>
                  </div>
                </div>
                <div className="p-6 text-sm">
                  {renderAnalysis(analysisText)}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Panel - Recent Diagnoses */}
          <aside className="w-full lg:w-80 flex flex-col gap-6 animate-slide-up" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 border-t-white/20 border-l-white/15 rounded-xl p-6 h-full flex flex-col">
              <h3 className="font-label-mono text-label-mono text-gray-100 uppercase tracking-widest border-b border-white/10 pb-4 mb-6">{t('Recent Diagnoses')}</h3>
              
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((h) => (
                    <div 
                      key={h.id} 
                      className="flex gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
                      onClick={() => setSelectedDiagnosis(h)}
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10 flex flex-shrink-0 items-center justify-center text-sm">🌿</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{h.title || 'Analysis'}</p>
                        <p className="text-xs text-gray-100 mt-1">{timeAgo(h.timestamp)}</p>
                      </div>
                      <span className="material-icons text-gray-100 text-sm self-center">chevron_right</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center py-12 opacity-90">
                  <span className="material-icons text-5xl font-bold text-outline-variant mb-4" style={{fontVariationSettings: "'wght' 200"}}>search</span>
                  <p className="font-body-md text-body-md text-gray-100">{t('No recent diagnoses found.')}</p>
                  <p className="font-label-mono text-label-mono text-gray-100/90 mt-2">{t('Upload an image to get started.')}</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Bug 7: Diagnosis Detail Modal */}
      {selectedDiagnosis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedDiagnosis(null)}>
          <div className="bg-[#0F1C14] border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-white/5 p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-icons text-secondary text-2xl">psychiatry</span>
                <div>
                  <h2 className="font-bold text-white text-lg">{t('Diagnosis Details')}</h2>
                  <p className="text-xs text-gray-100">{timeAgo(selectedDiagnosis.timestamp)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDiagnosis(null)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <span className="material-icons text-white">close</span>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              {selectedDiagnosis.imageUrl && (
                <div className="mb-6 flex justify-center">
                  <img src={selectedDiagnosis.imageUrl} alt="Diagnosis" className="max-h-48 object-contain rounded-lg border border-white/10" />
                </div>
              )}
              {selectedDiagnosis.fullAnalysis ? (
                <div className="text-sm">
                  {renderAnalysis(selectedDiagnosis.fullAnalysis)}
                </div>
              ) : (
                <div className="text-center text-gray-100 py-8">
                  <span className="material-icons text-3xl mb-2 block text-outline-variant">info</span>
                  <p>{t('Full diagnosis text was not saved for this entry.')}</p>
                  <p className="text-xs mt-1 text-gray-100/70">{selectedDiagnosis.title}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-bg {
            0% { background-position: 0% 0%; }
            100% { background-position: 100% 100%; }
        }
        @keyframes march {
            0% { background-position: 0% 0%, 100% 100%, 0% 100%, 100% 0px; }
            100% { background-position: 16px 0%, calc(100% - 16px) 100%, 0% calc(100% - 16px), 100% 16px; }
        }
      `}} />
    </div>
  );
};
