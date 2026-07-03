/**
 * TopNav — full-width nav bar: logo (peek), inline breadcrumb path,
 * and right-side actions (search / help / avatar).
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

const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.2 9.3a2.8 2.8 0 0 1 5.4.9c0 1.9-2.6 2.4-2.6 3.8" />
    <circle cx="12" cy="17.4" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

export const TopNav: React.FC = () => {
  const userName = useScrapbookStore((s) => s.project?.userName ?? '');
  const resetToHome = useScrapbookStore((s) => s.resetToHome);

  return (
    <div className="top-nav">
      <div className="nav-logo" onClick={resetToHome} title={`Peek into ${userName}`}>
        peek
      </div>

      <div className="w-px h-6 bg-peek-brown/15" />

      <BreadcrumbNav userName={userName} />

      <div className="flex items-center gap-1.5 ml-auto">
        <button className="nav-icon-btn" aria-label="Search">
          <SearchIcon />
        </button>
        <button className="nav-icon-btn" aria-label="Help">
          <HelpIcon />
        </button>
        <div
          className="nav-avatar bg-peek-dustpink flex items-center justify-center text-peek-ink font-body text-sm font-semibold"
          title={userName}
        >
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
};
