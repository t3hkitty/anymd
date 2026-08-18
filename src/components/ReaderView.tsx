import React, { useRef, useEffect } from 'react';
import type { Book, ReadingPosition } from '../types/resonance';
import { Sparkles, ChevronLeft, ChevronRight, Bookmark, Crosshair, Zap, Moon, Sun, BookOpen } from 'lucide-react';

interface ReaderViewProps {
  book: Book;
  currentChapterIndex: number;
  currentParagraphIndex: number;
  activeTargetCfi: string | null;
  readerTheme: 'dark' | 'sepia' | 'light';
  fontSize: number;
  onChapterChange: (index: number) => void;
  onParagraphSelect: (paragraphIndex: number, snippet: string) => void;
  onOpenQuickCapture: (positionOverride?: ReadingPosition) => void;
  onOpenAcquisitionModal?: () => void;
  onThemeChange: (theme: 'dark' | 'sepia' | 'light') => void;
  onFontSizeChange: (delta: number) => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  book,
  currentChapterIndex,
  currentParagraphIndex,
  activeTargetCfi,
  readerTheme,
  fontSize,
  onChapterChange,
  onParagraphSelect,
  onOpenQuickCapture,
  onOpenAcquisitionModal,
  onThemeChange,
  onFontSizeChange,
}) => {
  const currentChapter = book.chapters[currentChapterIndex] || book.chapters[0];
  const paragraphRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calculate live progress percentage
  const totalBookParagraphs = book.chapters.reduce((acc, ch) => acc + ch.paragraphs.length, 0);
  let priorParagraphs = 0;
  for (let i = 0; i < currentChapterIndex; i++) {
    priorParagraphs += book.chapters[i].paragraphs.length;
  }
  const currentTotalIndex = priorParagraphs + currentParagraphIndex;
  const progressPercent = Math.min(100, Math.max(1, Number(((currentTotalIndex + 1) / totalBookParagraphs * 100).toFixed(1))));

  // Generate current EPUB CFI
  const currentCfi = `${currentChapter.cfiBase}/4/2/${(currentParagraphIndex + 1) * 2}/1:${(currentParagraphIndex * 17) + 12})`;

  // Auto-scroll to target CFI paragraph when deep link activated
  useEffect(() => {
    if (activeTargetCfi && paragraphRefs.current[currentParagraphIndex]) {
      paragraphRefs.current[currentParagraphIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeTargetCfi, currentParagraphIndex, currentChapterIndex]);

  const getThemeStyles = () => {
    switch (readerTheme) {
      case 'sepia':
        return {
          bg: 'bg-[#fbf0d9]',
          text: 'text-[#433422]',
          cardBg: 'bg-[#f4e4c1]',
          border: 'border-[#e6d0a7]',
          accent: '#b45309',
          activeParaBg: 'bg-[#f0daaf]'
        };
      case 'light':
        return {
          bg: 'bg-white',
          text: 'text-slate-900',
          cardBg: 'bg-slate-100',
          border: 'border-slate-200',
          accent: '#2563eb',
          activeParaBg: 'bg-blue-50/80'
        };
      case 'dark':
      default:
        return {
          bg: 'bg-[#0f172a]',
          text: 'text-slate-100',
          cardBg: 'bg-slate-900/80',
          border: 'border-slate-800',
          accent: '#6366f1',
          activeParaBg: 'bg-indigo-950/50'
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <div className={`flex flex-col h-full rounded-2xl border ${theme.border} ${theme.bg} ${theme.text} transition-colors duration-300 shadow-2xl overflow-hidden relative`}>
      {/* Reader Control Header */}
      <div className={`px-6 py-4 border-b ${theme.border} flex items-center justify-between backdrop-blur-md bg-opacity-70 ${theme.cardBg}`}>
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-10 rounded-lg shadow-md flex items-center justify-center font-bold text-xs text-white uppercase tracking-wider"
            style={{ backgroundColor: book.coverColor }}
          >
            LC
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight tracking-tight">{book.title}</h2>
            <p className="text-xs opacity-75">{book.author} &bull; {currentChapter.title}</p>
          </div>
        </div>

        {/* Reader Customization Toolbar */}
        <div className="flex items-center space-x-2">
          {/* Font Size controls */}
          <div className="flex items-center bg-black/10 dark:bg-white/10 rounded-xl p-1 border border-white/10 text-xs">
            <button
              onClick={() => onFontSizeChange(-1)}
              className="px-2 py-1 hover:bg-white/20 rounded-lg transition-colors font-bold"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="px-2 text-xs font-mono">{fontSize}px</span>
            <button
              onClick={() => onFontSizeChange(1)}
              className="px-2 py-1 hover:bg-white/20 rounded-lg transition-colors font-bold"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Acquisition Sourcing Provider Button */}
          {onOpenAcquisitionModal && (
            <button
              onClick={onOpenAcquisitionModal}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
              title="Open Acquisition & Sourcing Provider Modal (Kindle Unlimited, Open Library, Public Library, Dreamlist Sourcing)"
            >
              <span>🛒</span>
              <span className="hidden sm:inline">Acquisition</span>
            </button>
          )}

          {/* Theme Selector */}
          <div className="flex items-center bg-black/10 dark:bg-white/10 rounded-xl p-1 border border-white/10 text-xs space-x-1">
            <button
              onClick={() => onThemeChange('dark')}
              className={`p-1.5 rounded-lg transition-all ${readerTheme === 'dark' ? 'bg-indigo-600 text-white shadow-sm' : 'opacity-70 hover:opacity-100'}`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onThemeChange('sepia')}
              className={`p-1.5 rounded-lg transition-all ${readerTheme === 'sepia' ? 'bg-amber-700 text-white shadow-sm' : 'opacity-70 hover:opacity-100'}`}
              title="Sepia Mode"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onThemeChange('light')}
              className={`p-1.5 rounded-lg transition-all ${readerTheme === 'light' ? 'bg-blue-600 text-white shadow-sm' : 'opacity-70 hover:opacity-100'}`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Capture Button */}
          <button
            onClick={() => {
              const pos: ReadingPosition = {
                cfi: currentCfi,
                progressPercent,
                chapterIndex: currentChapterIndex,
                chapterTitle: currentChapter.title,
                paragraphIndex: currentParagraphIndex,
                paragraphSnippet: currentChapter.paragraphs[currentParagraphIndex] || ''
              };
              onOpenQuickCapture(pos);
            }}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
            title="Open Quick Capture (Alt+R)"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Capture Reaction</span>
          </button>
        </div>
      </div>

      {/* Reader Chapter Progress & Telemetry Sub-bar */}
      <div className={`px-6 py-2 border-b ${theme.border} flex items-center justify-between text-xs font-mono opacity-80 bg-opacity-30 ${theme.cardBg}`}>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <Bookmark className="w-3 h-3 text-indigo-400" />
            <span>Ch {currentChapterIndex + 1}/{book.totalChapters}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Crosshair className="w-3 h-3 text-emerald-400" />
            <span className="truncate max-w-[240px] text-[11px]">{currentCfi}</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-amber-400">{progressPercent}% READ</span>
          <div className="w-24 h-1.5 bg-black/20 dark:bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Text Content Area */}
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 select-text" style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}>
        <h3 className="text-xl font-bold font-serif mb-6 pb-2 border-b border-current/10 opacity-90">
          {currentChapter.title}
        </h3>

        {currentChapter.paragraphs.map((para, idx) => {
          const isTargeted = activeTargetCfi !== null && idx === currentParagraphIndex;
          const isSelected = idx === currentParagraphIndex;

          return (
            <div
              key={idx}
              ref={(el) => { paragraphRefs.current[idx] = el; }}
              onClick={() => onParagraphSelect(idx, para)}
              className={`group relative p-4 rounded-xl transition-all duration-300 cursor-pointer border ${
                isTargeted
                  ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/30 scale-[1.01] ring-2 ring-amber-400/50 animate-pulse'
                  : isSelected
                  ? `border-indigo-400/40 ${theme.activeParaBg}`
                  : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {/* Left Paragraph Indicator Tag */}
              <div className="absolute left-1 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 text-[10px] font-mono text-indigo-400">
                <span>#{idx + 1}</span>
              </div>

              <p className="font-serif tracking-wide">{para}</p>

              {/* Direct Paragraph Quick Reaction Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onParagraphSelect(idx, para);
                  const pos: ReadingPosition = {
                    cfi: `${currentChapter.cfiBase}/4/2/${(idx + 1) * 2}/1:${(idx * 17) + 12})`,
                    progressPercent,
                    chapterIndex: currentChapterIndex,
                    chapterTitle: currentChapter.title,
                    paragraphIndex: idx,
                    paragraphSnippet: para
                  };
                  onOpenQuickCapture(pos);
                }}
                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-all bg-indigo-600/90 hover:bg-indigo-500 text-white text-[11px] px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-md"
              >
                <Zap className="w-3 h-3 text-amber-300" />
                <span>Log Reaction</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Reader Footer Navigation */}
      <div className={`px-6 py-3 border-t ${theme.border} flex items-center justify-between ${theme.cardBg}`}>
        <button
          disabled={currentChapterIndex === 0}
          onClick={() => onChapterChange(currentChapterIndex - 1)}
          className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-current/10 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Chapter</span>
        </button>

        <div className="text-xs font-mono opacity-60">
          Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-black/20 dark:bg-white/20 border border-current/20">Alt + R</kbd> to quick-capture anywhere
        </div>

        <button
          disabled={currentChapterIndex === book.totalChapters - 1}
          onClick={() => onChapterChange(currentChapterIndex + 1)}
          className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-current/10 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-all"
        >
          <span>Next Chapter</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
