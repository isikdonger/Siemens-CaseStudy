import React, { useState, useEffect } from 'react';
import { IxTypography, IxButton } from '@siemens/ix-react';
import { api } from '../../services/api';

export default function ControlSidebar({ selectedProblem, selectedNodeId, treeModel, onRefreshTree, onUpdateProblem }) {
    // Define the exact variable name used in your JSX
    const [isProcessing, setIsProcessing] = useState(false);

    // Sticky logic: Initialize state from localStorage or default to empty
    const [newWhy, setNewWhy] = useState(localStorage.getItem('sticky_why') || '');
    const [actionDescription, setActionDescription] = useState(localStorage.getItem('sticky_action') || '');

    // Save inputs to localStorage as the user types
    useEffect(() => {
        localStorage.setItem('sticky_why', newWhy);
    }, [newWhy]);

    useEffect(() => {
        localStorage.setItem('sticky_action', actionDescription);
    }, [actionDescription]);

    const isActive = selectedProblem?.state === 1;

    const handleAddWhy = async () => {
        setIsProcessing(true); // Matches the variable name in your buttons
        try {
            await api.addCause({
                problem_id: selectedProblem.problem_id,
                parent_id: selectedNodeId === 'root' ? null : selectedNodeId,
                description: newWhy.trim()
            });
            setNewWhy('');
            localStorage.removeItem('sticky_why'); // Clear after success
            onRefreshTree();
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMarkRoot = async () => {
        setIsProcessing(true);
        try {
            await api.markRootCause({
                problem_id: selectedProblem.problem_id,
                cause_id: selectedNodeId,
                action: actionDescription.trim()
            });
            setActionDescription('');
            localStorage.removeItem('sticky_action'); // Clear after success
            onUpdateProblem(2);
            onRefreshTree();
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isActive) return (
        <div style={{ flex: 1, background: '#1a1a1a', padding: '24px', borderRadius: '4px', textAlign: 'center' }}>
            <IxTypography variant="h3" style={{ color: '#ff4444' }}>Locked</IxTypography>
            <p style={{ color: '#888' }}>Investigation is finalized.</p>
        </div>
    );

    return (
        <div style={{ flex: 1, background: '#1a1a1a', padding: '24px', borderRadius: '4px' }}>
            <IxTypography variant="h3" style={{ color: '#00ccbb' }}>Add Analysis</IxTypography>
            <div style={{ margin: '15px 0', padding: '12px', background: '#222', borderLeft: '4px solid #00ccbb' }}>
                <small>Targeting: <b>{selectedNodeId === 'root' ? selectedProblem?.title : treeModel[selectedNodeId]?.data?.name}</b></small>
            </div>

            <textarea
                name="new-why-input"
                style={{ width: '100%', height: '80px', background: '#000', color: '#fff', padding: '10px' }}
                value={newWhy}
                onChange={e => setNewWhy(e.target.value)}
            />
            {/* Using isProcessing exactly as your console error expected */}
            <IxButton style={{ width: '100%', marginTop: '10px' }} onClick={handleAddWhy} disabled={isProcessing || !newWhy.trim()}>
                {isProcessing ? 'Adding...' : 'Add "Why?"'}
            </IxButton>

            {selectedNodeId !== 'root' && (
                <div style={{ marginTop: '40px', borderTop: '1px solid #333', paddingTop: '20px' }}>
                    <IxTypography variant="h4" style={{ color: '#ff4444' }}>Finalize Root Cause</IxTypography>
                    <textarea
                        name="action-input"
                        style={{ width: '100%', height: '80px', background: '#000', color: '#fff', marginTop: '10px' }}
                        value={actionDescription}
                        onChange={e => setActionDescription(e.target.value)}
                    />
                    <IxButton variant="primary" style={{ width: '100%', marginTop: '10px' }} onClick={handleMarkRoot} disabled={isProcessing || !actionDescription.trim()}>
                        {isProcessing ? 'Processing...' : 'Mark & Close'}
                    </IxButton>
                </div>
            )}
        </div>
    );
}