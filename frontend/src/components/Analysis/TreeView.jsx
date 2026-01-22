import React, { useState, useEffect } from 'react';
import { IxButton, IxTypography } from '@siemens/ix-react';
import { api } from '../../services/api';
import ControlSidebar from './ControlSidebar';

export default function TreeView({ selectedProblem, onBack, setSelectedProblem }) {
    const [selectedNodeId, setSelectedNodeId] = useState(
        localStorage.getItem('rca_selected_node') || 'root'
    );
    const [treeData, setTreeData] = useState([]);
    const [treeModel, setTreeModel] = useState({});

    // NEW: State to track which nodes are expanded
    const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));

    useEffect(() => {
        localStorage.setItem('rca_selected_node', selectedNodeId);
    }, [selectedNodeId]);

    const loadTree = async () => {
        if (!selectedProblem) return;
        try {
            const data = await api.fetchTree(selectedProblem.problem_id);
            setTreeData(data.tree || []);
            setTreeModel(data.model || {});
        } catch (err) {
            console.error('Failed to load tree:', err);
        }
    };

    useEffect(() => { loadTree(); }, [selectedProblem]);

    // NEW: Toggle function for expansion
    const toggleExpand = (e, nodeId) => {
        e.stopPropagation(); // Don't select the node when just toggling
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) next.delete(nodeId);
            else next.add(nodeId);
            return next;
        });
    };

    const renderNode = (node, level = 0) => {
        const isSelected = selectedNodeId === node.id;
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const childCount = node.children?.length || 0;
        const isRootCause = node.data?.is_root_cause === 1;

        return (
            <div key={node.id} style={{ marginLeft: level > 0 ? '24px' : '0' }}>
                <div
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{
                        marginTop: '8px',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(0, 204, 187, 0.1)' : '#1a1a1a',
                        border: isSelected ? '1px solid #00ccbb' : '1px solid #333',
                        borderLeft: isRootCause ? '6px solid #ff4444' : (node.id === 'root' ? '6px solid #666' : '6px solid #00ccbb'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Expand/Collapse Toggle */}
                        {hasChildren && (
                            <div
                                onClick={(e) => toggleExpand(e, node.id)}
                                style={{
                                    color: '#00ccbb',
                                    fontWeight: 'bold',
                                    width: '20px',
                                    fontSize: '18px',
                                    userSelect: 'none'
                                }}
                            >
                                {isExpanded ? '−' : '+'}
                            </div>
                        )}

                        <div>
                            <IxTypography variant="label-small" style={{ color: '#888', display: 'block' }}>
                                {node.id === 'root' ? 'PROBLEM' : `WHY STEP ${level}`}
                            </IxTypography>
                            <IxTypography variant="body" style={{ color: isSelected ? '#fff' : '#ebebeb' }}>
                                {node.data?.name}
                            </IxTypography>
                        </div>
                    </div>

                    {/* Child Counter Badge */}
                    {hasChildren && (
                        <div style={{
                            background: '#333',
                            color: '#00ccbb',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                        }}>
                            {childCount} {childCount === 1 ? 'WHY' : 'WHYS'}
                        </div>
                    )}
                </div>

                {/* Render Children only if expanded */}
                {hasChildren && isExpanded && (
                    <div style={{ borderLeft: '1px dashed #444' }}>
                        {node.children.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', boxSizing: 'border-box' }}>

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 20px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', marginBottom: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <IxButton ghost onClick={onBack}>DASHBOARD</IxButton>
                    <div style={{ width: '1px', height: '24px', background: '#444' }} />
                    <div>
                        <IxTypography variant="label-small" style={{ color: '#888' }}>ACTIVE CASE</IxTypography>
                        <IxTypography variant="h3" style={{ color: '#00ccbb' }}>{selectedProblem?.title}</IxTypography>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <IxTypography variant="label-small" style={{ color: '#888' }}>STATUS</IxTypography>
                    <div style={{ color: selectedProblem?.state === 1 ? '#00ccbb' : '#ff4444', fontWeight: 'bold' }}>
                        {selectedProblem?.state === 1 ? '● INVESTIGATION OPEN' : '● CASE CLOSED'}
                    </div>
                </div>
            </div>

            {/* Main Content with equalized heights */}
            <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0, alignItems: 'stretch' }}>
                <div style={{
                    flex: 1, background: '#0d0d0d', padding: '24px', overflow: 'auto',
                    border: '1px solid #333', borderRadius: '4px'
                }}>
                    <IxTypography variant="h4" style={{ marginBottom: '16px', color: '#999' }}>Investigation Path</IxTypography>
                    {treeData.map(node => renderNode(node))}
                </div>

                <div style={{ width: '420px', height: '100%' }}>
                    <ControlSidebar
                        selectedProblem={selectedProblem}
                        selectedNodeId={selectedNodeId}
                        treeModel={treeModel}
                        onRefreshTree={loadTree}
                        onUpdateProblem={(newState) => setSelectedProblem({ ...selectedProblem, state: newState })}
                    />
                </div>
            </div>
        </div>
    );
}