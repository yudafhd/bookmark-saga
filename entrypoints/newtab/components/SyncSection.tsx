import React, { useEffect, useState } from 'react';
import { MdDownload, MdLogout, MdUpload } from 'react-icons/md';
import { getAuthStatus, importFromAppData, uploadToAppData, signOutDrive } from '@/lib/drive';

const SyncSection: React.FC = () => {
  const [auth, setAuth] = useState<{ authorized: boolean; expiresAt?: number }>({ authorized: false });
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => setAuth(await getAuthStatus()))();
  }, []);

  return (
    <section className="space-y-6" id="syncSection">
      <header>
        <h2 className="text-lg font-semibold">Google Drive Sync</h2>
        <p className="text-sm opacity-70">
          Backup and restore your Bookmark Saga data using your Google Drive AppData.<br />
          Your files stay private — we can’t see or read their contents.
        </p>

      </header>

      <div className="rounded-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            Status: {auth.authorized || success ? (
              <span className="opacity-70">Connected</span>
            ) : (
              <span className="opacity-20">Not connected</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="bs-btn bs-btn--neutral inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setMsg(null);
                try {
                  await uploadToAppData();
                  setMsg(`Uploaded`);
                  setSuccess(true)
                } catch (e: any) {
                  setMsg(`Upload failed: ${e?.message || String(e)}`);
                } finally {
                  setLoading(false);
                }
              }}
            >
              <MdUpload size={18} /> {loading ? 'Working…' : 'Save to drive'}
            </button>
            <button
              type="button"
              className="bs-btn inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setMsg(null);
                try {
                  const res = await importFromAppData();
                  setMsg(res.applied ? 'Downloaded and applied.' : 'No backup found.');
                } catch (e: any) {
                  setMsg(`Download failed: ${e?.message || String(e)}`);
                } finally {
                  setLoading(false);
                }
              }}
            >
              <MdDownload size={18} /> {loading ? 'Working…' : 'Load Data'}
            </button>
            {(auth.authorized || success) &&
              <button
                type="button"
                className="bs-btn inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  setMsg(null);
                  try {
                    await signOutDrive();
                    setAuth({ authorized: false })
                  } catch (e: any) {
                    setMsg(`Logout failed: ${e?.message || String(e)}`);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <MdLogout size={18} />
                Sign Out
              </button>
            }
          </div>
        </div>

        {msg ? <div className="text-xs opacity-80">{msg}</div> : null}
      </div>

      <div className="flex w-full h-[300px] space-y-4 items-center justify-center">
        <div className="">
          <div className="text-md text-center font-medium">Access via Web</div>
          <div className="mt-1 items-center gap-2">
            <a
              href="https://bookmarksaga.yudafhd.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-lg break-all"
            >
              bookmarksaga.yudafhd.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SyncSection;

