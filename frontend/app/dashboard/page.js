'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-28 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-14" />
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.getDashboard()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">{today}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-6">
          ⚠ Could not load dashboard — {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Stats */}
      {!loading && stats && (() => {
        const { totalEmployees, todayAttendance: t } = stats;
        const rate = totalEmployees > 0 ? Math.round((t.present / totalEmployees) * 100) : 0;

        const cards = [
          { label: 'Total Employees', value: totalEmployees,  color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Present Today',   value: t.present,       color: 'text-green-600',  bg: 'bg-green-50'  },
          { label: 'Absent Today',    value: t.absent,        color: 'text-red-600',    bg: 'bg-red-50'    },
          { label: 'Not Marked',      value: t.notMarked,     color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ];

        return (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {cards.map((c) => (
                <div key={c.label} className={`${c.bg} rounded-xl border border-gray-100 p-5`}>
                  <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{c.label}</p>
                </div>
              ))}
            </div>

            {/* Attendance rate bar */}
            {totalEmployees > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-semibold text-gray-700">Today&apos;s Attendance Rate</p>
                  <p className="text-sm font-bold text-indigo-600">{rate}%</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>{t.present} present</span>
                  <span>{totalEmployees} total employees</span>
                </div>
              </div>
            )}

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <a href="/employees" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Manage Employees</p>
                    <p className="text-xs text-gray-400">Add or remove employees</p>
                  </div>
                </div>
              </a>
              <a href="/attendance" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Mark Attendance</p>
                    <p className="text-xs text-gray-400">Record today&apos;s attendance</p>
                  </div>
                </div>
              </a>
            </div>
          </>
        );
      })()}
    </div>
  );
}
