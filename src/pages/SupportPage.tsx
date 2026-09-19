import React, { useState } from 'react';
import { SupportTicketList } from '../components/tickets/SupportTicketList';
import { TicketDetailView } from '../components/tickets/TicketDetailView';
import { dataService } from '../services/dataService';
import { useLiveData } from '../hooks/useLiveData';
import { SupportTicket, TicketStatus } from '../types';

export const SupportPage: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const { tickets, isLoaded } = useLiveData();

  const handleSendMessage = (ticketId: string, message: string) => {
    dataService.addTicketMessage(ticketId, message);
  };

  const handleUpdateStatus = (ticketId: string, status: TicketStatus) => {
    dataService.updateTicketStatus(ticketId, status);
  };

  if (selectedTicket) {
    const latestTicket = tickets.find((t) => t.id === selectedTicket.id) || selectedTicket;

    return (
      <div className="page-container">
        <TicketDetailView
          ticket={latestTicket}
          onBack={() => setSelectedTicket(null)}
          onSendMessage={handleSendMessage}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-title-header">
        <div>
          <h1 className="page-heading">Support Inquiries</h1>
          <p className="page-subheading">Manage and resolve tickets submitted by Patients, Guardians, and Caregiver Helpers</p>
        </div>
      </div>

      <SupportTicketList
        tickets={tickets}
        isLoading={!isLoaded}
        onSelectTicket={(ticket) => setSelectedTicket(ticket)}
      />
    </div>
  );
};
