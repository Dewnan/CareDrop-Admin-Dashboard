import React, { useState } from 'react';
import { Bell, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { dataService } from '../../services/dataService';

export const SettingsPanel: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [targetPatients, setTargetPatients] = useState<boolean>(true);
  const [targetHelpers, setTargetHelpers] = useState<boolean>(true);
  const [targetAll, setTargetAll] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleToggleAll = (checked: boolean) => {
    setTargetAll(checked);
    setTargetPatients(checked);
    setTargetHelpers(checked);
  };

  const handleTogglePatients = (checked: boolean) => {
    setTargetPatients(checked);
    const newAll = checked && targetHelpers;
    setTargetAll(newAll);
  };

  const handleToggleHelpers = (checked: boolean) => {
    setTargetHelpers(checked);
    const newAll = checked && targetPatients;
    setTargetAll(newAll);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Please enter a notification title.');
      return;
    }

    if (!body.trim()) {
      setErrorMessage('Please enter a notification message body.');
      return;
    }

    if (!targetPatients && !targetHelpers && !targetAll) {
      setErrorMessage('Please select at least one target audience.');
      return;
    }

    let targetAudience: 'patients' | 'helpers' | 'all' = 'all';
    if (targetAll || (targetPatients && targetHelpers)) {
      targetAudience = 'all';
    } else if (targetPatients) {
      targetAudience = 'patients';
    } else if (targetHelpers) {
      targetAudience = 'helpers';
    }

    setIsSending(true);

    try {
      const result = await dataService.sendBroadcastNotification({
        title: title.trim(),
        body: body.trim(),
        targetAudience,
      });

      setIsSending(false);
      if (result.success) {
        setSuccessMessage(result.message);
        setTitle('');
        setBody('');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage('Failed to send notification. Please try again.');
      }
    } catch (err) {
      setIsSending(false);
      setErrorMessage('An unexpected error occurred while sending notification.');
    }
  };

  return (
    <div className="settings-card">
      <div className="card-header-with-icon">
        <Bell size={20} className="text-primary" />
        <div>
          <h3 className="card-title">Broadcast Push Notifications</h3>
          <p className="card-subtitle">Dispatch real-time push notifications to registered app users</p>
        </div>
      </div>

      <form onSubmit={handleSendNotification} className="settings-form">
        {errorMessage && (
          <div className="alert-banner alert-danger flex-align-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert-banner alert-success flex-align-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">
            <span>Notification Title</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Platform Maintenance Notice"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Message Body</span>
          </label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="e.g. CareDrop services will undergo scheduled maintenance at midnight..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <div className="divider-line" />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 my-3">
          <div>
            <h4 className="section-sub-heading mb-2">Target Audience Selection</h4>
            <div className="audience-checkbox-group flex flex-wrap items-center gap-6">
              <label className="flex-align-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="toggle-checkbox"
                  checked={targetAll}
                  onChange={(e) => handleToggleAll(e.target.checked)}
                />
                <strong className="toggle-title">All Users</strong>
              </label>

              <label className="flex-align-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="toggle-checkbox"
                  checked={targetPatients}
                  onChange={(e) => handleTogglePatients(e.target.checked)}
                />
                <strong className="toggle-title">Patients & Guardians</strong>
              </label>

              <label className="flex-align-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="toggle-checkbox"
                  checked={targetHelpers}
                  onChange={(e) => handleToggleHelpers(e.target.checked)}
                />
                <strong className="toggle-title">Care Helpers</strong>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary-submit flex-align-center gap-2 px-5 py-2 shrink-0"
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 size={14} className="spinner-anim" />
                <span>Sending...</span>
              </>
            ) : (
              <span>Send</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

