import type { Trade, View, BoardGroup } from '@/types';
import { CalendarDays, Check, ChevronDown, ClipboardList, Filter, LayoutGrid, List, MoreHorizontal, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { formatDate, formatTime, formatCurrency, resultTone, dayKey, weekKey, shortDayLabel } from '@/analytics';

export function TradeTable({ trades, onDelete, sortAscending, setSortAscending }: { trades: Trade[]; onDelete: (id: string) => void; sortAscending: boolean; setSortAscending: (v: boolean) => void }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th className="index-col">#</th>
            <th><button className="th-sort" onClick={() => setSortAscending(!sortAscending)}>Date & time <ChevronDown size={13} className={sortAscending ? 'rotate' : ''} /></button></th>
            <th>Name</th>
            <th>Type</th>
            <th>L/S</th>
            <th>Result</th>
            <th>PnL</th>
            <th>SL</th>
            <th>TP</th>
            <th>RR</th>
            <th>Plan</th>
            <th>Psychology</th>
            <th>Confluences</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, index) => (
            <tr key={trade.id}>
              <td className="index-col">{String(index + 1).padStart(2, '0')}</td>
              <td>
                <div className="date-cell">
                  <CalendarDays size={14} />
                  <div>
                    <strong>{formatDate(trade.dateTime)}</strong>
                    <span>{formatTime(trade.dateTime)}</span>
                  </div>
                </div>
              </td>
              <td><span className="trade-name">{trade.name}</span></td>
              <td><span className="type-pill">{trade.type}</span></td>
              <td><span className={`dir-pill ${trade.direction.toLowerCase()}`}>{trade.direction === 'Long' ? 'L' : 'S'}</span></td>
              <td><span className={`result-pill ${resultTone(trade.result)}`}><span></span>{trade.result}</span></td>
              <td><strong className={trade.pnl >= 0 ? 'positive' : 'negative'}>{trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}</strong></td>
              <td className="mono-cell">${trade.sl}</td>
              <td className="mono-cell">${trade.tp}</td>
              <td className="mono-cell">{trade.rr.toFixed(1)}</td>
              <td><span className={`compliance ${trade.planCompliance.toLowerCase()}`}>{trade.planCompliance === 'Yes' ? <Check size={12} /> : <X size={12} />}{trade.planCompliance}</span></td>
              <td><span className="psychology"><span className={`psych-dot ${trade.psychology === 'Calm / Disciplined' ? 'green' : 'red'}`}></span>{trade.psychology}</span></td>
              <td className="confluences">{trade.confluences.length ? trade.confluences.join(', ') : <span className="empty-value">—</span>}</td>
              <td><button className="row-delete" onClick={() => onDelete(trade.id)} aria-label="Delete trade"><Trash2 size={14} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {trades.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><ClipboardList size={22} /></div>
          <h3>No trades found</h3>
          <p>Adjust your search or add your first trade to start building your record.</p>
        </div>
      )}
    </div>
  );
}

export function TradeBoard({ trades, group, setGroup }: { trades: Trade[]; group: BoardGroup; setGroup: (g: BoardGroup) => void }) {
  const groups = Array.from(new Set(trades.map((t) => (group === 'week' ? weekKey(t.dateTime) : dayKey(t.dateTime))))).sort().reverse();
  return (
    <div className="board-wrap">
      <div className="board-toolbar">
        <span>Group by</span>
        <button className={group === 'week' ? 'active' : ''} onClick={() => setGroup('week')}>Week</button>
        <button className={group === 'day' ? 'active' : ''} onClick={() => setGroup('day')}>Day</button>
      </div>
      <div className="board">
        {groups.map((key) => {
          const colTrades = trades.filter((t) => (group === 'week' ? weekKey(t.dateTime) : dayKey(t.dateTime)) === key);
          const total = colTrades.reduce((s, t) => s + t.pnl, 0);
          return (
            <div className="board-column" key={key}>
              <div className="column-head">
                <div>
                  <strong>{group === 'week' ? `Week of ${shortDayLabel(key)}` : shortDayLabel(key)}</strong>
                  <span>{colTrades.length} {colTrades.length === 1 ? 'trade' : 'trades'}</span>
                </div>
                <strong className={total >= 0 ? 'positive' : 'negative'}>{total >= 0 ? '+' : ''}{formatCurrency(total)}</strong>
              </div>
              {colTrades.map((trade) => (
                <div className="trade-card" key={trade.id}>
                  <div className="card-top">
                    <span className="type-pill">{trade.type}</span>
                    <span className={`result-pill ${resultTone(trade.result)}`}><span></span>{trade.result}</span>
                  </div>
                  <strong className={trade.pnl >= 0 ? 'positive' : 'negative'}>{trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}</strong>
                  <div className="card-meta">{formatTime(trade.dateTime)} · {trade.direction}</div>
                  <div className="card-tags">
                    <span>{trade.planCompliance === 'Yes' ? 'Plan followed' : 'Off plan'}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
        {groups.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><LayoutGrid size={22} /></div>
            <h3>No trades to group</h3>
            <p>Add a trade to see it appear in your board.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function JournalToolbar({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
  return (
    <div className="toolbar">
      <div className="search-box">
        <Search size={15} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search trades..." />
      </div>
      <button className="tool-button"><Filter size={15} />Filter</button>
      <button className="tool-button"><SlidersHorizontal size={15} />Properties</button>
      <button className="icon-button mobile-hide"><MoreHorizontal size={17} /></button>
    </div>
  );
}

export function ViewSwitcher({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <div className="view-switcher">
      <button className={view === 'table' ? 'selected' : ''} onClick={() => setView('table')}><List size={15} />Table</button>
      <button className={view === 'board' ? 'selected' : ''} onClick={() => setView('board')}><LayoutGrid size={15} />Board</button>
    </div>
  );
}
