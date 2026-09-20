import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Send, User, Phone, Mail, Calendar, MessageSquare, RotateCcw, Lock } from 'lucide-react';
import { SupportTicket, TicketStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { dataService } from '../../services/dataService';

interface TicketDetailViewProps {
  ticket: SupportTicket;
  onBack: () => void;
  onSendMessage: (ticketId: string, message: string) => void;
  onUpdateStatus: (ticketId: string, status: TicketStatus) => void;
}

export const TicketDetailView: React.FC<TicketDetailViewProps> = ({
  ticket,
  onBack,
  onSendMessage,
  onUpdateStatus,
}) => {
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = ticket.messages && ticket.messages.length > 0
    ? ticket.messages
    : [
        {
          id: `MSG-INIT-${ticket.id}`,
          sender: 'user' as const,
          senderName: ticket.userName,
          message: ticket.description,
          timestamp: ticket.createdAt,
        }
      ];

  const isClosed = ticket.status === 'resolved' || ticket.status === 'closed';
  const isHelper = ticket.userRole === 'helper';
  const roleLabel = isHelper
    ? 'Caregiver Helper'
    : ticket.userRole === 'guardian'
    ? 'Guardian Account'
    : 'Patient Account';
  const submitter = dataService.getUserById(ticket.userId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    onSendMessage(ticket.id, replyText.trim());
    setReplyText('');
  };

  const handleToggleCloseTicket = () => {
    if (isClosed) {
      onUpdateStatus(ticket.id, 'in_review');
    } else {
      onUpdateStatus(ticket.id, 'resolved');
    }
  };

  return (
    <div className="ticket-detail-full-view">
      {/* Main Header Banner Card */}
      <div className="detail-header-card mb-6">
        <div className="detail-header-nav mb-3">
          <button type="button" className="btn-back" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
        </div>
        <div className="detail-header-top flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
          <h1 className="detail-profile-name mb-0 break-words">{ticket.subject}</h1>
          <StatusBadge status={ticket.status} />
        </div>
        <div className="detail-header-sub flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-semibold uppercase">Category:</span>
            <span className="category-tag-pill">{ticket.category}</span>
          </div>
          <div className="header-id-box flex items-center gap-2">
            <span className="text-xs text-muted font-semibold uppercase">Ticket ID:</span>
            <span className="code-text font-bold text-sm text-primary-blue">#{ticket.id}</span>
          </div>
        </div>
      </div>

      {/* Horizontal Submitted By Section */}
      <div className="detail-section-card mb-6 p-4">
        <div className="section-card-header mb-3">
          <h3 className="section-card-title mb-0">Submitted By</h3>
        </div>
        <div className="submitted-by-horizontal-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="submitted-info-chip min-w-0 w-full">
            <User size={16} className="text-muted shrink-0" />
            <div className="min-w-0">
              <span className="info-label">Full Name</span>
              <span className="info-value font-semibold break-words">{ticket.userName}</span>
            </div>
          </div>

          <div className="submitted-info-chip min-w-0 w-full">
            <Mail size={16} className="text-muted shrink-0" />
            <div className="min-w-0">
              <span className="info-label">App Role</span>
              <span className="info-value">
                <span className={`status-badge-pill ${isHelper ? 'badge-info' : 'badge-primary'}`}>
                  {roleLabel}
                </span>
              </span>
            </div>
          </div>

          <div className="submitted-info-chip min-w-0 w-full">
            <Mail size={16} className="text-muted shrink-0" />
            <div className="min-w-0">
              <span className="info-label">Email Address</span>
              <span className="info-value break-all">
                {submitter?.email || 'N/A'}
              </span>
            </div>
          </div>

          <div className="submitted-info-chip min-w-0 w-full">
            <Phone size={16} className="text-muted shrink-0" />
            <div className="min-w-0">
              <span className="info-label">Contact Phone</span>
              <span className="info-value break-words">{submitter?.phone || 'N/A'}</span>
            </div>
          </div>

          <div className="submitted-info-chip min-w-0 w-full">
            <Calendar size={16} className="text-muted shrink-0" />
            <div className="min-w-0">
              <span className="info-label">Submitted On</span>
              <span className="info-value break-words">{ticket.createdAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat Conversation Window */}
      <div className="detail-section-card chat-card-container mb-6">
        <div className="section-card-header flex-between align-center p-3 border-b">
          <div className="flex-align-center gap-2">
            <h3 className="section-card-title mb-0">Conversation Window</h3>
          </div>
        </div>

        {/* Chat Messages Log */}
        <div className="chat-messages-container">
          {messages.map((msg) => {
            const isAdmin = msg.sender === 'admin';
            const textContent = msg.message || (msg as any).text || (msg as any).content || (msg as any).body || '';
            const senderInitial = msg.senderName ? msg.senderName.slice(0, 2).toUpperCase() : 'US';

            return (
              <div
                key={msg.id}
                className={`chat-message-row ${isAdmin ? 'row-admin' : 'row-user'}`}
              >
                <div className="chat-avatar-circle">
                  {isAdmin ? 'AD' : senderInitial}
                </div>
                <div className="chat-bubble-wrapper">
                  <div className="chat-sender-info">
                    <span className="sender-name">{msg.senderName || (isAdmin ? 'CareDrop Support' : ticket.userName)}</span>
                    <span className="sender-timestamp">{msg.timestamp}</span>
                  </div>
                  <div className={`chat-bubble ${isAdmin ? 'bubble-admin' : 'bubble-user'}`}>
                    {textContent}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Reply Form with Integrated Send Button inside Input Box */}
        <div className="chat-input-wrapper border-t p-3">
          {isClosed ? (
            <div className="ticket-closed-notice">
              <Lock size={16} className="text-muted" />
              <span>This ticket is currently closed. Reopen the ticket below to send further messages.</span>
            </div>
          ) : (
            <form onSubmit={handleSendChat} className="chat-reply-form">
              <div className="chat-input-container">
                <textarea
                  rows={2}
                  className="form-textarea chat-textarea-integrated"
                  placeholder={`Type a message to chat with ${ticket.userName}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat(e);
                    }
                  }}
                  required
                />
                <button
                  type="submit"
                  className="btn-chat-send-icon"
                  title="Send Message"
                  aria-label="Send Message"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Status Action Button */}
      <div className="ticket-status-actions flex-justify-end mt-4 mb-2">
        {isClosed ? (
          <button
            type="button"
            className="btn-action btn-outline-secondary"
            onClick={handleToggleCloseTicket}
          >
            <RotateCcw size={15} />
            <span>Reopen Ticket</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn-action btn-success-action"
            onClick={handleToggleCloseTicket}
          >
            <CheckCircle size={15} />
            <span>Close Ticket</span>
          </button>
        )}
      </div>
    </div>
  );
};
