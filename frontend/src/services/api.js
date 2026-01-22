const BASE_URL = 'http://localhost/Siemens-CaseStudy/backend/public';

export const api = {
    fetchProblems: async () => {
        const res = await fetch(`${BASE_URL}/problems`);
        const result = await res.json();
        return result.data || result;
    },

    fetchTree: async (problemId) => {
        const res = await fetch(`${BASE_URL}/tree?problem_id=${problemId}`);
        const result = await res.json();
        return result.data || result;
    },

    addCause: async (payload) => {
        const res = await fetch(`${BASE_URL}/causes`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        return result.data || result;
    },

    markRootCause: async (payload) => {
        const res = await fetch(`${BASE_URL}/root-cause`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        return result.data || result;
    },

    updateProblemState: async (problemId, state) => {
        const res = await fetch(`${BASE_URL}/problems`, {
            method: 'POST',
            body: JSON.stringify({ problem_id: problemId, state })
        });
        const result = await res.json();
        return result.data || result;
    }
};