import { 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  addDoc,
  query,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseClient';
import { 
  User, 
  Helper, 
  Task, 
  Transaction, 
  SupportTicket, 
  TicketMessage,
  TicketStatus,
  ActivityLog, 
  OverviewMetrics,
  TaskProgressStep,
  AdminRecord
} from '../types';

const defaultMetrics: OverviewMetrics = {
  totalUsers: 0,
  totalUsersTrend: '+0% this week',
  activeHelpers: 0,
  onlineHelpersCount: 0,
  pendingVerifications: 0,
  urgentVerificationsCount: 0,
  activeTasks: 0,
  completedTasks: 0,
  totalTransactions: 'Rs. 0.00',
  pendingDisputes: 0,
  escalatedDisputesCount: 0,
  supportTickets: 0,
  unresolvedTicketsCount: 0,
  avgRating: 5.0,
  todayRevenue: 'Rs. 0.00',
  revenueTrend: '+0%',
};

class LiveDataService {
  private metrics: OverviewMetrics = { ...defaultMetrics };
  private users: User[] = [];
  private helpers: Helper[] = [];
  private tasks: Task[] = [];
  private rawTaskAssignments: any[] = [];
  private rawTasksMap: Map<string, any> = new Map();
  private transactions: Transaction[] = [];
  private tickets: SupportTicket[] = [];
  private admins: AdminRecord[] = [];
  private logs: ActivityLog[] = [];
  private listeners: (() => void)[] = [];
  private messageListeners: Map<string, () => void> = new Map();
  private subscribers: Set<() => void> = new Set();
  private isLoaded: boolean = false;

  constructor() {
    // Unauthenticated listener initialization is delayed until explicit subscription
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.warn('Error in dataService subscriber notification:', err);
      }
    });
  }

  public getSnapshot() {
    return {
      isLoaded: this.isLoaded,
      metrics: { ...this.metrics },
      users: [...this.users],
      helpers: [...this.helpers],
      tasks: [...this.tasks],
      transactions: [...this.transactions],
      tickets: [...this.tickets],
      logs: [...this.logs],
    };
  }

  public isDataLoaded(): boolean {
    return this.isLoaded;
  }

  public unsubscribeFromLiveData() {
    this.listeners.forEach((unsub) => {
      try {
        unsub();
      } catch (err) {
        console.warn('Error unsubscribing listener:', err);
      }
    });
    this.listeners = [];

    this.messageListeners.forEach((unsub) => {
      try {
        unsub();
      } catch (err) {
        console.warn('Error unsubscribing message listener:', err);
      }
    });
    this.messageListeners.clear();
    this.isLoaded = false;
    this.notifySubscribers();
  }

  public subscribeToLiveData() {
    this.unsubscribeFromLiveData();

    try {
      // 1. Users & Helpers listener from live Firestore 'users' collection
      const usersQuery = collection(db, 'users');
      const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
        const fetchedUsers: User[] = [];
        const fetchedHelpers: Helper[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const uid = docSnap.id;
          const name = data.fullName || data.name || 'User ' + uid.slice(0, 4);
          const email = data.email || '';
          const phone = data.phone || data.phoneNumber || '';
          const avatarUrl = data.profilePictureUrl || data.avatarUrl || '';
          const avatar = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
          const role = data.role || 'patient';
          const tasksCount = data.tasksCount || data.totalTasksCompleted || 0;

          if (role === 'helper') {
            fetchedHelpers.push({
              id: uid,
              name,
              avatar: avatar,
              avatarUrl: avatarUrl || undefined,
              phone,
              email,
              tasksCount,
              rating: data.rating || 5.0,
              earnings: data.todayEarnings || data.earnings || 0,
              status: data.isOnline ? 'online' : (data.verificationStatus === 'Rejected' ? 'suspended' : 'offline'),
              verificationStatus: data.verificationStatus || 'Pending',
              latitude: data.latitude,
              longitude: data.longitude,
            });
          }

          fetchedUsers.push({
            id: uid,
            name,
            avatar: avatar,
            avatarUrl: avatarUrl || undefined,
            type: role === 'helper' ? 'helper' : (role === 'admin' ? 'admin' : (role === 'superadmin' ? 'superadmin' : 'patient')),
            phone,
            email,
            joinedDate: data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Active',
            status: data.verificationStatus === 'Rejected' ? 'suspended' : 'active',
            tasksCount,
            icNumber: data.icNumber,
            totalSpent: data.totalSpent || 0,
          });
        });

        this.users = fetchedUsers;
        this.helpers = fetchedHelpers;
        this.isLoaded = true;
        this.updateDerivedMetrics();
        this.notifySubscribers();
      }, (err) => console.warn('Firestore users snapshot error:', err));

      // 2. Tasks listener from live Firestore 'tasks' collection
      const tasksQuery = collection(db, 'tasks');
      const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
        const fetchedTasks: Task[] = [];
        this.rawTasksMap.clear();

        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          this.rawTasksMap.set(docSnap.id, d);

          fetchedTasks.push({
            id: docSnap.id,
            title: d.title || 'Care Task',
            category: d.category || 'Home Assistance',
            patientName: d.patientName || 'Patient',
            patientId: d.patientId || '',
            helperName: d.helperName,
            helperId: d.assignedHelperId || d.helperId,
            pickupAddress: d.pickupAddress || d.hospital || '',
            deliveryAddress: d.dropoffAddress || '',
            amount: d.price || d.amount || 0,
            status: (d.progressStep as TaskProgressStep) || 'pending',
            priority: d.isUrgent ? 'high' : 'medium',
            createdAt: d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
            proofImageUrl: d.attachmentUrl,
          });
        });

        if (this.rawTaskAssignments.length === 0) {
          this.tasks = fetchedTasks;
        } else {
          this.updateTasksFromAssignments();
        }

        this.isLoaded = true;
        this.updateDerivedMetrics();
        this.notifySubscribers();
      }, (err) => console.warn('Firestore tasks snapshot error:', err));

      // 3. Task Assignments listener from live Firestore 'task_assignments' collection
      const taskAssignmentsQuery = collection(db, 'task_assignments');
      const unsubAssignments = onSnapshot(taskAssignmentsQuery, (snapshot) => {
        const assignments: any[] = [];
        snapshot.forEach((docSnap) => {
          assignments.push({ id: docSnap.id, ...docSnap.data() });
        });
        this.rawTaskAssignments = assignments;
        this.updateTasksFromAssignments();
        this.isLoaded = true;
        this.updateDerivedMetrics();
        this.notifySubscribers();
      }, (err) => console.warn('Firestore task_assignments snapshot error:', err));

      // 4. Support Tickets listener from live Firestore 'support_tickets' collection
      const ticketsQuery = collection(db, 'support_tickets');
      const unsubTickets = onSnapshot(ticketsQuery, (snapshot) => {
        const fetchedTickets: SupportTicket[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const ticketId = docSnap.id;

          const existing = this.tickets.find((t) => t.id === ticketId);
          const ticket: SupportTicket = {
            id: ticketId,
            userId: d.userId || '',
            userName: d.userName || 'User',
            userRole: d.userRole || 'patient',
            category: d.category || 'General Inquiry',
            subject: d.subject || 'Support Ticket',
            description: d.description || d.subject || '',
            status: d.status || 'open',
            createdAt: d.createdAt?.seconds 
              ? new Date(d.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              : 'Recent',
            adminResponse: d.adminResponse,
            resolvedAt: d.resolvedAt?.seconds 
              ? new Date(d.resolvedAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              : undefined,
            messages: existing?.messages || [],
          };
          fetchedTickets.push(ticket);

          // Subscribe to messages subcollection for live chat update
          if (!this.messageListeners.has(ticketId)) {
            try {
              const msgsRef = query(collection(db, 'support_tickets', ticketId, 'messages'), orderBy('createdAt', 'asc'));
              const unsubMsgs = onSnapshot(msgsRef, (msgSnap) => {
                const target = this.tickets.find((t) => t.id === ticketId);
                const msgs: TicketMessage[] = [];
                
                if (target && target.description) {
                  msgs.push({
                    id: `MSG-INIT-${ticketId}`,
                    sender: target.userRole === 'admin' ? 'admin' : 'user',
                    senderName: target.userName,
                    message: target.description,
                    timestamp: target.createdAt,
                  });
                }

                msgSnap.forEach((mDoc) => {
                  const md = mDoc.data();
                  msgs.push({
                    id: mDoc.id,
                    sender: md.sender || (md.senderRole === 'admin' ? 'admin' : 'user'),
                    senderName: md.senderName || (md.sender === 'admin' || md.senderRole === 'admin' ? 'CareDrop Support' : 'User'),
                    message: md.message || md.text || md.content || md.body || '',
                    timestamp: md.createdAt?.seconds
                      ? new Date(md.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Just now',
                  });
                });
                if (target) {
                  target.messages = msgs;
                  this.notifySubscribers();
                }
              }, (err) => console.warn(`Messages subcollection listener error for ${ticketId}:`, err));
              this.messageListeners.set(ticketId, unsubMsgs);
            } catch (err) {
              console.warn('Error listening to messages subcollection:', err);
            }
          }
        });
        this.tickets = fetchedTickets;
        this.isLoaded = true;
        this.updateDerivedMetrics();
        this.notifySubscribers();
      }, (err) => console.warn('Firestore support_tickets snapshot error:', err));

      // 5. Payments listener from live Firestore 'payments' collection
      const paymentsQuery = collection(db, 'payments');
      const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
        const fetchedTxns: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          fetchedTxns.push({
            id: docSnap.id,
            taskId: d.taskId || '',
            patientName: d.patientName || 'Patient',
            helperName: d.helperName || 'Helper',
            grossAmount: d.amount || 0,
            platformFee: d.platformFee || 0,
            netHelperEarnings: d.netHelperAmount || 0,
            method: d.paymentMethod === 'Cash' ? 'COD' : 'Escrow Online',
            status: d.status === 'released' ? 'completed' : (d.status === 'escrow' ? 'held_escrow' : d.status),
            createdAt: d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleDateString() : 'Today',
            disbursedAt: d.releasedAt?.seconds ? new Date(d.releasedAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          });
        });
        this.transactions = fetchedTxns;
        this.isLoaded = true;
        this.updateDerivedMetrics();
        this.notifySubscribers();
      }, (err) => console.warn('Firestore payments snapshot error:', err));

      // 6. Admins listener from live Firestore 'admins' collection
      const adminsQuery = collection(db, 'admins');
      const unsubAdmins = onSnapshot(adminsQuery, (snapshot) => {
        const fetchedAdmins: AdminRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          fetchedAdmins.push({
            id: docSnap.id,
            email: d.email || '',
            name: d.name || (d.email ? d.email.split('@')[0] : 'Admin'),
            addedAt: d.addedAt ? new Date(d.addedAt).toLocaleDateString() : 'Granted Access',
            role: d.role || 'admin',
          });
        });
        this.admins = fetchedAdmins;
        this.notifySubscribers();
      }, (err) => console.warn('Firestore admins snapshot error:', err));

      this.listeners.push(unsubUsers, unsubTasks, unsubAssignments, unsubTickets, unsubPayments, unsubAdmins);
    } catch (e) {
      console.warn('Live data subscription setup error:', e);
    }
  }

  private updateTasksFromAssignments() {
    if (this.rawTaskAssignments.length > 0) {
      const fetchedTasks: Task[] = [];
      this.rawTaskAssignments.forEach((d) => {
        const rawTask = this.rawTasksMap.get(d.taskId) || this.rawTasksMap.get(d.id) || {};
        const patientUser = this.users.find((u) => u.id === d.patientId);

        fetchedTasks.push({
          id: d.id || d.taskId || 'TSK-ASSIGN',
          title: rawTask.title || d.title || 'Care Task',
          category: rawTask.category || d.category || 'Home Assistance',
          patientName: d.patientName || patientUser?.name || rawTask.patientName || 'Patient',
          patientId: d.patientId || rawTask.patientId || '',
          helperName: d.helperName || rawTask.helperName,
          helperId: d.helperId || rawTask.assignedHelperId || rawTask.helperId,
          pickupAddress: rawTask.pickupAddress || rawTask.hospital || d.pickupAddress || '',
          deliveryAddress: rawTask.dropoffAddress || rawTask.deliveryAddress || d.deliveryAddress || '',
          amount: rawTask.price || rawTask.amount || d.amount || 0,
          status: (d.status as TaskProgressStep) || (rawTask.progressStep as TaskProgressStep) || 'pending',
          priority: rawTask.isUrgent ? 'high' : 'medium',
          createdAt: d.acceptedAt?.seconds 
            ? new Date(d.acceptedAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : (rawTask.createdAt?.seconds 
              ? new Date(rawTask.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              : 'Today'),
          proofImageUrl: rawTask.attachmentUrl,
        });
      });
      this.tasks = fetchedTasks;
    }
  }

  private updateDerivedMetrics() {
    this.metrics.totalUsers = this.users.length;
    this.metrics.activeHelpers = this.helpers.length;
    this.metrics.onlineHelpersCount = this.helpers.filter(h => h.status === 'online').length;
    this.metrics.pendingVerifications = this.helpers.filter(h => h.verificationStatus === 'Pending').length;
    this.metrics.activeTasks = this.tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;
    this.metrics.completedTasks = this.tasks.filter(t => t.status === 'completed').length;
    this.metrics.supportTickets = this.tickets.length;
    this.metrics.unresolvedTicketsCount = this.tickets.filter(t => t.status === 'open' || t.status === 'in_review').length;
    
    const totalRev = this.transactions.reduce((sum, t) => sum + t.grossAmount, 0);
    this.metrics.todayRevenue = `Rs. ${totalRev.toFixed(2)}`;
    this.metrics.totalTransactions = `Rs. ${totalRev.toFixed(2)}`;
  }

  public getMetrics(): OverviewMetrics {
    return { ...this.metrics };
  }

  public getUsers(searchQuery = '', statusFilter = 'All'): User[] {
    return this.users.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery);

      if (!matchesSearch) return false;
      if (statusFilter === 'All') return true;
      if (statusFilter === 'Active') return user.status === 'active';
      if (statusFilter === 'Suspended') return user.status === 'suspended';
      if (statusFilter === 'Guardian') return user.type === 'guardian';
      if (statusFilter === 'Patient') return user.type === 'patient';
      return true;
    });
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public async toggleUserStatus(userId: string): Promise<User | undefined> {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      const newStatus = user.status === 'active' ? 'suspended' : 'active';
      user.status = newStatus;
      
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          verificationStatus: newStatus === 'suspended' ? 'Rejected' : 'Verified',
        });
      } catch (err) {
        console.warn('Firestore user status update error:', err);
      }
      
      this.addAuditLog(`Toggled user status to ${newStatus}`, `${user.name} (${user.id})`, 'suspension');
      this.notifySubscribers();
    }
    return user;
  }

  public async addUser(userData: Omit<User, 'id' | 'joinedDate' | 'tasksCount'>): Promise<User> {
    const newId = `USR-${Math.floor(100 + Math.random() * 900)}`;
    const newUser: User = {
      ...userData,
      id: newId,
      joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      tasksCount: 0,
    };
    
    this.users.unshift(newUser);

    try {
      const userRef = doc(db, 'users', newId);
      await updateDoc(userRef, {
        fullName: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.type,
        createdAt: serverTimestamp(),
        verificationStatus: 'Verified',
      });
    } catch (err) {
      console.warn('Firestore add user warning:', err);
    }

    this.updateDerivedMetrics();
    this.addAuditLog('Created new user account', `${newUser.name} (${newUser.id})`, 'verification');
    this.notifySubscribers();
    return newUser;
  }

  public getHelpers(searchQuery = '', filterTab = 'All'): Helper[] {
    return this.helpers.filter((helper) => {
      const matchesSearch = 
        helper.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        helper.phone.includes(searchQuery) ||
        helper.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (filterTab === 'All') return true;
      if (filterTab === 'Online') return helper.status === 'online';
      if (filterTab === 'Pending Verification') return helper.verificationStatus === 'Pending';
      if (filterTab === 'Verified') return helper.verificationStatus === 'Verified';
      if (filterTab === 'Suspended') return helper.status === 'suspended';
      return true;
    });
  }

  public async verifyHelper(helperId: string): Promise<Helper | undefined> {
    const helper = this.helpers.find((h) => h.id === helperId);
    if (helper) {
      helper.verificationStatus = 'Verified';
      helper.status = 'online';
      
      try {
        const userRef = doc(db, 'users', helperId);
        await updateDoc(userRef, {
          verificationStatus: 'Verified',
          isOnline: true,
        });
      } catch (err) {
        console.warn('Firestore helper verification update error:', err);
      }

      this.updateDerivedMetrics();
      this.addAuditLog('Approved helper verification', `${helper.name} (${helper.id})`, 'verification');
      this.notifySubscribers();
    }
    return helper;
  }

  public async rejectHelper(helperId: string): Promise<Helper | undefined> {
    const helper = this.helpers.find((h) => h.id === helperId);
    if (helper) {
      helper.verificationStatus = 'Rejected';
      helper.status = 'suspended';

      try {
        const userRef = doc(db, 'users', helperId);
        await updateDoc(userRef, {
          verificationStatus: 'Rejected',
          isOnline: false,
        });
      } catch (err) {
        console.warn('Firestore helper rejection update error:', err);
      }

      this.updateDerivedMetrics();
      this.addAuditLog('Rejected helper application', `${helper.name} (${helper.id})`, 'verification');
      this.notifySubscribers();
    }
    return helper;
  }

  public getTasks(searchQuery = '', statusFilter = 'All'): Task[] {
    return this.tasks.filter((task) => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.helperName && task.helperName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        task.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === 'All') return true;
      if (statusFilter === 'Active') return task.status !== 'completed' && task.status !== 'cancelled';
      if (statusFilter === 'Completed') return task.status === 'completed';
      if (statusFilter === 'Pending') return task.status === 'pending';
      return true;
    });
  }

  public getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  public async simulateRefund(transactionId: string): Promise<Transaction | undefined> {
    const txn = this.transactions.find((t) => t.id === transactionId);
    if (txn) {
      txn.status = 'refunded';
      try {
        await updateDoc(doc(db, 'payments', transactionId), {
          status: 'refunded',
        });
      } catch (err) {
        console.warn('Firestore payment refund update error:', err);
      }
      this.addAuditLog('Processed refund', `Task ${txn.taskId} (Gross Rs. ${txn.grossAmount})`, 'refund');
      this.notifySubscribers();
    }
    return txn;
  }

  public async simulatePayout(transactionId: string): Promise<Transaction | undefined> {
    const txn = this.transactions.find((t) => t.id === transactionId);
    if (txn) {
      txn.status = 'payout_disbursed';
      txn.disbursedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      try {
        await updateDoc(doc(db, 'payments', transactionId), {
          status: 'released',
          releasedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Firestore payment payout update error:', err);
      }
      this.addAuditLog('Disbursed payout to helper', `${txn.helperName} (Net Rs. ${txn.netHelperEarnings})`, 'payout');
      this.notifySubscribers();
    }
    return txn;
  }

  public getTickets(): SupportTicket[] {
    return [...this.tickets];
  }

  public async addTicketMessage(ticketId: string, messageText: string, senderName = 'CareDrop Support'): Promise<TicketMessage | undefined> {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) return undefined;

    const newMessage: TicketMessage = {
      id: `MSG-${Date.now()}`,
      sender: 'admin',
      senderName,
      message: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (!ticket.messages) {
      ticket.messages = [];
    }
    ticket.messages.push(newMessage);

    try {
      const messagesRef = collection(db, 'support_tickets', ticketId, 'messages');
      await addDoc(messagesRef, {
        sender: 'admin',
        senderRole: 'admin',
        senderName,
        message: messageText,
        body: messageText,
        createdAt: serverTimestamp(),
      });

      const ticketRef = doc(db, 'support_tickets', ticketId);
      await updateDoc(ticketRef, {
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firestore ticket message creation warning:', err);
    }

    this.addAuditLog('Sent message on ticket', `${ticket.id} - ${ticket.userName}`, 'ticket');
    this.notifySubscribers();
    return newMessage;
  }

  public async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<SupportTicket | undefined> {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.status = status;
      if (status === 'resolved' || status === 'closed') {
        ticket.resolvedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      try {
        const ticketRef = doc(db, 'support_tickets', ticketId);
        const updateData: Record<string, any> = { status };
        if (status === 'resolved' || status === 'closed') {
          updateData.resolvedAt = serverTimestamp();
        }
        await updateDoc(ticketRef, updateData);
      } catch (err) {
        console.warn('Firestore ticket status update error:', err);
      }

      this.updateDerivedMetrics();
      this.addAuditLog(`Updated ticket status to ${status}`, `${ticket.id} - ${ticket.userName}`, 'ticket');
      this.notifySubscribers();
    }
    return ticket;
  }

  public async resolveTicket(ticketId: string, response: string): Promise<SupportTicket | undefined> {
    await this.addTicketMessage(ticketId, response);
    return this.updateTicketStatus(ticketId, 'resolved');
  }

  public getAuditLogs(): ActivityLog[] {
    return [...this.logs];
  }

  // --- Admin Management ---

  public getAdmins(): AdminRecord[] {
    const adminUsers: AdminRecord[] = this.users
      .filter((u) => u.type === 'admin' || u.type === 'superadmin')
      .map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        addedAt: u.joinedDate || 'Active',
        role: u.type,
      }));

    const existingEmails = new Set(adminUsers.map((a) => a.email.toLowerCase()));

    const customAdmins = this.admins
      .filter((a) => !existingEmails.has(a.email.toLowerCase()))
      .map((a) => ({
        ...a,
        role: a.role || 'admin',
      }));

    return [...adminUsers, ...customAdmins];
  }

  public async addAdmin(email: string): Promise<void> {
    const trimmed = email.trim().toLowerCase();
    const existing = this.getAdmins();
    if (!trimmed || existing.some((a) => a.email.toLowerCase() === trimmed)) return;

    // Persist to Firestore 'admins' collection for server-side rule enforcement
    await addDoc(collection(db, 'admins'), {
      email: trimmed,
      name: trimmed.split('@')[0],
      role: 'admin',
      addedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });

    // Optimistic local update so UI reflects immediately
    this.admins.push({
      id: `admin-${Date.now()}`,
      email: trimmed,
      name: trimmed.split('@')[0],
      addedAt: new Date().toLocaleDateString(),
      role: 'admin',
    });

    this.addAuditLog(`Granted admin access to ${trimmed}`, trimmed, 'settings');
    this.notifySubscribers();
  }

  public async removeAdmin(id: string): Promise<void> {
    const allAdmins = this.getAdmins();
    const target = allAdmins.find((a) => a.id === id);
    if (!target) return;

    try {
      await doc(db, 'admins', id);
    } catch {
      // No-op for non-Firestore entries
    }

    this.admins = this.admins.filter((a) => a.id !== id && a.email.toLowerCase() !== target.email.toLowerCase());
    this.addAuditLog(`Revoked admin access from ${target.email}`, target.email, 'settings');
    this.notifySubscribers();
  }

  private addAuditLog(action: string, target: string, type: ActivityLog['type']) {
    this.logs.unshift({
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      adminName: 'Super Admin',
      action,
      target,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
    });
  }
}

export const dataService = new LiveDataService();
