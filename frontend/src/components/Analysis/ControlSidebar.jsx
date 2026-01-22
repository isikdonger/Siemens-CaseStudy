import React from 'react';
import { IxTypography, IxButton } from '@siemens/ix-react';

export default function ControlSidebar({
                                           selectedProblem,
                                           selectedNodeId,
                                           treeModel,
                                           newWhy,
                                           setNewWhy,
                                           onAddWhy,
                                           actionDescription,
                                           setActionDescription,
                                           onMarkRoot
                                       }) {
    const isActive = selectedProblem?.state === 1;

    if (!isActive) {
        return (
            <div style={{ flex: 1, background: '#1a1a1a', padding: '24px', border: '1px solid #333', borderRadius: '4px', textAlign: 'center' }}>
                <IxTypography variant="h3" style={{ color: '#ff4444' }}>Locked</IxTypography>
                <p style={{ color: '#888', marginTop: '15px' }}>The investigation is finalized. Re-open to modify.</p>
            </div>
        );
    }

    return (
        <div style={{ flex: 1, background: '#1a1a1a', padding: '24px', border: '1px solid #333', borderRadius: '4px' }}>
            <IxTypography variant="h3" style={{ color: '#00ccbb' }}>Add Analysis</IxTypography>

            <div style={{ margin: '15px 0', padding: '12px', background: '#222', borderLeft: '4px solid #00ccbb' }}>
                <IxTypography variant="label-small">Targeting:</IxTypography>
                <div style={{ fontWeight: 'bold', color: '#fff' }}>
                    {selectedNodeId === 'root' ? selectedProblem?.title : treeModel[selectedNodeId]?.data?.name}
                </div>
            </div>

            <textarea
                style={{ width: '100%', height: '100px', background: '#000', border: '1px solid #444', color: '#fff', padding: '10px', outline: 'none' }}
                value={newWhy}
                onChange={e => setNewWhy(e.target.value)}
                placeholder="Enter why this happened..."
            />
            <IxButton
                disabled={newWhy.trim().length < 3 || isProcessing}
                onClick={onAddWhy}
            >
                Add "Why?"
            </IxButton>

            {selectedNodeId !== 'root' && (
                <div style={{ marginTop: '40px', borderTop: '1px solid #333', paddingTop: '20px' }}>
                    <IxTypography variant="h4" style={{ color: '#ff4444' }}>Finalize Root Cause</IxTypography>
                    <textarea
                        style={{ width: '100%', height: '100px', background: '#000', border: '1px solid #ff4444', color: '#fff', marginTop: '12px', padding: '10px', outline: 'none' }}
                        placeholder="Kalıcı Çözüm..."
                        value={actionDescription}
                        onChange={e => setActionDescription(e.target.value)}
                    />
                    <IxButton variant="primary" style={{ width: '100%', marginTop: '12px' }} onClick={onMarkRoot} disabled={!actionDescription.trim()}>
                        Mark & Close
                    </IxButton>
                </div>
            )}
        </div>
    );
}