'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

/* ── Spinner ── */
function Spin() {
  return (
    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

/* ── Add Employee Modal ── */
function AddModal({ onClose, onAdded }) {
  const [form, setForm]       = useState({ employeeId: '', fullName: '', email: '', department: '' });
  const [errors, setErrors]   = useState({});
  const [apiErr, setApiErr]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.employeeId.trim()) e.employeeId = 'Required';
    if (!form.fullName.trim())   e.fullName   = 'Required';
    if (!form.email.trim())      e.email      = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.department.trim()) e.department = 'Required';
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setApiErr('');
    try {
      await api.createEmployee(form);
      onAdded();
      onClose();
    } catch (err) {
      setApiErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* close on Escape */
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md modal-animate" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Add New Employee</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-xl leading-none">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {apiErr && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{apiErr}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Employee ID" name="employeeId" value={form.employeeId} onChange={set} placeholder="EMP-001" error={errors.employeeId} />
            <Field label="Full Name"   name="fullName"   value={form.fullName}   onChange={set} placeholder="John Doe"  error={errors.fullName}   />
          </div>
          <Field label="Email Address" name="email"      type="email" value={form.email}      onChange={set} placeholder="john@company.com" error={errors.email}      />
          <Field label="Department"    name="department"              value={form.department} onChange={set} placeholder="Engineering"       error={errors.department} />

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={submit} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors">
              {loading && <Spin />} Add Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* labelled input */
function Field({ label, name, type = 'text', value, onChange, placeholder, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

/* department badge colour */
const DEPT_COLORS = {
  engineering: 'bg-blue-100 text-blue-700',
  hr:          'bg-purple-100 text-purple-700',
  finance:     'bg-green-100 text-green-700',
  marketing:   'bg-yellow-100 text-yellow-700',
  operations:  'bg-orange-100 text-orange-700',
};
const deptColor = (d = '') => DEPT_COLORS[d.toLowerCase()] || 'bg-gray-100 text-gray-600';

/* ── Page ── */
export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch]       = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.getEmployees()
      .then(setEmployees)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}?\nAll their attendance records will also be removed.`)) return;
    setDeletingId(id);
    try {
      await api.deleteEmployee(id);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      alert(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = employees.filter((e) =>
    [e.fullName, e.employeeId, e.email, e.department]
      .join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your organisation&apos;s employee records</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, ID, email or department…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-3.5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-800">All Employees</h2>
          {!loading && <span className="text-xs text-gray-400">{filtered.length} of {employees.length}</span>}
        </div>

        {/* API error */}
        {error && <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">⚠ {error}</div>}

        {/* Skeleton */}
        {loading && (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-40" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="py-14 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">{search ? 'No employees match your search.' : 'No employees yet.'}</p>
            {!search && (
              <button onClick={() => setShowModal(true)} className="mt-2 text-sm text-indigo-600 hover:underline">
                Add your first employee →
              </button>
            )}
          </div>
        )}

        {/* Data */}
        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Employee ID', 'Name', 'Email', 'Department', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-medium text-indigo-600">{emp.employeeId}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-900">{emp.fullName}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{emp.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${deptColor(emp.department)}`}>
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(emp.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Link href={`/employees/${emp.id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(emp.id, emp.fullName)}
                          disabled={deletingId === emp.id}
                          className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          {deletingId === emp.id ? <><Spin /> Deleting…</> : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <AddModal onClose={() => setShowModal(false)} onAdded={load} />}
    </div>
  );
}
