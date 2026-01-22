import React, { useState, useEffect } from 'react';
import { IxTypography, IxButton } from '@siemens/ix-react';
import { api } from '../../services/api';

export default function ControlSidebar({ selectedProblem, selectedNodeId, treeModel, onRefreshTree, onUpdateProblem }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [newWhy, setNewWhy] = useState(localStorage.getItem('sticky_why') || '');
    const [actionDescription, setActionDescription] = useState('');

    // Sync the action description whenever the selection changes
    useEffect(() => {
        const currentNode = treeModel[selectedNodeId];
        setActionDescription(currentNode?.data?.action || '');
    }, [selectedNodeId, treeModel]);

    const currentNode = treeModel[selectedNodeId];
    const isRootNode = selectedNodeId === 'root';
    const hasChildren = currentNode?.children?.length > 0;
    const isAlreadyRootCause = currentNode?.data?.is_root_cause === 1;
    const isCaseClosed = selectedProblem?.state === 2;

    const handleAddWhy = async () => {
        setIsProcessing(true);
        await api.addCause({
            problem_id: selectedProblem.problem_id,
            parent_id: isRootNode ? null : selectedNodeId,
            description: newWhy
        });
        setNewWhy('');
        localStorage.removeItem('sticky_why');
        onRefreshTree();
        setIsProcessing(false);
    };

    const handleMarkRoot = async () => {
        setIsProcessing(true);
        try {
            const res = await api.markRootCause({
                problem_id: selectedProblem.problem_id,
                cause_id: selectedNodeId,
                action: actionDescription
            });

            if (res.status === 'success') {
                // 1. Tell the parent (App.jsx) the case is now closed
                onUpdateProblem(2);

                // 2. IMPORTANT: Wait for the new data to arrive from the server
                // This updates the treeModel and treeData states in TreeView.jsx
                await onRefreshTree();

                console.log("Tree refreshed with new root cause status");
            }
        } catch (err) {
            console.error("Failed to update root cause:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ height: '100%', background: '#1a1a1a', padding: '24px', border: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
            <IxTypography variant="h3" style={{ color: '#00ccbb', marginBottom: '20px' }}>
                {isCaseClosed ? 'Investigation Finalized' : 'Investigation Active'}
            </IxTypography>

            {/* SECTION 1: ADD WHY (Only if open and not already a root cause) */}
            {!isCaseClosed && !isAlreadyRootCause && (
                <div style={{ marginBottom: '30px' }}>
                    <IxTypography variant="label-small" style={{ color: '#888' }}>ADD ANALYSIS STEP</IxTypography>
                    <textarea
                        style={{ width: '100%', background: '#000', color: '#fff', padding: '10px', marginTop: '8px', border: '1px solid #444' }}
                        value={newWhy}
                        onChange={e => setNewWhy(e.target.value)}
                        placeholder="Why did this happen?"
                    />
                    <IxButton style={{ width: '100%', marginTop: '10px' }} onClick={handleAddWhy} disabled={isProcessing || !newWhy.trim()}>
                        ADD WHY
                    </IxButton>
                </div>
            )}

            {/* SECTION 2: ROOT CAUSE ACTION */}
            {!isRootNode && (
                <div style={{ borderTop: '1px solid #333', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <IxTypography variant="h4" style={{ color: isAlreadyRootCause ? '#00ccbb' : '#ff4444' }}>
                            {isAlreadyRootCause ? 'Root Cause Action' : 'Potential Root Cause'}
                        </IxTypography>
                        {isAlreadyRootCause && <span style={{ color: '#00ccbb', fontSize: '10px', border: '1px solid #00ccbb', padding: '2px 5px' }}>ACTIVE</span>}
                    </div>

                    {/* Disable Action input if node has children (unless it's already the root cause) */}
                    {hasChildren && !isAlreadyRootCause ? (
                        <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: '#888', fontSize: '13px' }}>
                            This node cannot be a root cause because it has further "Why" steps below it.
                        </div>
                    ) : (
                        <>
                            <textarea
                                style={{ width: '100%', height: '120px', background: '#000', color: '#fff', padding: '10px', border: isAlreadyRootCause ? '1px solid #00ccbb' : '1px solid #444' }}
                                value={actionDescription}
                                onChange={e => setActionDescription(e.target.value)}
                                placeholder="Define the corrective action..."
                            />
                            <IxButton
                                variant={isAlreadyRootCause ? 'secondary' : 'primary'}
                                style={{ width: '100%', marginTop: '10px' }}
                                onClick={handleMarkRoot}
                                disabled={isProcessing || !actionDescription.trim()}
                            >
                                {isAlreadyRootCause ? 'UPDATE ACTION' : 'MARK AS ROOT & CLOSE'}
                            </IxButton>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}