import React, { useState } from 'react';
import { Shield, UserPlus, Trash2, Loader2 } from 'lucide-react';
import { AdminRecord } from '../../types';

interface AdminManagementPanelProps {
  admins: AdminRecord[];
  onAddAdmin: (email: string) => Promise<void>;
  onRemoveAdmin: (id: string) => Promise<void>;
}

export const AdminManagementPanel: React.FC<AdminManagementPanelProps> = ({
  admins,
  onAddAdmin,
  onRemoveAdmin,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (admins.some((a) => a.email === trimmed)) {
      setError('This email is already an admin.');
      return;
    }

    setIsAdding(true);
    try {
      await onAddAdmin(trimmed);
      setEmailInput('');
    } catch {
      setError('Failed to grant admin access. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await onRemoveAdmin(id);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="settings-card">
      <div className="card-header-with-icon">
        <Shield size={20} className="text-primary" />
        <div>
          <h3 className="card-title">Admin Access Management</h3>
          <p className="card-subtitle">Grant or revoke admin console access by email address</p>
        </div>
      </div>

      {/* Add Admin Form */}
      <form onSubmit={handleAdd} className="admin-add-form">
        <div className="admin-email-input-row">
          <input
            type="email"
            className="form-input"
            placeholder="Enter admin email address..."
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setError('');
            }}
            disabled={isAdding}
          />
          <button
            type="submit"
            className="btn-action btn-primary-blue flex-align-center gap-2"
            disabled={isAdding || !emailInput.trim()}
          >
            {isAdding ? (
              <>
                <Loader2 size={15} className="spinner-anim" />
                <span>Granting...</span>
              </>
            ) : (
              <>
                <UserPlus size={15} />
                <span>Grant Access</span>
              </>
            )}
          </button>
        </div>
        {error && <p className="admin-form-error">{error}</p>}
      </form>

      {/* Current Admins List */}
      <div className="admin-list">
        {admins.length === 0 ? (
          <p className="text-muted text-sm">No admins configured.</p>
        ) : (
          admins.map((admin) => (
            <div key={admin.id} className="admin-list-item">
              <div className="admin-avatar-initials">
                {admin.name.charAt(0).toUpperCase()}
              </div>
              <div className="admin-list-info">
                <div className="flex-align-center gap-2">
                  <p className="admin-list-name">{admin.name}</p>
                  {admin.role && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium">
                      {admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                    </span>
                  )}
                </div>
                <p className="admin-list-email">{admin.email}</p>
              </div>
              <span className="admin-list-date">{admin.addedAt}</span>
              <button
                type="button"
                className="btn-icon btn-danger-light"
                title={`Revoke admin access from ${admin.email}`}
                disabled={removingId === admin.id}
                onClick={() => handleRemove(admin.id)}
              >
                {removingId === admin.id ? (
                  <Loader2 size={14} className="spinner-anim" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
