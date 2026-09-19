import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { User, UserRole } from '../../types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: Omit<User, 'id' | 'joinedDate' | 'tasksCount'>) => void;
}

// Modal dialog form to provision new Patient or Guardian accounts
export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onAddUser,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<UserRole>('guardian');
  const [icNumber, setIcNumber] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    onAddUser({
      name,
      avatar: initials || 'CD',
      type,
      phone,
      email,
      status: 'active',
      icNumber,
      address,
    });

    // Reset form
    setName('');
    setEmail('');
    setPhone('');
    setIcNumber('');
    setAddress('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New User Account"
      subtitle="Provision a patient or guardian record in CareDrop"
    >
      <form onSubmit={handleSubmit} className="form-modal-layout">
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Siti Aminah binti Rahman"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value as UserRole)}
            >
              <option value="guardian">Guardian</option>
              <option value="patient">Patient</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="+60 12-345 6789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="siti.aminah@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">IC / NRIC Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="901014-14-5678"
              value={icNumber}
              onChange={(e) => setIcNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Primary Address</label>
          <input
            type="text"
            className="form-input"
            placeholder="Jalan Ampang, Kuala Lumpur"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="modal-footer-buttons">
          <button type="button" className="btn-secondary-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary-submit">
            Create Account
          </button>
        </div>
      </form>
    </Modal>
  );
};
