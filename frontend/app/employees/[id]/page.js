'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function EmployeeDetailPage({ params }) {
  const { id } = use(params);

  const [summary, setSummary]   = useState(null);
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    Promise.all([
      api.getAttendanceSummary(id),
      api.getEmployeeAttendance(id),
    ])
      .then(([s, a]) => {
        setSummary(s);
        setRecords(a.records || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (str) =>
    new Date(str + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });

  const joinDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  /* Loading */
  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-28" />
      <div className="h-28 bg-white rounded-xl border border-gray-200" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl border border-gray-200"/>)}
      </div>
      <div className="h-64 bg-white rounded-xl border border-gray-200" />
    </div>
  );

  /* Error */
  if (error) return (
    <div>
      <Link href="/employees" className="text-sm text-indigo-600 hover:underline inline-flex items-center gap-1 mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        Back
      </Link>
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">⚠ {error}</div>
    </div>
  );

  const { employee: emp, summary: s } = summary;
  const rate = s.totalDays > 0 ? Math.round((s.totalPresent / s.totalDays) * 100) : 0;

  return (
    <div>
      {/* Back */}
      <Link href="/employees" className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 mb-5 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Employees
      </Link>

      {/* Employee card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-indigo-700 text-lg font-bold">{emp.fullName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{emp.fullName}</h1>
              <p className="text-sm text-gray-500">{emp.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{emp.department}</span>
                <span className="text-xs font-mono text-gray-400">{emp.employeeId}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">Joined {joinDate(emp.createdAt)}</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: 'Total Days',  value: s.totalDays,    cls: 'text-gray-900'  },
          { label: 'Present',     value: s.totalPresent, cls: 'text-green-600' },
          { label: 'Absent',      value: s.totalAbsent,  cls: 'text-red-600'   },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm">
            <p className={`text-3xl font-bold ${item.cls}`}>{item.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Rate bar */}
      {s.totalDays > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
            <span className="text-sm font-bold text-indigo-600">{rate}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-700" style={{ width: `${rate}%` }} />
          </div>
        </div>
      )}

      {/* Records table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-3.5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-800">Attendance History</h2>
          <span className="text-xs text-gray-400">{records.length} records</span>
        </div>

        {records.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">No attendance records yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Date', 'Status'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5 text-gray-700">{formatDate(rec.date)}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${rec.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {rec.status === 'Present' ? '✓ Present' : '✗ Absent'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
