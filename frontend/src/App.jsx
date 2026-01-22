import React, { useState, useEffect } from 'react';
import { IxContent } from '@siemens/ix-react';

import Header from './components/Common/Header';
import Footer from './components/Common/Footer';
import ProblemGrid from './components/Dashboard/ProblemGrid';
import TreeView from './components/Analysis/TreeView';
import { api } from './services/api';

export default function App() {
    const [view, setView] = useState(() =>
        localStorage.getItem('rca_view') || 'list'
    );

    const [problems, setProblems] = useState([]);

    const [selectedProblem, setSelectedProblem] = useState(() => {
        const saved = localStorage.getItem('rca_selected_problem');
        return saved ? JSON.parse(saved) : null;
    });

    const loadProblems = async () => {
        try {
            const data = await api.fetchProblems();
            const results = Array.isArray(data) ? data : data.problems || [];
            setProblems(results);
        } catch (err) {
            console.error('Failed to load problems:', err);
            setProblems([]);
        }
    };

    useEffect(() => {
        loadProblems();
    }, []);

    useEffect(() => {
        localStorage.setItem('rca_view', view);
        localStorage.setItem('rca_selected_problem', JSON.stringify(selectedProblem));
    }, [view, selectedProblem]);

    const handleAnalyze = (problem) => {
        setSelectedProblem(problem);
        setView('details');
    };

    const handleBack = () => {
        setView('list');
        setSelectedProblem(null);
        loadProblems();
    };

    return (
        <div className="theme-brand-dark" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
