import React from 'react';

interface QueryBarProps {
  queryString: string;
  onChangeQuery: (query: string) => void;
  onClearQuery: () => void;
  resultCount: number;
}

export const QueryBar: React.FC<QueryBarProps> = ({
  queryString,
  onChangeQuery,
  onClearQuery,
  resultCount
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: '#1E1E2E',
        borderBottom: '2px solid #2E1A47',
        boxShadow: '0 2px 0 #000'
      }}
    >
      <span style={{ fontSize: '13px', color: '#FFFBEB', fontWeight: 'bold' }}>
        🐾 Calibre Query:
      </span>
      <input
        type="text"
        value={queryString}
        onChange={e => onChangeQuery(e.target.value)}
        placeholder='e.g. tags:"=LitRPG" and not tags:"=slow-burn" and series:"=Dungeon Crawler Carl"'
        style={{
          flex: 1,
          padding: '6px 10px',
          borderRadius: '8px',
          background: '#2B2B3D',
          border: '1px solid #4E4E6A',
          color: '#FFFBEB',
          fontSize: '12px',
          outline: 'none'
        }}
      />
      <span style={{ fontSize: '11px', color: '#B5B0D0', whiteSpace: 'nowrap' }}>
        {resultCount} books found
      </span>
      {queryString && (
        <button
          onClick={onClearQuery}
          style={{
            background: '#2E1A47',
            color: '#FFFBEB',
            border: '1px solid #7B68EE',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      )}
    </div>
  );
};
