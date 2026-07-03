/**
 * TopNav — full-width bar: "peek into <User>" (dropdown-styled for future
 * friend switching), the nested memory breadcrumb, and search.
 */
import React from 'react';
import { BreadcrumbNav } from './BreadcrumbNav';
import { useScrapbookStore } from '@/store/scrapbookStore';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" />
  </svg>
);

const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const TopNav: React.FC = () => {
  const userName = useScrapbookStore((s) => s.project?.userName ?? '');
  const resetToHome = useScrapbookStore((s) => s.resetToHome);

  return (
    <div className="top-nav">
      <button className="nav-brand" onClick={resetToHome} title="Switch peek (coming soon)">
        <span className="font-display font-semibold text-[24px] text-peek-ink">peek</span>
        <span className="font-display text-[24px] text-peek-brown/80"> into {userName}</span>
        <span className="text-peek-brown/60"><Chevron /></span>
      </button>

      <div className="w-px h-6 bg-peek-brown/15 mx-1" />

      <BreadcrumbNav />

      <div className="flex items-center gap-1.5 ml-auto">
        <button className="nav-icon-btn" aria-label="Search">
          <SearchIcon />
        </button>
      </div>
    </div>
  );
};
