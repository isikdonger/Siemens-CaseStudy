const BASE_URL = 'http://localhost/Siemens-CaseStudy/backend';

export const api = {
    fetchProblems: () => fetch(`${BASE_URL}/get_problems.php`).then(res => res.json()),

    fetchTree: (id) => fetch(`${BASE_URL}/get_cause_tree.php?problem_id=${id}`).then(res => res.json()),

    addCause: (payload) => fetch(`${BASE_URL}/add_cause.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(res => res.json()),

    markRootCause: (payload) => fetch(`${BASE_URL}/mark_root_cause.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(res => res.json()),

    reopenProblem: (problem_id) => fetch(`${BASE_URL}/reopen_problem.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem_id })
    }).then(res => res.json()),

    createProblem: (payload) => fetch(`${BASE_URL}/create_problem.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(res => res.json()),
};