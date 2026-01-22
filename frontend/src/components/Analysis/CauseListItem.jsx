import React from "react";

export default function CauseListItem({ node, nodeId, treeModel, selectedNodeId, expandedNodes, onNodeClick, onToggleExpand, level = 0 }) {
    if (!node) return null;

    const isSelected = selectedNodeId === nodeId;
    const isExpanded = expandedNodes[nodeId] !== false;
    const childrenCount = node.children ? node.children.length : 0;
    const hasChildren = childrenCount > 0;
    const isRootCause = node.data?.is_root_cause === 1;

    return (
        <div>
            <div
                onClick={() => onNodeClick(nodeId)}
                style={{
                    padding: '12px 16px',
                    margin: '6px 0',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    background: isRootCause ? 'rgba(255, 0, 0, 0.2)' : isSelected ? 'var(--theme-color-primary)' : 'transparent',
                    color: (isSelected || isRootCause) ? '#fff' : 'var(--theme-color-neutral-10)',
                    borderLeft: isRootCause ? '8px solid #ff0000' : isSelected ? '8px solid var(--theme-color-primary-60)' : '8px solid transparent',
                    paddingLeft: `${16 + (level * 28)}px`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease-in-out',
                }}
            >
                {hasChildren && (
                    <span onClick={(e) => { e.stopPropagation(); onToggleExpand(nodeId); }} style={{ fontSize: '12px', width: '20px' }}>
                        {isExpanded ? '▼' : '▶'}
                    </span>
                )}
                {!hasChildren && <span style={{ width: '20px' }}></span>}

                <span style={{ flex: 1, fontWeight: isRootCause ? '900' : 'normal' }}>
                    {node.data?.name || 'Unknown'}
                    <span style={{ marginLeft: '10px', fontSize: '11px', opacity: 0.7, fontStyle: 'italic' }}>
                        ({childrenCount} Sub Cause{childrenCount !== 1 ? 's' : ''})
                    </span>
                </span>

                {isRootCause && <span style={{ fontSize: '10px', background: '#fff', color: '#ff0000', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>🎯 ROOT CAUSE</span>}
            </div>
            {hasChildren && isExpanded && (
                <div style={{ borderLeft: '1px dashed #444', marginLeft: `${16 + (level * 28) + 10}px` }}>
                    {node.children.map((childId) => (
                        <CauseListItem
                            key={childId}
                            node={treeModel[childId]}
                            nodeId={childId}
                            treeModel={treeModel}
                            selectedNodeId={selectedNodeId}
                            expandedNodes={expandedNodes}
                            onNodeClick={onNodeClick}
                            onToggleExpand={onToggleExpand}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}