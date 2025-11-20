'use client';

import { useState } from 'react';

interface SubscribeProps {
  variant?: 'inline' | 'modal';
}

export default function Subscribe({ variant = 'inline' }: SubscribeProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showForm, setShowForm] = useState(variant === 'inline');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      setIsSuccess(data.success);
      setMessage(data.message);

      if (data.success) {
        setEmail('');
        // Hide form after successful subscription
        if (variant === 'modal') {
          setTimeout(() => setShowForm(false), 3000);
        }
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'modal' && !showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Subscribe to Newsletter
      </button>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-2">Subscribe to Newsletter</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Get the latest posts delivered right to your inbox.
      </p>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            isSuccess
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}
        >
          <p className="text-sm">{message}</p>
        </div>
      )}

      {!isSuccess && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
            required
          />
          <button
            type="submit"
            disabled={loading || !email}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      )}

      {variant === 'modal' && (
        <button
          onClick={() => setShowForm(false)}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Close
        </button>
      )}
    </div>
  );
}
