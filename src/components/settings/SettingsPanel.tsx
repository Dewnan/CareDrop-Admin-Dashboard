import React, { useState } from 'react';
import { Sliders, Shield, FileText, Loader2 } from 'lucide-react';
import { ActivityLog } from '../../types';

interface SettingsPanelProps {
  auditLogs: ActivityLog[];
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ auditLogs }) => {
  const [platformFee, setPlatformFee] = useState<number>(15);
  const [enableMedication, setEnableMedication] = useState<boolean>(true);
  const [enableDocument, setEnableDocument] = useState<boolean>(true);
  const [enableQueue, setEnableQueue] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 750));
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Platform Configuration Card */}
      <div className="settings-card">
        <div className="card-header-with-icon">
          <Sliders size={20} className="text-primary" />
          <div>
            <h3 className="card-title">Platform Parameters</h3>
            <p className="card-subtitle">Configure commission fees & active task categories</p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="settings-form">
          <div className="form-group">
            <label className="form-label flex-between">
              <span>Platform Commission Cut (%)</span>
              <strong>{platformFee}%</strong>
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={platformFee}
              onChange={(e) => setPlatformFee(Number(e.target.value))}
              className="range-slider"
            />
            <small className="form-help">Default cut deducted from helper payout per task</small>
          </div>

          <div className="divider-line" />

          <h4 className="section-sub-heading">Enabled Mobile Task Categories</h4>
          
          <div className="toggle-option-row">
            <div>
              <strong className="toggle-title">Medication Pickup & Delivery</strong>
              <p className="toggle-desc">Allow patients to request hospital/clinic prescription pickups</p>
            </div>
            <input
              type="checkbox"
              checked={enableMedication}
              onChange={(e) => setEnableMedication(e.target.checked)}
              className="toggle-checkbox"
            />
          </div>

          <div className="toggle-option-row">
            <div>
              <strong className="toggle-title">Document Filing & Retrieval</strong>
              <p className="toggle-desc">Allow medical report filing and lab result collections</p>
            </div>
            <input
              type="checkbox"
              checked={enableDocument}
              onChange={(e) => setEnableDocument(e.target.checked)}
              className="toggle-checkbox"
            />
          </div>

          <div className="toggle-option-row">
            <div>
              <strong className="toggle-title">Queue & Appointment Holding</strong>
              <p className="toggle-desc">Allow helpers to queue on behalf of patients at clinics</p>
            </div>
            <input
              type="checkbox"
              checked={enableQueue}
              onChange={(e) => setEnableQueue(e.target.checked)}
              className="toggle-checkbox"
            />
          </div>

          <div className="mt-4 flex-align-center gap-3">
            <button
              type="submit"
              className="btn-primary-submit flex-align-center gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="spinner-anim" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
            {savedSuccess && <span className="save-toast-msg">Settings saved successfully!</span>}
          </div>
        </form>
      </div>

      {/* Admin Audit Logs Card */}
      <div className="settings-card">
        <div className="card-header-with-icon">
          <FileText size={20} className="text-primary" />
          <div>
            <h3 className="card-title">Security & Audit Logs</h3>
            <p className="card-subtitle">Recent administrative operations and claim modifications</p>
          </div>
        </div>

        <div className="audit-logs-list">
          {auditLogs.map((log) => (
            <div key={log.id} className="audit-log-item">
              <div className="audit-log-header">
                <span className={`audit-badge type-${log.type}`}>{log.type}</span>
                <span className="audit-time">{log.timestamp}</span>
              </div>
              <p className="audit-action-text">
                <strong>{log.adminName}</strong> {log.action}
              </p>
              <p className="audit-target-text">Target: {log.target}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
