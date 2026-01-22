import React, { useState, useEffect } from 'react';
import { IxButton, IxTypography } from '@siemens/ix-react';
import { api } from '../../services/api';
import ControlSidebar from './ControlSidebar';

export default function TreeView({ selectedProblem, onBack, setSelectedProblem }) {
    const [selectedNodeId, setSelectedNodeId] = useState(localStorage.getItem('rca_selected_node') || 'root');
    const [treeData, setTreeData] = useState([]);
    const [treeModel, setTreeModel] = useState({});
    const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));

    const handleReopen = async () => {
        try {
            const res = await api.updateProblemState(selectedProblem.problem_id, 1);

            // Backend başarılı olduğunda genellikle güncellenen objeyi veya {problem_id: ...} döner
            if (res) {
                setSelectedProblem({ ...selectedProblem, state: 1 });
                // Vaka açıldığında ağacı yenilemek, root cause işaretlerini temizlemek için önemlidir
                await loadTree();
            }
        } catch (err) {
            console.error("Reopen failed:", err);
        }
    };

    const loadTree = async (newParentId = null) => {
        if (!selectedProblem) return;
        try {
            const res = await api.fetchTree(selectedProblem.problem_id);
            setTreeData(res?.tree || []);
            setTreeModel(res?.model || {});

            if (newParentId) {
                setExpandedNodes(prev => {
                    const next = new Set(prev);
                    next.add(newParentId);
                    return next;
                });
            }
        } catch (err) {
            console.error("Load tree failed:", err);
        }
    };

    useEffect(() => { loadTree(); }, [selectedProblem]);

    const renderNode = (node, level = 0) => {
        const isSelected = selectedNodeId === node.id;
        const isExpanded = expandedNodes.has(node.id);
        const isRootCause = node.data?.is_root_cause === 1;

        return (
            <div key={node.id} style={{ marginLeft: level > 0 ? '24px' : '0' }}>
                <div onClick={() => setSelectedNodeId(node.id)}
                     style={{
                         marginTop: '12px',
                         padding: '16px',
                         cursor: 'pointer',
                         position: 'relative',

                         // Background logic: Root cause gets a subtle red tint, selection gets a teal tint
                         background: isRootCause
                             ? 'rgba(255, 68, 68, 0.08)'
                             : (isSelected ? 'rgba(0, 204, 187, 0.12)' : '#1a1a1a'),

                         // Border logic: Selection uses a full border, others use a subtle one
                         border: isSelected ? '1px solid #00ccbb' : '1px solid #333',

                         // Status Bar: The thick indicator on the left
                         borderLeft: isRootCause
                             ? '8px solid #ff4444'
                             : (node.id === 'root' ? '6px solid #666' : '6px solid #00ccbb'),

                         // Elevation: Pop the selected node out slightly
                         transform: isSelected ? 'translateX(4px)' : 'none',
                         transition: 'all 0.2s ease',

                         display: 'flex',
                         justifyContent: 'space-between',
                         alignItems: 'center'
                     }}>
                    <div>
                        <IxTypography variant="label-small" style={{ color: '#888' }}>{node.id === 'root' ? 'PROBLEM' : `WHY ${level}`}</IxTypography>
                        <IxTypography variant="body" style={{ color: '#ebebeb' }}>{node.data?.name}</IxTypography>
                    </div>
                    {node.children?.length > 0 && (
                        <div onClick={(e) => { e.stopPropagation(); setExpandedNodes(prev => {
                            const n = new Set(prev); n.has(node.id) ? n.delete(node.id) : n.add(node.id); return n;
                        })}} style={{ color: '#00ccbb', cursor: 'pointer' }}>{isExpanded ? '−' : '+'}</div>
                    )}
                </div>
                {isExpanded && node.children?.map(child => renderNode(child, level + 1))}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#1a1a1a', border: '1px solid #333', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <IxButton ghost onClick={onBack}>DASHBOARD</IxButton>
                    <IxTypography variant="h3" style={{ color: '#00ccbb' }}>{selectedProblem?.title}</IxTypography>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {selectedProblem?.state !== 1 && <IxButton outline onClick={handleReopen}>RE-OPEN CASE</IxButton>}
                    <div style={{ color: selectedProblem?.state === 1 ? '#00ccbb' : '#ff4444', fontWeight: 'bold' }}>
                        {selectedProblem?.state === 1 ? '● OPEN' : '● CLOSED'}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', flex: 1, alignItems: 'stretch', minHeight: 0 }}>
                <div style={{ flex: 1, background: '#0d0d0d', padding: '20px', overflow: 'auto', border: '1px solid #333' }}>
                    {treeData.map(node => renderNode(node))}
                </div>
                <div style={{ width: '400px' }}>
                    <ControlSidebar
                        selectedProblem={selectedProblem}
                        selectedNodeId={selectedNodeId}
                        treeModel={treeModel}
                        onRefreshTree={() => loadTree(selectedNodeId)}
                        onUpdateProblem={(s) => setSelectedProblem({ ...selectedProblem, state: s })}
                    />
                </div>
            </div>
        </div>
    );
}