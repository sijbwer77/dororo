'use client';

import { useState, useEffect } from 'react';
import styles from '../team.module.css';
import { apiFetch, ensureCsrfCookie } from '@/lib/api';

function BlockRow({
  block,
  index,
  totalCount,
  onChange,
  onDelete,
  onEnterNew,
  onOpenPage,
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(block.content || '');
  const [inner, setInner] = useState(block.toggle_inner || '');

  useEffect(() => {
    setTitle(block.content || '');
  }, [block.content]);

  useEffect(() => {
    setInner(block.toggle_inner || '');
  }, [block.toggle_inner]);

  const isOnlyBlock = totalCount === 1;

  const handleTitleBlur = () => {
    if (title !== (block.content || '')) {
      onChange(block.id, { content: title });
    }
  };

  const handleInnerBlur = () => {
    if (inner !== (block.toggle_inner || '')) {
      onChange(block.id, { toggle_inner: inner });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnterNew(index);
    }

    if (
      e.key === 'Backspace' &&
      title === '' &&
      e.currentTarget.selectionStart === 0
    ) {
      if (!isOnlyBlock) {
        e.preventDefault();
        onDelete(block.id);
      }
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    if (newType !== block.block_type) {
      onChange(block.id, { block_type: newType });
    }
  };

  if (block.block_type === 'divider') {
    return (
      <div className={styles.blockRow}>
        <span className={styles.blockGrip}>:::</span>
        <hr className={styles.blockDivider} />
        <select
          className={styles.blockTypeSelect}
          value="divider"
          onChange={handleTypeChange}
        >
          <option value="text">text</option>
          <option value="page">page</option>
          <option value="toggle">toggle</option>
          <option value="divider">divider</option>
        </select>
      </div>
    );
  }

  if (block.block_type === 'page') {
    return (
      <div className={styles.blockRow}>
        <span className={styles.blockGrip}>:::</span>

        <button
          type="button"
          className={styles.pageBlockButton}
          onClick={() => onOpenPage(block.id)}
        >
          {title || '(제목 없음)'}
        </button>

        <select
          className={styles.blockTypeSelect}
          value="page"
          onChange={handleTypeChange}
        >
          <option value="text">text</option>
          <option value="page">page</option>
          <option value="toggle">toggle</option>
          <option value="divider">divider</option>
        </select>
      </div>
    );
  }

  const isToggle = block.block_type === 'toggle';
  const isFile = block.block_type === 'file';

  return (
    <>
      <div className={styles.blockRow}>
        <span className={styles.blockGrip}>:::</span>

        {isFile && <span className={styles.blockIcon}>📄</span>}

        {isToggle && (
          <button
            type="button"
            className={styles.toggleArrow}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'v' : '>'}
          </button>
        )}

        <input
          className={styles.blockInput}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          placeholder={isToggle ? '토글 제목' : ''}
        />

        <select
          className={styles.blockTypeSelect}
          value={block.block_type}
          onChange={handleTypeChange}
        >
          <option value="text">text</option>
          <option value="page">page</option>
          <option value="toggle">toggle</option>
          <option value="divider">divider</option>
        </select>
      </div>

      {isToggle && open && (
        <div className={styles.toggleInnerWrapper}>
          <textarea
            className={styles.toggleInnerTextarea}
            value={inner}
            onChange={(e) => setInner(e.target.value)}
            onBlur={handleInnerBlur}
            placeholder="토글 안쪽 내용 (멀티라인/엔터 가능)"
          />
        </div>
      )}
    </>
  );
}

/**
 * Notion 스타일 페이지 + 블록 리스트
 */
export default function FolderTree({ courseId, groupId }) {
  const [parent, setParent] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parentTitle, setParentTitle] = useState('');

  useEffect(() => {
    ensureCsrfCookie().catch((err) =>
      console.error('ensureCsrfCookie failed', err)
    );
  }, []);

  const loadNode = async (parentId) => {
    if (!groupId) return;

    setLoading(true);
    try {
      const path = parentId
        ? `/api/group/${groupId}/documents/?parent_id=${parentId}`
        : `/api/group/${groupId}/documents/`;

      const data = await apiFetch(path, { method: 'GET' });
      setParent(data.parent);
      setParentTitle(data.parent?.content || '');
      setChildren(data.children || []);
    } catch (err) {
      console.error('loadNode error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!groupId) return;
    loadNode(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const handleGoUp = () => {
    if (!parent || !parent.parent_id) return;
    loadNode(parent.parent_id);
  };

  const handleUpdateChild = async (id, patch) => {
    setChildren((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));

    try {
      await apiFetch(`/api/group/documents/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
    } catch (err) {
      console.error('update block error', err);
      if (parent) loadNode(parent.id);
    }
  };

  const handleDeleteChild = async (id) => {
    if (!parent) return;
    if (children.length <= 1) {
      // 마지막 블록이면 삭제 금지
      return;
    }

    setChildren((prev) => prev.filter((b) => b.id !== id));

    try {
      await apiFetch(`/api/group/documents/${id}/`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('delete block error', err);
      loadNode(parent.id);
    }
  };

  const createBlockAt = async (insertIndex) => {
    if (!groupId || !parent) return null;

    const created = await apiFetch(`/api/group/${groupId}/documents/`, {
      method: 'POST',
      body: JSON.stringify({
        parent_id: parent.id,
        block_type: 'text',
        content: '',
        toggle_inner: '',
      }),
    });

    const currentLength = children.length;
    const safeIndex = Math.max(0, Math.min(insertIndex, currentLength));

    setChildren((prev) => {
      const copy = [...prev];
      copy.splice(safeIndex, 0, created);
      return copy;
    });

    // 생성 직후, 중간에 삽입한 경우 백엔드 order_index 재정렬
    if (safeIndex < currentLength) {
      try {
        await apiFetch(`/api/group/documents/${created.id}/`, {
          method: 'PATCH',
          body: JSON.stringify({ order_index: safeIndex + 1 }),
        });
      } catch (err) {
        console.error('reorder after create error', err);
        if (parent) loadNode(parent.id);
      }
    }

    return created;
  };

  const handleAddBlockAfter = async (index) => {
    if (!groupId || !parent) return;

    try {
      await createBlockAt(index + 1);
    } catch (err) {
      console.error('create block error', err);
    }
  };

  const handleAddBlockAtEnd = async () => {
    if (!groupId || !parent) return;
    try {
      await createBlockAt(children.length);
    } catch (err) {
      console.error('create block at end error', err);
    }
  };

  const handleParentTitleBlur = async () => {
    if (!parent) return;
    if (parentTitle === (parent.content || '')) return;

    setParent((prev) => (prev ? { ...prev, content: parentTitle } : prev));

    try {
      await apiFetch(`/api/group/documents/${parent.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ content: parentTitle }),
      });
    } catch (err) {
      console.error('update parent error', err);
    }
  };

  return (
    <div className={styles.folderTreeWrapper}>
      {loading && !parent && <div>페이지를 불러오는 중...</div>}

      {parent && (
        <>
          <div className={styles.folderTreeHeader}>
            {parent.parent_id && (
              <button
                type="button"
                className={styles.upButton}
                onClick={handleGoUp}
              >
                상위 페이지
              </button>
            )}

            <input
              className={styles.pageTitleInput}
              type="text"
              value={parentTitle}
              onChange={(e) => setParentTitle(e.target.value)}
              onBlur={handleParentTitleBlur}
              placeholder="page 제목 (content)"
            />
          </div>

          <div className={styles.blockListScroll}>
            <div className={styles.subListContainer}>
              {children.length === 0 && (
                <div
                  className={styles.emptyMessage}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBlockAtEnd();
                    }
                  }}
                >
                  아직 블록이 없습니다. 엔터로 새 블록을 만들어 보세요.
                  <div>
                    <button
                      type="button"
                      className={styles.addBlockButton}
                      onClick={handleAddBlockAtEnd}
                    >
                      새 블록 추가
                    </button>
                  </div>
                </div>
              )}

            {children.map((child, idx) => (
              <BlockRow
                key={child.id}
                block={child}
                index={idx}
                totalCount={children.length}
                onChange={handleUpdateChild}
                onDelete={handleDeleteChild}
                onEnterNew={handleAddBlockAfter}
                onOpenPage={(id) => loadNode(id)}
              />
            ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
