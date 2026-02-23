'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 sm:p-12 max-w-md w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2 text-gray-900">
          Patient Queue System
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Real-time patient and staff management
        </p>

        <div className="space-y-4">
          <Link
            href="/patient"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition duration-200 transform hover:scale-105"
          >
            Patient Registration
          </Link>
          <Link
            href="/staff"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition duration-200 transform hover:scale-105"
          >
            Staff Dashboard
          </Link>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Features:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Real-time patient registration</li>
            <li>✓ Live staff dashboard updates</li>
            <li>✓ Status tracking (Submitted, Active, Inactive)</li>
            <li>✓ Responsive design for all devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
