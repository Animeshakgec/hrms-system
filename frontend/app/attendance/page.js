'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

function Spin() {
  return (
    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}

/* ── Mark Attendance Modal ── */
function MarkModal({ employees, onClose, onMarked }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm]       = useState({ employeeId: '', date: today, status: '' });
  const [errors, setErrors]   = useState({});
  const [apiErr, setApiErr]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.employeeId) e.employeeId = 'Select an employee';
    if (!form.date)       e.date       = 'Date is required';
    if (!form.status)     e.status     = 'Select a status';
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setApiErr(''); setSuccess('');
    try {
      await api.markAttendance({ ...form, employeeId: Number(form.employeeId) });
      setSuccess('Attendance marked successfully!');
      setTimeout(() => { onMarked(); onClose(); }, 1000);
    } catch (err) {
      setApiErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const LabelSelect = ({ label, name, value, onChange, children, error }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <select name={name} value={value} onChange={onChange}
        className={`px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}>
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md modal-animate" onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Mark Attendance</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-4">
          {apiErr && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{apiErr}</div>}
          {success && <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">✓ {success}</div>}

          <LabelSelect label="Employee" name="employeeId" value={form.employeeId} onChange={set} error={errors.employeeId}>
            <option value="">Select an employee…</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.employeeId} – {e.fullName}</option>
            ))}
          </LabelSelect>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Date</label>
            <input name="date" type="date" value={form.date} onChange={set}
              className={`px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors
                ${errors.date ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
            />
            {errors.date && <p className="text-xs text-red-600">{errors.date}</p>}
          </div>

          <LabelSelect label="Status" name="status" value={form.status} onChange={set} error={errors.status}>
            <option value="">Select status…</option>
            <option value="Present">✅ Present</option>
            <option value="Absent">❌ Absent</option>
          </LabelSelect>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={submit} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors">
              {loading && <Spin/>} Mark Attendance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function AttendancePage() {
  const [records, setRecords]     = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [applied, setApplied]     = useState({});

  useEffect(() => {
    api.getEmployees().then(setEmployees).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    api.getAttendance(applied)
      .then(setRecords)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [applied]);

  useEffect(() => { load(); }, [load]);

  const applyFilter = () => setApplied({ startDate, endDate });
  const clearFilter = () => { setStartDate(''); setEndDate(''); setApplied({}); };
  const hasFilter   = applied.startDate || applied.endDate;

  const handleDelete = async (id) => {
    if (!confirm('Delete this attendance record?')) return;
    setDeletingId(id);
    try {
      await api.deleteAttendance(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (str) =>
    new Date(str + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage daily attendance records</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Mark Attendance
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex items-end gap-3 flex-wrap shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">From</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">To</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
        </div>
        <button onClick={applyFilter}
          className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Apply
        </button>
        {hasFilter && (
          <>
            <button onClick={clearFilter}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Clear
            </button>
            <span className="text-xs text-indigo-600 font-medium py-2">Filter active</span>
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-3.5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-800">Attendance Records</h2>
          {!loading && <span className="text-xs text-gray-400">{records.length} records</span>}
        </div>

        {error && <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">⚠ {error}</div>}

        {loading && (
          <div className="p-5 space-y-3">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-32"/>
                <div className="h-4 bg-gray-200 rounded w-20"/>
                <div className="h-4 bg-gray-200 rounded w-36"/>
                <div className="h-4 bg-gray-200 rounded w-16"/>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && records.length === 0 && (
          <div className="py-14 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              {hasFilter ? 'No records for this date range.' : 'No attendance records yet.'}
            </p>
            {!hasFilter && (
              <button onClick={() => setShowModal(true)} className="mt-2 text-sm text-indigo-600 hover:underline">
                Mark first attendance →
              </button>
            )}
          </div>
        )}

        {!loading && !error && records.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Employee', 'Department', 'Date', 'Status', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900 text-sm">{rec.employee?.fullName}</p>
                      <p className="text-xs font-mono text-gray-400">{rec.employee?.employeeId}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-sm">{rec.employee?.department}</td>
                    <td className="px-5 py-3.5 text-gray-700 text-sm">{formatDate(rec.date)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${rec.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {rec.status === 'Present' ? '✓ Present' : '✗ Absent'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleDelete(rec.id)}
                        disabled={deletingId === rec.id}
                        className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        {deletingId === rec.id ? <><Spin/> Deleting…</> : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <MarkModal employees={employees} onClose={() => setShowModal(false)} onMarked={load}/>}
    </div>
  );
}
