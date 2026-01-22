import React, { useState, useEffect } from 'react';
import { IxButton, IxTypography } from '@siemens/ix-react';
import { api } from '../../services/api';
import ControlSidebar from './ControlSidebar';

export default function TreeView({ selectedProblem, onBack, setSelectedProblem }) {
    // 1. Persistence: Remember which node was selected even if refreshed
    const [selectedNodeId, setSelectedNodeId] = useState(
        localStorage.getItem('rca_selected_node') || 'root'
    );
    const [treeData, setTreeData] = useState([]);
    const [treeModel, setTreeModel] = useState({});

    // Sync selection to LocalStorage
    useEffect(() => {
        localStorage.setItem('rca_selected_node', selectedNodeId);
    }, [selectedNodeId]);

    // 2. Fetch Tree Data
    const loadTree = async () => {
        if (!selectedProblem) return;
        try {
            const data = await api.fetchTree(selectedProblem.problem_id);
            // data.tree is the nested array for visuals, data.model is the flat map for logic
            setTreeData(data.tree || []);
            setTreeModel(data.model || {});
        } catch (err) {
            console.error("Failed to load investigation tree:", err);
        }
    };

    useEffect(() => {
        loadTree();
    }, [selectedProblem]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' }}>
            {/* Navigation Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <div>
                    <IxButton ghost onClick={onBack} icon="chevron-left">Back to Dashboard</IxButton>
                    <IxTypography variant="h2" style={{ marginTop: '10px' }}>
                        Investigating: {selectedProblem?.title}
                    </IxTypography>
                </div>
                <div>
          <span style={{
              padding: '4px 12px',
              borderRadius: '4px',
              background: selectedProblem?.state === 1 ? '#00ccbb22' : '#ff444422',
              color: selectedProblem?.state === 1 ? '#00ccbb' : '#ff4444',
              border: `1px solid ${selectedProblem?.state === 1 ? '#00ccbb' : '#ff4444'}`
          }}>
            {selectedProblem?.state === 1 ? 'OPEN' : 'CLOSED'}
          </span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
                {/* LEFT: Visual Representation (Placeholder for your specific tree rendering) */}
                <div style={{ flex: 2, background: '#0d0d0d', border: '1px solid #333', padding: '20px', overflow: 'auto' }}>
                    <IxTypography variant="h3">Investigation Tree</IxTypography>

                    <div style={{ marginTop: '20px' }}>
                        {/* Logic: If root is selected, show highlight */}
                        <div
                            onClick={() => setSelectedNodeId('root')}
                            style={{
                                cursor: 'pointer',
                                padding: '15px',
                                border: selectedNodeId === 'root' ? '2px solid #00ccbb' : '1px solid #333',
                                background: '#1a1a1a'
                            }}
                        >
                            <b>Problem:</b> {selectedProblem?.title}
                        </div>

                        {/* Tree rendering logic for child nodes (Whys) goes here */}
                        {treeData.map(node => (
                            <div key={node.id} style={{ marginLeft: '20px', marginTop: '10px' }}>
                                {/* Map your tree branches here */}
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: The Sidebar where isProcessing is defined */}
                <div style={{ width: '380px' }}>
                    <ControlSidebar
                        selectedProblem={selectedProblem}
                        selectedNodeId={selectedNodeId}
                        treeModel={treeModel}
                        onRefreshTree={loadTree}
                        onUpdateProblem={(newState) => {
                            // Updates the problem state in App.jsx and LocalStorage
                            setSelectedProblem({ ...selectedProblem, state: newState });
                        }}
                    />
                </div>
            </div>
        </div>
    );
}