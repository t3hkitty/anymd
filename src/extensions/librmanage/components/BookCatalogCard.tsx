import React from 'react';
import { BookMetadataYaml } from '../../../types/kittlibr-ext';

interface BookCatalogCardProps {
  book: BookMetadataYaml;
  onTagClick: (tag: string, exclude: boolean) => void;
  onOpenMoreInfo: (book: BookMetadataYaml) => void;
  onReadBook: (book: BookMetadataYaml) => void;
}

export const BookCatalogCard: React.FC<BookCatalogCardProps> = ({
  book,
  onTagClick,
  onOpenMoreInfo,
  onReadBook
}) => {
  return (
    <div
      style={{
        background: '#232136',
        color: '#E6E6FA',
        border: '2px solid #2E1A47',
        borderRadius: '14px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '4px 4px 0px #000',
        position: 'relative'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3
            onClick={() => onReadBook(book)}
            style={{
              margin: '0 0 4px 0',
              fontSize: '14px',
              color: '#FFFBEB',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            {book.title}
          </h3>
          <span
            style={{
              fontSize: '10px',
              background: '#2E1A47',
              padding: '2px 6px',
              borderRadius: '8px',
              color: '#E6E6FA'
            }}
          >
            {book.status}
          </span>
        </div>

        <div style={{ fontSize: '12px', color: '#B5B0D0', marginBottom: '6px' }}>
          by <strong>{book.author}</strong>
          {book.series && (
            <span style={{ marginLeft: '6px', color: '#DDA0DD' }}>
              • {book.series} #{book.series_index ?? 1}
            </span>
          )}
        </div>

        {/* Tag & Warning Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '6px 0' }}>
          {book.tags.map(t => (
            <button
              key={t}
              onClick={() => onTagClick(t, false)}
              onContextMenu={e => {
                e.preventDefault();
                onTagClick(t, true);
              }}
              style={{
                background: '#2A283E',
                color: '#E6E6FA',
                border: '1px solid #4E4A6E',
                borderRadius: '8px',
                padding: '2px 6px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
              title="Click to +include, Right-click to -exclude"
            >
              #{t}
            </button>
          ))}

          {book.warnings?.map(w => (
            <button
              key={w}
              onClick={() => onTagClick(w, false)}
              onContextMenu={e => {
                e.preventDefault();
                onTagClick(w, true);
              }}
              style={{
                background: '#3E1E28',
                color: '#FFB6C1',
                border: '1px solid #8B0000',
                borderRadius: '8px',
                padding: '2px 6px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
              title="Content Warning: Click to +include, Right-click to -exclude"
            >
              ⚠️ {w}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '8px',
          paddingTop: '6px',
          borderTop: '1px solid #2E1A47'
        }}
      >
        <span style={{ fontSize: '10px', color: '#8882A5' }}>
          {book.page_count ? `${book.page_count} pgs` : book.word_count ? `${book.word_count} words` : 'EPUB'}
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => onOpenMoreInfo(book)}
            style={{
              background: '#2E1A47',
              color: '#FFFBEB',
              border: '1px solid #7B68EE',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            More Info
          </button>
          <button
            onClick={() => onReadBook(book)}
            style={{
              background: '#4B0082',
              color: '#FFFBEB',
              border: '1px solid #9370DB',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Read
          </button>
        </div>
      </div>
    </div>
  );
};
