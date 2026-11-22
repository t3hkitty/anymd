import React from 'react';
import { FilterState } from '../../../types/kittlibr-ext';

interface FacetSidebarProps {
  currentGroupBy: FilterState['groupBy'];
  onSelectGroupBy: (group: FilterState['groupBy']) => void;
  facetCounts: Map<string, number>;
  onTagClick: (tag: string, exclude: boolean) => void;
}

const GROUPS: FilterState['groupBy'][] = [
  'Authors',
  'Series',
  'Tags',
  'Warnings',
  'Status',
  'Smart Shelves'
];

export const FacetSidebar: React.FC<FacetSidebarProps> = ({
  currentGroupBy,
  onSelectGroupBy,
  facetCounts,
  onTagClick
}) => {
  return (
    <aside
      style={{
        width: '280px',
        backgroundColor: '#1E1E2E',
        color: '#E6E6FA',
        borderRight: '2px solid #2E1A47',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '8px',
        boxSizing: 'border-box',
        boxShadow: '4px 0px 0px #000'
      }}
    >
      <div style={{ paddingBottom: '8px', borderBottom: '1px solid #2E1A47' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', textTransform: 'uppercase', color: '#FFFBEB' }}>
          🐾 Group By
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          {GROUPS.map(grp => (
            <button
              key={grp}
              onClick={() => onSelectGroupBy(grp)}
              style={{
                background: currentGroupBy === grp ? '#2E1A47' : '#28293D',
                color: currentGroupBy === grp ? '#FFFBEB' : '#E6E6FA',
                border: currentGroupBy === grp ? '1px solid #FFFBEB' : '1px solid #3E3859',
                borderRadius: '8px',
                padding: '6px 4px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              {grp}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', marginTop: '8px' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {Array.from(facetCounts.entries()).map(([label, count]) => (
            <li
              key={label}
              onClick={() => onTagClick(label, false)}
              onContextMenu={e => {
                e.preventDefault();
                onTagClick(label, true);
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 8px',
                margin: '2px 0',
                background: '#252538',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {label}
              </span>
              <span
                style={{
                  background: '#2E1A47',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              >
                {count}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};
