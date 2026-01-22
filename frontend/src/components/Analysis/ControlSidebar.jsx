import React, { useState, useEffect } from 'react';
import { IxTypography, IxButton } from '@siemens/ix-react';
import { api } from '../../services/api';

export default function ControlSidebar({ selectedProblem, selectedNodeId, treeModel, onRefreshTree, onUpdateProblem }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [newWhy, setNewWhy] = useState(localStorage.getItem('sticky_why') || '');
    const [actionDescription, setActionDescription] = useState('');

    // Seçim değiştiğinde aksiyon açıklamasını senkronize et
    useEffect(() => {
        const currentNode = treeModel[selectedNodeId];
        // Backend'den 'action_description' olarak geliyor
        setActionDescription(currentNode?.data?.action_description || '');
    }, [selectedNodeId, treeModel]);

    const currentNode = treeModel[selectedNodeId];
    const isRootNode = selectedNodeId === 'root';
    const hasChildren = currentNode?.children?.length > 0;
    const isAlreadyRootCause = currentNode?.data?.is_root_cause === 1;
    const isCaseClosed = selectedProblem?.state === 2;

    const handleAddWhy = async () => {
        setIsProcessing(true);
        try {
            await api.addCause({
                problem_id: selectedProblem.problem_id,
                parent_id: isRootNode ? null : selectedNodeId,
                description: newWhy
            });
            setNewWhy('');
            localStorage.removeItem('sticky_why');
            await onRefreshTree();
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMarkRoot = async () => {
        setIsProcessing(true);
        try {
            const res = await api.markRootCause({
                problem_id: selectedProblem.problem_id,
                cause_id: selectedNodeId,
                // PAYLOAD DÜZELTMESİ: backend 'action_description' bekliyor
                action_description: actionDescription
            });

            if (res.status === 'success') {
                onUpdateProblem(2); // Case closed
                await onRefreshTree();
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

            {/* Yeni Analiz Adımı Ekleme */}
            {!isCaseClosed && !isAlreadyRootCause && (
                <div style={{ marginBottom: '30px' }}>
                    <IxTypography variant="label-small" style={{ color: '#888' }}>ADD ANALYSIS STEP</IxTypography>
                    <textarea
                        style={{ width: '100%', background: '#000', color: '#fff', padding: '10px', marginTop: '8px', border: '1px solid #444', borderRadius: '4px' }}
                        value={newWhy}
                        onChange={(e) => setNewWhy(e.target.value)}
                        placeholder="Why did this happen?"
                    />
                    <IxButton
                        style={{ width: '100%', marginTop: '10px' }}
                        onClick={handleAddWhy}
                        disabled={isProcessing || !newWhy.trim()}
                    >
                        ADD WHY
                    </IxButton>
                </div>
            )}

            {/* Kök Neden Belirleme */}
            {!isRootNode && (
                <div style={{ borderTop: '1px solid #333', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <IxTypography variant="h4" style={{ color: isAlreadyRootCause ? '#00ccbb' : '#ff4444' }}>
                            {isAlreadyRootCause ? 'Root Cause Action' : 'Potential Root Cause'}
                        </IxTypography>
                        {isAlreadyRootCause && <span style={{ color: '#00ccbb', fontSize: '10px', border: '1px solid #00ccbb', padding: '2px 5px', borderRadius: '2px' }}>ACTIVE</span>}
                    </div>

                    {hasChildren && !isAlreadyRootCause ? (
                        <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: '#888', fontSize: '13px' }}>
                            This node cannot be a root cause because it has further "Why" steps below it.
                        </div>
                    ) : (
                        <>
                            <textarea
                                style={{ width: '100%', height: '120px', background: '#000', color: '#fff', padding: '10px', border: isAlreadyRootCause ? '1px solid #00ccbb' : '1px solid #444', borderRadius: '4px' }}
                                value={actionDescription}
                                onChange={(e) => setActionDescription(e.target.value)}
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