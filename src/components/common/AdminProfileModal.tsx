import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../../services/AuthContext';
import { User, Key, Upload, Trash2, Check, Loader2 } from 'lucide-react';
import profilePicturePlaceholder from '../../assets/profile_picture_placeholder.jpg';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || 'Super Admin');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || profilePicturePlaceholder);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Invalid file type. Please upload a JPG, PNG, WebP, or GIF image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAvatarUrl(profilePicturePlaceholder);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword) {
        setErrorMsg('Please enter your current password.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirmation do not match.');
        return;
      }
    }

    setIsSaving(true);

    // Simulate standard async save delay with spinner animation
    await new Promise((resolve) => setTimeout(resolve, 800));

    await updateProfile({
      name: name.trim(),
      avatarUrl: avatarUrl === profilePicturePlaceholder ? '' : avatarUrl,
    });

    setIsSaving(false);
    setSuccessMsg('Profile updated successfully.');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admin Account & Profile Settings">
      <form onSubmit={handleSave} className="admin-profile-form flex-column gap-4">
        {successMsg && (
          <div className="alert-success-box flex-align-center gap-2">
            <Check size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="alert-danger-box">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Group 1: Profile Image Upload & Management */}
        <div className="profile-section-group">
          <label className="form-label font-semibold">PROFILE IMAGE</label>
          <div className="avatar-edit-section flex-align-center gap-4 mt-2">
            <div className="avatar-preview-box">
              <img
                src={avatarUrl || profilePicturePlaceholder}
                alt={name}
                className="avatar-img-preview"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = profilePicturePlaceholder;
                }}
              />
            </div>

            <div className="flex-1 flex-column gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp, image/gif"
                className="hidden-file-input"
                style={{ display: 'none' }}
              />
              <div className="flex-align-center gap-2">
                <button
                  type="button"
                  className="btn-secondary-action flex-align-center gap-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={15} />
                  <span>Upload Image</span>
                </button>
                <button
                  type="button"
                  className="btn-danger-action flex-align-center gap-1"
                  onClick={handleRemoveImage}
                >
                  <Trash2 size={15} />
                  <span>Remove</span>
                </button>
              </div>
              <p className="text-xs text-muted mt-1">
                Accepted image formats: JPG, PNG, WebP, GIF (Max 5MB)
              </p>
            </div>
          </div>
        </div>

        <div className="divider-line" />

        {/* Group 2: Account Credentials */}
        <div className="profile-section-group flex-column gap-3">
          <div className="form-group">
            <label className="form-label font-semibold">USERNAME</label>
            <div className="input-with-icon mt-1">
              <User size={16} className="text-muted" />
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter admin username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label font-semibold">EMAIL ADDRESS</label>
            <input
              type="email"
              className="form-input bg-muted mt-1"
              value={user?.email || 'admin@caredrop.my'}
              disabled
            />
          </div>
        </div>

        <div className="divider-line" />

        {/* Group 3: Security & Password */}
        <div className="profile-section-group">
          <label className="form-label font-semibold flex-align-center gap-2 mb-2">
            <Key size={15} />
            <span>CHANGE PASSWORD (OPTIONAL)</span>
          </label>

          <div className="flex-column gap-2">
            <input
              type="password"
              className="form-input"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              className="form-input"
              placeholder="New Password (min. 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              className="form-input"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="modal-footer-buttons mt-3">
          <button
            type="button"
            className="btn-secondary-cancel"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary-submit flex-align-center justify-center gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="spinner-anim" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Profile Changes</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
