import React, { useState, useRef } from 'react';
import {
    IxButton,
    IxModalContent,
    IxModalFooter,
    IxModalHeader,
    Modal
} from '@siemens/ix-react';
import { api } from '../../services/api';

export default function ProblemFormModal({ onSaveSuccess }) {
    const modalRef = useRef(null);

    const [title, setTitle] = useState('');
    const [team, setTeam] = useState('');
    const [error, setError] = useState(null);

    const handleSave = async () => {
        setError(null);

        if (!title || title.length < 3) {
            setError('Title must be at least 3 characters.');
            return;
        }

        try {
            const res = await api.createProblem({ title, team });

            if (res && (res.problem_id || res.status === 'success')) {
                onSaveSuccess();
                modalRef.current?.dismiss();

                setTitle('');
                setTeam('');
            } else {
                setError('Failed to save problem.');
            }
        } catch (err) {
            console.error("Save Error:", err);
            setError('Server error or validation failed.');
        }
    };

    return (
        <Modal ref={modalRef}>
            <IxModalHeader onCloseClick={() => modalRef.current?.dismiss()}>
                Add New Problem
            </IxModalHeader>

            <IxModalContent>
                <div style={{ padding: '1rem' }}>
                    <label style={{ display: 'block', color: '#000' }}>Title</label>
                    <input
                        style={{ width: '100%', color: '#000' }}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <label style={{ display: 'block', color: '#000', marginTop: '10px' }}>
                        Team
                    </label>
                    <input
                        style={{ width: '100%', color: '#000' }}
                        value={team}
                        onChange={(e) => setTeam(e.target.value)}
                    />

                    {error && (
                        <div style={{ color: 'red', marginTop: '10px' }}>
                            {error}
                        </div>
                    )}
                </div>
            </IxModalContent>

            <IxModalFooter>
                <IxButton
                    variant="subtle-primary"
                    onClick={() => modalRef.current?.dismiss()}
                >
                    Cancel
                </IxButton>
                <IxButton onClick={handleSave}>
                    Save
                </IxButton>
            </IxModalFooter>
        </Modal>
    );
}
