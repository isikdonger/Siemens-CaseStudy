import React from 'react';
import { IxTypography, IxButton } from '@siemens/ix-react';
import CauseListItem from './CauseListItem';

export default function TreeView({
                                     treeModel,
                                     selectedProblem,
                                     selectedNodeId,
                                     expandedNodes,
                                     onNodeClick,
                                     onToggleExpand,
                                     onReopen
                                 }) {
    const isClosed = selectedProblem?.state === 2;

    return (
        <div style={{ flex: 2, background: '#111', border: '1px solid #333', borderRadius: '4px', overflow: 'auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <IxTypography variant="h3" style={{ color: '#00ccbb' }}>Causation Hierarchy</IxTypography>
                {isClosed && (
                    <IxButton variant="secondary" onClick={onReopen}>
                        🔓 Re-open Investigation
                    </IxButton>
                )}
            </div>

            {treeModel.root ? (
                <CauseListItem
                    node={treeModel.root}
                    nodeId="root"
                    treeModel={treeModel}
                    selectedNodeId={selectedNodeId}
                    expandedNodes={expandedNodes}
                    onNodeClick={onNodeClick}
                    onToggleExpand={onToggleExpand}
                />
            ) : (
                <p style={{ color: '#888' }}>Loading hierarchy...</p>
            )}
        </div>
    );
}