export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: 'Admin' | 'Librarian' | 'Member';
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  categoryId: string;
  categoryName: string;
  publisher: string;
  publishYear: number;
  totalCopies: number;
  availableCopies: number;
  location: string;
  coverImageUrl: string;
  description: string;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BorrowRecord {
  id: string;
  userId: string;
  userName: string;
  userFullName: string;
  bookId: string;
  bookTitle: string;
  bookCoverUrl: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: 'Borrowed' | 'Returned' | 'Overdue' | 'Lost';
  notes: string;
  estimatedFine?: number | null;
  createdAt: string;
}

export interface Fine {
  id: string;
  borrowRecordId: string;
  userId: string;
  userFullName: string;
  bookTitle: string;
  amount: number;
  reason: string;
  status: 'Pending' | 'Paid';
  paidAt?: string | null;
  createdAt: string;
}

export interface RecentLoan {
  id: string;
  bookTitle: string;
  userFullName: string;
  borrowDate: string;
  dueDate: string;
  status: string;
}

export interface TopBook {
  bookId: string;
  title: string;
  author: string;
  coverImageUrl: string;
  borrowCount: number;
}

export interface DashboardStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  totalUsers: number;
  totalMembers: number;
  activeLoans: number;
  overdueLoans: number;
  totalFineCollected: number;
  totalPendingFines: number;
  recentLoans: RecentLoan[];
  topBorrowedBooks: TopBook[];
}
