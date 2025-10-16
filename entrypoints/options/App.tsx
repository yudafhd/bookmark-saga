import React, { useCallback, useEffect, useState } from 'react';
import { MIN_MAX_ITEMS, MAX_MAX_ITEMS, DEFAULT_MAX_ITEMS } from '@/lib/constants';
import { clampMaxItems } from '@/lib/utils';
import { readMaxItems, writeMaxItems } from '@/lib/storage';

const OptionsApp: React.FC = () => {
  const [value, setValue] = useState<string>(String(DEFAULT_MAX_ITEMS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const stored = await readMaxItems();
        setValue(String(stored));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setError(null);
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        setError('Please enter a valid number.');
        return;
      }
      const clamped = clampMaxItems(parsed);
      setSaving(true);
      try {
        await writeMaxItems(clamped);
        setValue(String(clamped));
        setMessage('Settings saved!');
        setTimeout(() => setMessage(null), 2000);
      } finally {
        setSaving(false);
      }
    },
    [value],
  );

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Bookmark Saga Options</h1>
        <p className="mt-2 text-sm opacity-70">
          Control how many visits are stored for the New Tab experience.
        </p>
      </header>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="maxItems" className="block text-sm font-medium">
          Max items ({MIN_MAX_ITEMS}-{MAX_MAX_ITEMS})
        </label>
        <input
          id="maxItems"
          type="number"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          min={MIN_MAX_ITEMS}
          max={MAX_MAX_ITEMS}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={loading || saving}
        />
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading || saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
      {message ? (
        <div className="text-sm text-green-600 dark:text-green-400">{message}</div>
      ) : null}
    </div>
  );
};

export default OptionsApp;
