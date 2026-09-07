import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { BarChart3, Check, ChevronDown, ChevronRight, CircleHelp, ClipboardList, Download, Menu, Moon, MoreHorizontal, Plus, RotateCcw, Settings2, Sparkles, Sun, Target, Trash2, TrendingUp, X } from 'lucide-react';
import type { Page, Trade, View, BoardGroup } from './types';
import { realTrades } from './trades';
import { calculateAnalytics, formatCurrency } from './analytics';
import { TradeTable, TradeBoard, JournalToolbar, ViewSwitcher } from './components/JournalViews';
import { StatisticsPage } from './components/StatisticsPage';
import { TradeForm, blankForm } from './components/TradeForm';
import type { TradeFormState } from './components/TradeForm';
import { MiniStat } from './components/ui';

const storageKey = 'private-trading-journal-v2';

function loadTrades(): Trade[] {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as Trade[]) : realTrades;
  } catch {
    return realTrades;
  }
}

function App() {
  const [trades, setTrades] = useState<Trade[]>(loadTrades);
  const [page, setPage] = useState<Page>('journal');
  const [view, setView] = useState<View>('table');
  const [boardGroup, setBoardGroup] = useState<BoardGroup>('week');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TradeFormState>(blankForm);
  const [query, setQuery] = useState('');
  const [sortAscending, setSortAscending] = useState(false);
  const [notice, setNotice] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => localStorage.getItem('tradecraft-theme') === 'light' ? 'light' : 'dark');

  const saveTrades = (next: Trade[]) => {
    setTrades(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const filteredTrades = useMemo(() =>
    trades
      .filter((t) => Object.values(t).join(' ').toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => sortAscending ? a.dateTime.localeCompare(b.dateTime) : b.dateTime.localeCompare(a.dateTime)),
    [trades, query, sortAscending]
  );

  const analytics = useMemo(() => calculateAnalytics(trades), [trades]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Trade = {
      id: crypto.randomUUID(),
      name: form.name || `TEST ${String(trades.length + 1).padStart(2, '0')}`,
      dateTime: form.dateTime,
      type: form.type,
      result: form.result,
      pnl: Number(form.pnl),
      planCompliance: form.planCompliance,
      psychology: form.psychology,
      setupType: form.setupType,
      confluences: form.confluences,
      direction: form.direction,
      sl: Number(form.sl) || 0,
      tp: Number(form.tp) || 0,
      rr: Number(form.rr) || 0,
    };
    saveTrades([next, ...trades]);
    setForm(blankForm);
    setShowForm(false);
    setNotice('Trade added to your private documentary');
    window.setTimeout(() => setNotice(''), 2800);
  };

  const deleteTrade = (id: string) => saveTrades(trades.filter((t) => t.id !== id));
  const clearJournal = () => { if (window.confirm('Clear every trade from this device?')) saveTrades([]); };
  const restoreDemo = () => saveTrades(realTrades);
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('tradecraft-theme', next);
  };

  const exportJournal = () => {
    const blob = new Blob([JSON.stringify(trades, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trading-journal.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`app-shell ${theme}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Target size={17} /></div>
          <span>Tradecraft</span>
          <button className="icon-button sidebar-menu"><Menu size={16} /></button>
        </div>
        <div className="workspace">
          <div className="avatar">TC</div>
          <div><strong>My workspace</strong><span>Private documentary</span></div>
          <ChevronDown size={15} />
        </div>
        <nav className="nav-list">
          <button className={page === 'journal' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('journal')}>
            <ClipboardList size={16} />Documentary <span className="nav-count">{trades.length}</span>
          </button>
          <button className={page === 'statistics' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('statistics')}>
            <BarChart3 size={16} />Statistics
          </button>
        </nav>
        <div className="sidebar-section">
          <div className="sidebar-label">Workspace</div>
          <button className="nav-item muted"><Sparkles size={15} />Review ritual</button>
          <button className="nav-item muted"><Settings2 size={15} />Preferences</button>
        </div>
        <div className="sidebar-footer">
          <div className="offline-dot"></div>
          <span>Private & offline</span>
          <CircleHelp size={15} />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{page === 'journal' ? 'Documentary' : 'Statistics'}</strong>
          </div>
          <div className="top-actions">
            <div className="privacy-chip"><span className="pulse"></span>Local only</div>
            <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}<span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button className="icon-button"><CircleHelp size={17} /></button>
            <button className="icon-button"><MoreHorizontal size={18} /></button>
          </div>
        </header>

        <div className="page-wrap">
          {page === 'journal' ? (
            <>
              <section className="documentary-cover" aria-label="Documentary cover">
                <div className="cover-grain"></div>
                <div className="cover-ridge ridge-one"></div>
                <div className="cover-ridge ridge-two"></div>
                <div className="cover-figure"></div>
              </section>
              <section className="documentary-heading">
                <div className="documentary-title"><ClipboardList size={24} /><h1>DOCUMENTARY</h1></div>
                <div className="documentary-tabs"><button className="selected">▦&nbsp; Full Log</button><button>⌘&nbsp; Full Gallery</button><button>▦&nbsp; Weekly Log</button><button>⌘&nbsp; Weekly Gallery</button><button>▦&nbsp; Loss Log</button><button>▦&nbsp; Win Log</button></div>
              </section>
              <section className="hero-row documentary-actions">
                <div><p className="subtitle">A clear record of your decisions, process, and performance.</p></div>
                <div className="hero-actions">
                  <button className="button secondary" onClick={exportJournal}><Download size={15} />Export</button>
                  <button className="button primary" onClick={() => setShowForm(true)}><Plus size={17} />New trade</button>
                </div>
              </section>

              <div className="quick-stats">
                <MiniStat label="Cumulative PnL" value={formatCurrency(trades.reduce((s, t) => s + t.pnl, 0))} tone={trades.reduce((s, t) => s + t.pnl, 0) >= 0 ? 'positive' : 'negative'} icon={<TrendingUp size={15} />} />
                <MiniStat label="Trades logged" value={String(trades.length).padStart(2, '0')} icon={<ClipboardList size={15} />} />
                <MiniStat label="Win rate" value={`${trades.length ? Math.round((trades.filter((t) => t.result === 'Win').length / trades.length) * 100) : 0}%`} icon={<Target size={15} />} />
                <MiniStat label="Plan compliance" value={`${trades.length ? Math.round((trades.filter((t) => t.planCompliance === 'Yes').length / trades.length) * 100) : 0}%`} icon={<Check size={15} />} />
              </div>

              <section className="panel journal-panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title"><ClipboardList size={17} />Documentary log</div>
                    <div className="panel-caption">Your execution history · {trades.length} records</div>
                  </div>
                  <ViewSwitcher view={view} setView={setView} />
                </div>
                <JournalToolbar query={query} setQuery={setQuery} />
                {view === 'table'
                  ? <TradeTable trades={filteredTrades} onDelete={deleteTrade} sortAscending={sortAscending} setSortAscending={setSortAscending} />
                  : <TradeBoard trades={filteredTrades} group={boardGroup} setGroup={setBoardGroup} />}
              </section>

              <div className="journal-foot">
                <span><span className="offline-dot"></span>Everything is stored on this device</span>
                <div>
                  <button onClick={restoreDemo}><RotateCcw size={13} />Restore demo data</button>
                  <button onClick={clearJournal}><Trash2 size={13} />Clear journal</button>
                </div>
              </div>
            </>
          ) : (
            <StatisticsPage analytics={analytics} trades={trades} />
          )}
        </div>
      </main>

      {showForm && <TradeForm form={form} setForm={setForm} onSubmit={handleSubmit} onClose={() => setShowForm(false)} />}
      {notice && <div className="toast"><Check size={16} />{notice}</div>}
    </div>
  );
}

export default App;
