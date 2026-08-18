import React, { useState } from 'react';
import type { Book } from '../types/resonance';
import type { TradeItem } from '../plugins/tradeValuePlugin';
import {
  extractTradeValueFromBook,
  updateBookTradeValue,
  calculateTradeBalance,
  isBookAvailableForTrade
} from '../plugins/tradeValuePlugin';
import {
  X,
  Scale,
  Trash2,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

interface TradeCalculatorModalProps {
  isOpen: boolean;
  books: Book[];
  onClose: () => void;
  onUpdateBookTradeValue: (updatedBook: Book) => void;
}

export const TradeCalculatorModal: React.FC<TradeCalculatorModalProps> = ({
  isOpen,
  books,
  onClose,
  onUpdateBookTradeValue
}) => {
  const [sideAItems, setSideAItems] = useState<TradeItem[]>(() => {
    return books.slice(0, 2).map(b => ({
      id: b.id,
      title: b.title,
      tradeValueUsd: extractTradeValueFromBook(b),
      coverColor: b.coverColor
    }));
  });

  const [sideBItems, setSideBItems] = useState<TradeItem[]>(() => {
    return books.slice(2, 4).map(b => ({
      id: b.id,
      title: b.title,
      tradeValueUsd: extractTradeValueFromBook(b),
      coverColor: b.coverColor
    }));
  });

  const [selectedBookForSideA, setSelectedBookForSideA] = useState<string>('');
  const [selectedBookForSideB, setSelectedBookForSideB] = useState<string>('');

  // Custom trade item entry state
  const [customTitle, setCustomTitle] = useState('');
  const [customValue, setCustomValue] = useState<number>(25.00);
  const [customTargetSide, setCustomTargetSide] = useState<'A' | 'B'>('A');

  if (!isOpen) return null;

  const tradeResult = calculateTradeBalance(sideAItems, sideBItems);

  const handleAddFromLibrary = (bookId: string, side: 'A' | 'B') => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const tradeItem: TradeItem = {
      id: `${book.id}-${Date.now()}`,
      title: book.title,
      tradeValueUsd: extractTradeValueFromBook(book),
      coverColor: book.coverColor
    };

    if (side === 'A') {
      setSideAItems([...sideAItems, tradeItem]);
      setSelectedBookForSideA('');
    } else {
      setSideBItems([...sideBItems, tradeItem]);
      setSelectedBookForSideB('');
    }
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const tradeItem: TradeItem = {
      id: `custom-trade-${Date.now()}`,
      title: customTitle.trim(),
      tradeValueUsd: parseFloat(Number(customValue).toFixed(2))
    };

    if (customTargetSide === 'A') {
      setSideAItems([...sideAItems, tradeItem]);
    } else {
      setSideBItems([...sideBItems, tradeItem]);
    }

    setCustomTitle('');
    setCustomValue(25.00);
  };

  const handleUpdateItemValue = (id: string, side: 'A' | 'B', newVal: number) => {
    const parsedVal = parseFloat(newVal.toFixed(2));
    if (side === 'A') {
      setSideAItems(sideAItems.map(item => item.id === id ? { ...item, tradeValueUsd: parsedVal } : item));
    } else {
      setSideBItems(sideBItems.map(item => item.id === id ? { ...item, tradeValueUsd: parsedVal } : item));
    }

    // Also update underlying book if matched
    const originalBook = books.find(b => id.startsWith(b.id));
    if (originalBook) {
      const updated = updateBookTradeValue(originalBook, parsedVal);
      onUpdateBookTradeValue(updated);
    }
  };

  const handleRemoveItem = (id: string, side: 'A' | 'B') => {
    if (side === 'A') {
      setSideAItems(sideAItems.filter(item => item.id !== id));
    } else {
      setSideBItems(sideBItems.filter(item => item.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight tracking-tight flex items-center space-x-2">
                <span>Fair Trade Value Calculator & Asset Comparator</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  DECIMAL PRECISION ($ USD)
                </span>
              </h3>
              <p className="text-xs text-slate-400">Compare Asset Trade Values &bull; Decimal Support &bull; Auto-Balance Cash Suggestions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
          
          {/* Trade Fairness Gauge Banner */}
          <div className={`p-5 rounded-3xl border transition-all space-y-3 font-mono text-xs shadow-xl ${
            tradeResult.fairnessStatus === 'EQUAL_FAIR'
              ? 'bg-gradient-to-r from-emerald-950/50 via-slate-900 to-emerald-950/50 border-emerald-500/50'
              : tradeResult.fairnessStatus === 'SLIGHT_DISCREPANCY'
              ? 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/50 border-amber-500/50'
              : 'bg-gradient-to-r from-rose-950/50 via-slate-900 to-rose-950/50 border-rose-500/50'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-400" />
                <span className="font-extrabold text-sm sm:text-base text-slate-100">
                  Trade Balance: Side A (${tradeResult.sideATotal.toFixed(2)}) vs Side B (${tradeResult.sideBTotal.toFixed(2)})
                </span>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
                tradeResult.fairnessStatus === 'EQUAL_FAIR'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : tradeResult.fairnessStatus === 'SLIGHT_DISCREPANCY'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {tradeResult.fairnessStatus === 'EQUAL_FAIR' && '🟢 100% FAIR EQUAL TRADE'}
                {tradeResult.fairnessStatus === 'SLIGHT_DISCREPANCY' && '🟡 SLIGHT DISCREPANCY'}
                {tradeResult.fairnessStatus === 'UNFAIR_DISCREPANCY' && '🔴 UNBALANCED TRADE'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px] border-t border-slate-800">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Side A Total:</span>
                <strong className="text-sky-400 text-sm font-bold">${tradeResult.sideATotal.toFixed(2)}</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Side B Total:</span>
                <strong className="text-purple-400 text-sm font-bold">${tradeResult.sideBTotal.toFixed(2)}</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Value Difference:</span>
                <strong className="text-amber-300 text-sm font-bold">${tradeResult.differenceUsd.toFixed(2)}</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Trade Ratio:</span>
                <strong className="text-emerald-400 text-sm font-bold">{tradeResult.valueRatioPercent}%</strong>
              </div>
            </div>

            {/* Suggested Cash Balance */}
            {tradeResult.cashBalanceSuggestion.debtorSide !== 'None' && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-amber-500/30 text-amber-200 text-xs font-sans flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Balancing Suggestion:</strong> {tradeResult.cashBalanceSuggestion.debtorSide} should add <strong>${tradeResult.cashBalanceSuggestion.amountUsd.toFixed(2)} USD cash</strong> (or equivalent low-tier card/book) to make this trade perfectly equal.
                </span>
              </div>
            )}
          </div>

          {/* Trade Comparators Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            
            {/* SIDE A: MY OFFERINGS */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-sky-500/40 space-y-4 flex flex-col justify-between shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sky-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>Side A: Your Offers ({sideAItems.length})</span>
                  </h4>
                  <span className="text-sky-300 font-extrabold text-sm">${tradeResult.sideATotal.toFixed(2)}</span>
                </div>

                {/* Add from Library Select */}
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedBookForSideA}
                    onChange={(e) => setSelectedBookForSideA(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs"
                  >
                    <option value="">+ Add Item from Vault...</option>
                    {books.map(b => {
                      const forTrade = isBookAvailableForTrade(b);
                      return (
                        <option key={b.id} value={b.id}>
                          {forTrade ? '🤝 [For Trade] ' : '🔒 '}
                          {b.title} (${extractTradeValueFromBook(b).toFixed(2)})
                        </option>
                      );
                    })}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleAddFromLibrary(selectedBookForSideA, 'A')}
                    disabled={!selectedBookForSideA}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs disabled:opacity-40"
                  >
                    + Add
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sideAItems.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 italic">No items offered on Side A.</div>
                  ) : (
                    sideAItems.map((item) => (
                      <div key={item.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-slate-200 font-bold block truncate">{item.title}</span>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-slate-400 text-[11px]">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={item.tradeValueUsd}
                            onChange={(e) => handleUpdateItemValue(item.id, 'A', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-sky-300 font-bold text-right"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id, 'A')}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* SIDE B: THEIR OFFERINGS */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-purple-500/40 space-y-4 flex flex-col justify-between shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>Side B: Their Offers ({sideBItems.length})</span>
                  </h4>
                  <span className="text-purple-300 font-extrabold text-sm">${tradeResult.sideBTotal.toFixed(2)}</span>
                </div>

                {/* Add from Library Select */}
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedBookForSideB}
                    onChange={(e) => setSelectedBookForSideB(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs"
                  >
                    <option value="">+ Add Item from Vault...</option>
                    {books.map(b => {
                      const forTrade = isBookAvailableForTrade(b);
                      return (
                        <option key={b.id} value={b.id}>
                          {forTrade ? '🤝 [For Trade] ' : '🔒 '}
                          {b.title} (${extractTradeValueFromBook(b).toFixed(2)})
                        </option>
                      );
                    })}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleAddFromLibrary(selectedBookForSideB, 'B')}
                    disabled={!selectedBookForSideB}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-40"
                  >
                    + Add
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sideBItems.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 italic">No items offered on Side B.</div>
                  ) : (
                    sideBItems.map((item) => (
                      <div key={item.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-slate-200 font-bold block truncate">{item.title}</span>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-slate-400 text-[11px]">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={item.tradeValueUsd}
                            onChange={(e) => handleUpdateItemValue(item.id, 'B', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-purple-300 font-bold text-right"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id, 'B')}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Quick Add Custom Non-Vault Item */}
          <form onSubmit={handleAddCustomItem} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-amber-400 font-bold shrink-0">+ Quick Add Custom Item:</span>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Item name (e.g. Vintage Holo Pikachu)"
                className="flex-1 sm:w-56 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                required
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <span className="text-slate-400">Value ($ USD):</span>
              <input
                type="number"
                step="0.01"
                value={customValue}
                onChange={(e) => setCustomValue(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 font-bold text-right"
                required
              />
              <select
                value={customTargetSide}
                onChange={(e) => setCustomTargetSide(e.target.value as 'A' | 'B')}
                className="px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold"
              >
                <option value="A">To Side A</option>
                <option value="B">To Side B</option>
              </select>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0"
              >
                + Add
              </button>
            </div>
          </form>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Sovereign Fair Trade Engine &bull; Decimal Precision ($ USD)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
