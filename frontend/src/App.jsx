import React, { useState, useEffect } from 'react';
import { IxContent } from '@siemens/ix-react';

// Styles
import '@siemens/ix/dist/siemens-ix/siemens-ix.css';

// Modular Components
import Header from './components/Common/Header';
import Footer from './components/Common/Footer';
import ProblemGrid from './components/Dashboard/ProblemGrid';
import TreeView from './components/Analysis/TreeView';
import { api } from './services/api';

export default function App() {
    // 1. Persistence: Initialize state from LocalStorage
    const [view, setView] = useState(() => localStorage.getItem('rca_view') || 'list');
    const [problems, setProblems] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(() => {
        const saved = localStorage.getItem('rca_selected_problem');
        return saved ? JSON.parse(saved) : null;
    });

    // 2. Fetch Data
    const loadProblems = async () => {
        try {
            const data = await api.fetchProblems();
            // Adjust this line if your PHP returns { problems: [...] } vs [...]
            const results = Array.isArray(data) ? data : (data.problems || []);
            setProblems(results);
        } catch (err) {
            console.error("Data load failed:", err);
            setProblems([]);
        }
    };

    useEffect(() => {
        loadProblems();
    }, []);

    // 3. Keep LocalStorage in sync with state
    useEffect(() => {
        localStorage.setItem('rca_view', view);
        localStorage.setItem('rca_selected_problem', JSON.stringify(selectedProblem));
    }, [view, selectedProblem]);

    // 4. Navigation Handlers
    const handleAnalyze = (problem) => {
        setSelectedProblem(problem);
        setView('details');
    };

    const handleBack = () => {
        setView('list');
        setSelectedProblem(null);
        loadProblems(); // Refresh the list when returning to dashboard
    };

    return (
        <div className="theme-brand-dark" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#000' }}>
            <Header />
            <IxContent style={{ flex: 1 }}>
                {view === 'list' ? (
                    <ProblemGrid
                        rowData={problems}
                        onAnalyze={handleAnalyze}
                        refreshList={loadProblems}
                    />
                ) : (
                    <TreeView
                        selectedProblem={selectedProblem}
                        onBack={handleBack}
                        setSelectedProblem={setSelectedProblem}
                    />
                )}
            </IxContent>
            <Footer />
        </div>
    );
}