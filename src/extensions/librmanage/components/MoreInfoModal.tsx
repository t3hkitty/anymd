import React, { useState } from 'react';
import { BookMetadataYaml } from '../../../types/kittlibr-ext';

interface MoreInfoModalProps {
  book: BookMetadataYaml | null;
  onClose: () => void;
  onSave: (updated: BookMetadataYaml) => Promise<void>;
}

export const MoreInfoModal: React.FC<MoreInfoModalProps> = ({ book, onClose, onSave }) => {
  if (!book) return null;

  const [formData, setFormData] = useState<BookMetadataYaml>({ ...book });
  const [tagsInput, setTagsInput] = useState<string>(book.tags.join(', '));
  const [warningsInput, setWarningsInput] = useState<string>((book.warnings || []).join(', '));
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async () => {
    setSaving(true);
    const updated: BookMetadataYaml = {
      ...formData,
      tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean),
      warnings: warningsInput.split(',').map(s => s.trim()).filter(Boolean)
    };
    await onSave(updated);
    setSaving(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          background: '#1E1E2E',
          color: '#E6E6FA',
          width: '560px',
          maxHeight: '90vh',
          borderRadius: '16px',
          border: '2px solid #2E1A47',
          padding: '20px',
          boxShadow: '6px 6px 0px #000',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#FFFBEB', fontSize: '18px' }}>
            📖 Metadata Inspector & YAML Editor
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFBEB',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ fontSize: '11px', color: '#B5B0D0' }}>
          <strong>Zettelkasten ID:</strong> {book.zettelkasten_id ?? 'None'} •{' '}
          <strong>Path:</strong> {book.relative_path}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '8px',
                background: '#2B2B3D',
                border: '1px solid #4E4E6A',
                color: '#FFFBEB'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Author</label>
            <input
              type="text"
              value={formData.author}
              onChange={e => setFormData({ ...formData, author: e.target.value })}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '8px',
                background: '#2B2B3D',
                border: '1px solid #4E4E6A',
                color: '#FFFBEB'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Series</label>
            <input
              type="text"
              value={formData.series || ''}
              onChange={e => setFormData({ ...formData, series: e.target.value })}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '8px',
                background: '#2B2B3D',
                border: '1px solid #4E4E6A',
                color: '#FFFBEB'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Index #</label>
            <input
              type="number"
              value={formData.series_index ?? 1}
              onChange={e => setFormData({ ...formData, series_index: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '8px',
                background: '#2B2B3D',
                border: '1px solid #4E4E6A',
                color: '#FFFBEB'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Tags (comma-separated)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              borderRadius: '8px',
              background: '#2B2B3D',
              border: '1px solid #4E4E6A',
              color: '#FFFBEB'
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#FFB6C1' }}>
            ⚠️ Content Warnings (comma-separated)
          </label>
          <input
            type="text"
            value={warningsInput}
            onChange={e => setWarningsInput(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              borderRadius: '8px',
              background: '#2B2B3D',
              border: '1px solid #8B0000',
              color: '#FFFBEB'
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Synopsis / Notes (Markdown)</label>
          <textarea
            rows={4}
            value={formData.synopsis || ''}
            onChange={e => setFormData({ ...formData, synopsis: e.target.value })}
            style={{
              width: '100%',
              padding: '6px',
              borderRadius: '8px',
              background: '#2B2B3D',
              border: '1px solid #4E4E6A',
              color: '#FFFBEB',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
          <button
            onClick={onClose}
            style={{
              background: '#2B2B3D',
              color: '#E6E6FA',
              border: '1px solid #4E4E6A',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: '#2E1A47',
              color: '#FFFBEB',
              border: '1px solid #7B68EE',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {saving ? 'Saving...' : 'Atomic Save to YAML'}
          </button>
        </div>
      </div>
    </div>
  );
};
