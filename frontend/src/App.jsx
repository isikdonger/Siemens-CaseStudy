import React, { useState, useEffect } from 'react';
import { IxContent, IxContentHeader, IxButton } from '@siemens/ix-react';

// Styles
import '@siemens/ix/dist/siemens-ix/siemens-ix.css';

// Services
import { api } from './services/api';

// Components
import Header from './components/Common/Header';
import Footer from './components/Common/Footer';
import ProblemGrid from './components/Dashboard/ProblemGrid';
import TreeView from './components/Analysis/TreeView';
import ControlSidebar from './components/Analysis/ControlSidebar';

export default function App() {
    // 1. Initialize state from LocalStorage (if exists)
    const savedView = localStorage.getItem('rca_view') || 'list';
    const savedProblem = JSON.parse(localStorage.getItem('rca_selected_problem'));
    const savedNode = localStorage.getItem('rca_selected_node') || 'root';

    const [view, setView] = useState(savedView);
    const [rowData, setRowData] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(savedProblem);
    const [treeModel, setTreeModel] = useState({});
    const [newWhy, setNewWhy] = useState('');
    const [selectedNodeId, setSelectedNodeId] = useState(savedNode);
    const [expandedNodes, setExpandedNodes] = useState({ root: true });
    const [actionDescription, setActionDescription] = useState('');

    // 2. Load data on mount
    useEffect(() => {
        loadProblems();
        if (selectedProblem) {
            loadTree(selectedProblem.problem_id);
        }
    }, []);

    // 3. Update LocalStorage whenever navigation or selection changes
    useEffect(() => {
        localStorage.setItem('rca_view', view);
        localStorage.setItem('rca_selected_problem', JSON.stringify(selectedProblem));
        localStorage.setItem('rca_selected_node', selectedNodeId);
    }, [view, selectedProblem, selectedNodeId]);

    const loadProblems = () => api.fetchProblems().then(setRowData);
    const loadTree = (id) => api.fetchTree(id).then(setTreeModel);

    const handleAnalyze = (problem) => {
        setSelectedProblem(problem);
        setSelectedNodeId('root');
        loadTree(problem.problem_id);
        setView('details');
    };

    const handleBack = () => {
        setView('list');
        setSelectedProblem(null);
        setSelectedNodeId('root');
        setTreeModel({});
    };

    const handleAddWhy = async () => {
        await api.addCause({
            problem_id: selectedProblem.problem_id,
            parent_id: selectedNodeId === 'root' ? null : selectedNodeId,
            description: newWhy.trim()
        });
        setNewWhy('');
        loadTree(selectedProblem.problem_id);
    };

    const handleMarkRoot = async () => {
        await api.markRootCause({
            problem_id: selectedProblem.problem_id,
            cause_id: selectedNodeId,
            action: actionDescription.trim()
        });
        setActionDescription('');
        loadProblems();
        setSelectedProblem(prev => ({ ...prev, state: 2 }));
        loadTree(selectedProblem.problem_id);
    };

    const handleReopen = async () => {
        await api.reopenProblem(selectedProblem.problem_id);
        loadProblems();
        setSelectedProblem(prev => ({ ...prev, state: 1 }));
        loadTree(selectedProblem.problem_id);
    };

    return (
        <div className="theme-brand-dark" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#000' }}>
            <Header />

            <IxContent style={{ flex: 1 }}>
                {view === 'list' ? (
                    <ProblemGrid
                        rowData={rowData}
                        onAnalyze={handleAnalyze}
                        refreshList={loadProblems}
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <IxContentHeader title={`Investigation: ${selectedProblem?.title}`}>
                            <IxButton variant="secondary" onClick={handleBack}>Back to Dashboard</IxButton>
                        </IxContentHeader>
                        <div style={{ display: 'flex', flex: 1, gap: '24px', padding: '24px', minHeight: 0 }}>
                            <TreeView
                                treeModel={treeModel}
                                selectedProblem={selectedProblem}
                                selectedNodeId={selectedNodeId}
                                expandedNodes={expandedNodes}
                                onNodeClick={setSelectedNodeId}
                                onToggleExpand={(id) => setExpandedNodes(p => ({ ...p, [id]: !p[id] }))}
                                onReopen={handleReopen}
                            />
                            <ControlSidebar
                                selectedProblem={selectedProblem}
                                selectedNodeId={selectedNodeId}
                                treeModel={treeModel}
                                newWhy={newWhy}
                                setNewWhy={setNewWhy}
                                onAddWhy={handleAddWhy}
                                actionDescription={actionDescription}
                                setActionDescription={setActionDescription}
                                onMarkRoot={handleMarkRoot}
                            />
                        </div>
                    </div>
                )}
            </IxContent>

            <Footer />
        </div>
    );
}