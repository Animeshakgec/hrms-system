const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function req(path, options = {}) {
  const { headers: extraHeaders, ...restOptions } = options;

  const res = await fetch(`${BASE}${path}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });

  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return json.data;
}

export const api = {
  // Employees
  getEmployees: () => req('/employees'),
  createEmployee: (body) => { console.log('Sending to API:', body); return req('/employees', { method: 'POST', body: JSON.stringify(body) }) },
  deleteEmployee: (id) => req(`/employees/${id}`, { method: 'DELETE' }),
  getAttendanceSummary: (id) => req(`/employees/${id}/attendance-summary`),
  getEmployeeAttendance: (id) => req(`/attendance/employee/${id}`),

  // Attendance
  getDashboard: () => req('/attendance/dashboard'),
  getAttendance: (params) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v))
    ).toString();
    return req(`/attendance${qs ? '?' + qs : ''}`);
  },
  markAttendance: (body) => req('/attendance', { method: 'POST', body: JSON.stringify(body) }),
  deleteAttendance: (id) => req(`/attendance/${id}`, { method: 'DELETE' }),
};
