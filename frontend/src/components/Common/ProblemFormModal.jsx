import React, { useState, useRef } from 'react';
import { IxButton, IxModalContent, IxModalFooter, IxModalHeader, Modal } from '@siemens/ix-react';
import { api } from '../../services/api';

export default function ProblemFormModal({ onSaveSuccess }) {
    const modalRef = useRef(null);
    const [title, setTitle] = useState('');
    const [team, setTeam] = useState('');

    const handleSave = async () => {
        const res = await api.createProblem(formData);
        if(res.status === 'success') {
            onSaveSuccess(); // This calls refreshList in ProblemGrid
            closeModal();
        }
    }

    return (
        <Modal ref={modalRef}>
            <IxModalHeader onCloseClick={() => modalRef.current?.dismiss()}>Add New Problem</IxModalHeader>
            <IxModalContent>
                <div style={{ padding: '1rem' }}>
                    <label style={{ display: 'block', color: '#000' }}>Title</label>
                    <input style={{ width: '100%', color: '#000' }} value={title} onChange={(e) => setTitle(e.target.value)} />
                    <label style={{ display: 'block', color: '#000', marginTop: '10px' }}>Team</label>
                    <input style={{ width: '100%', color: '#000' }} value={team} onChange={(e) => setTeam(e.target.value)} />
                </div>
            </IxModalContent>
            <IxModalFooter>
                <IxButton variant="subtle-primary" onClick={() => modalRef.current?.dismiss()}>Cancel</IxButton>
                <IxButton onClick={handleSave}>Save</IxButton>
            </IxModalFooter>
        </Modal>
    );
}