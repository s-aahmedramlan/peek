/**
 * BreadcrumbNav — the current memory path, rendered inline in the top nav.
 * The first crumb reads "Life of <User>" and returns to the home canvas.
 */
import React from 'react';
import { useScrapbookStore } from '@/store/scrapbookStore';

interface Props {
  userName?: string;
}

const Chevron = () => (
  <svg className="breadcrumb-separator" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

export const BreadcrumbNav: React.FC<Props> = ({ userName }) => {
  const breadcrumbs = useScrapbookStore((s) => s.breadcrumbs);
  const enterCanvas = useScrapbookStore((s) => s.enterCanvas);
  const project = useScrapbookStore((s) => s.project);

  if (!project) return null;

  const handleNavigate = (index: number) => {
    if (index === breadcrumbs.length - 1) return;
    enterCanvas(breadcrumbs[index].canvasId);
  };

  return (
    <nav className="breadcrumb-nav" aria-label="Memory path">
      {breadcrumbs.map((crumb, index) => {
        const isCurrent = index === breadcrumbs.length - 1;
        const label = index === 0 ? `Life of ${userName ?? crumb.label}` : crumb.label;
        return (
          <React.Fragment key={crumb.canvasId}>
            {index > 0 && <Chevron />}
            <button
              onClick={() => handleNavigate(index)}
              className={`breadcrumb-item ${isCurrent ? 'current' : ''}`}
            >
              {label}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
