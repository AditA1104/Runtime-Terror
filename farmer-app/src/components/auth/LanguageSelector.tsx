import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { SupportedLang } from '../../lib/translations';

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { lang, setLanguage, languages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangInfo = languages.find(l => l.code === lang) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-full border border-green-200 bg-white/90 backdrop-blur-sm text-green-900 shadow-sm transition-all hover:bg-green-50 active:scale-95 ${
          compact ? 'px-2.5 py-1 text-xs font-semibold' : 'px-3.5 py-1.5 text-sm font-semibold'
        }`}
        title="Change Language"
        aria-label="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-green-700 shrink-0" />
        <span className="font-medium">{currentLangInfo.nativeLabel}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            Select Language / भाषा
          </div>
          <div className="py-1">
            {languages.map(item => {
              const isSelected = item.code === lang;
              return (
                <button
                  key={item.code}
                  onClick={() => {
                    setLanguage(item.code as SupportedLang);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-sm rounded-xl transition-colors ${
                    isSelected
                      ? 'bg-green-50 text-green-800 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.flag}</span>
                    <div className="text-left">
                      <div className="leading-none">{item.nativeLabel}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.label}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-green-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
