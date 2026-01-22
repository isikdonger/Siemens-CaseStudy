const BASE_URL = 'http://localhost/Siemens-CaseStudy/backend/public';

export const api = {
    _get: async (endpoint) => {
        const res = await fetch(`${BASE_URL}${endpoint}`);
        const result = await res.json();
        return result.data || result;
    },

    _post: async (endpoint, payload) => {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        return result.data || result;
    },

    fetchProblems: () => api._get('/problems'),

    fetchTree: (problemId) => api._get(`/tree?problem_id=${problemId}`),

    createProblem: (payload) => api._post('/problems', payload),

    updateProblemState: (problemId, state) =>
        api._post('/problems', { problem_id: problemId, state }),

    addCause: (payload) => api._post('/causes', payload),

    markRootCause: (payload) => api._post('/root-cause', payload),
};