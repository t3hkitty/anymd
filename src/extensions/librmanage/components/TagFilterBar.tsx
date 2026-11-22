import React from 'react';

interface TagFilterBarProps {
  includeTags: string[];
  excludeTags: string[];
  onRemoveTag: (tag: string) => void;
  onClearAll: () => void;
}

export const TagFilterBar: React.FC<TagFilterBarProps> = ({
  includeTags,
  excludeTags,
  onRemoveTag,
  onClearAll
}) => {
  if (includeTags.length === 0 && excludeTags.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '6px',
        padding: '6px 12px',
        background: '#252538',
        borderBottom: '2px solid #000',
        boxShadow: '0 2px 0 #000'
      }}
    >
      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#FFFBEB' }}>
        🔍 Active Filters:
      </span>

      {includeTags.map(tag => (
        <span
          key={`inc-${tag}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#2E1A47',
            border: '1px solid #7B68EE',
            color: '#FFFBEB',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            boxShadow: '2px 2px 0 #000'
          }}
        >
          <strong style={{ marginRight: '4px', color: '#98FB98' }}>+</strong> {tag}
          <button
            onClick={() => onRemoveTag(tag)}
            style={{
              marginLeft: '6px',
              background: 'transparent',
              border: 'none',
              color: '#FFFBEB',
              cursor: 'pointer',
              fontWeight: 'bold',
              padding: 0
            }}
          >
            ×
          </button>
        </span>
      ))}

      {excludeTags.map(tag => (
        <span
          key={`exc-${tag}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#471A24',
            border: '1px solid #FF6B81',
            color: '#FFFBEB',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            boxShadow: '2px 2px 0 #000'
          }}
        >
          <strong style={{ marginRight: '4px', color: '#FF6B81' }}>-</strong> {tag}
          <button
            onClick={() => onRemoveTag(tag)}
            style={{
              marginLeft: '6px',
              background: 'transparent',
              border: 'none',
              color: '#FFFBEB',
              cursor: 'pointer',
              fontWeight: 'bold',
              padding: 0
            }}
          >
            ×
          </button>
        </span>
      ))}

      <button
        onClick={onClearAll}
        style={{
          marginLeft: 'auto',
          background: '#1E1E2E',
          color: '#E6E6FA',
          border: '1px solid #4E4E6A',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '10px',
          cursor: 'pointer'
        }}
      >
        Clear All
      </button>
    </div>
  );
};
