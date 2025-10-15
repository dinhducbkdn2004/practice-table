import { TableConfig, BaseTable, TableColumn } from '../../shared/components/base-table/base-table';
import {
  TableFilter,
  FilterField,
  FilterValue,
} from '../../shared/components/table-filter/table-filter';
import { Component, signal, computed } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface UserFilters {
  search?: string;
  role?: string;
  status?: 'active' | 'inactive';
  createdAt?: string | Date;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BaseTable, TableFilter, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected isLoading = false;
  protected readonly currentFilters = signal<UserFilters>({});

  // Convert UserFilters to FilterValue for the table-filter component
  protected readonly currentFilterValues = computed((): FilterValue => {
    const filters = this.currentFilters();
    return {
      search: filters.search ?? '',
      role: filters.role ?? '',
      status: filters.status ?? '',
      createdAt: filters.createdAt ?? '',
    };
  });

  // Utility method to convert FilterValue to UserFilters
  private convertToUserFilters(filters: FilterValue): UserFilters {
    const userFilters: UserFilters = {};

    if (filters['search']) {
      userFilters.search = filters['search'] as string;
    }
    if (filters['role']) {
      userFilters.role = filters['role'] as string;
    }
    if (filters['status']) {
      userFilters.status = filters['status'] as 'active' | 'inactive';
    }
    if (filters['createdAt']) {
      userFilters.createdAt = filters['createdAt'] as string | Date;
    }

    return userFilters;
  }

  // Raw data
  private readonly allUsers: User[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-01',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'user',
      status: 'active',
      createdAt: '2024-01-02',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'user',
      status: 'inactive',
      createdAt: '2024-01-03',
    },
    {
      id: 4,
      name: 'Alice Williams',
      email: 'alice@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-04',
    },
    {
      id: 5,
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      role: 'user',
      status: 'inactive',
      createdAt: '2024-01-05',
    },
  ];

  // Computed filtered users based on current filters
  protected readonly users = computed(() => {
    const filters = this.currentFilters();
    let filtered = [...this.allUsers];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)
      );
    }

    // Apply role filter
    if (filters.role) {
      filtered = filtered.filter((user) => user.role === filters.role);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((user) => user.status === filters.status);
    }

    // Apply date filter
    if (filters.createdAt) {
      const filterDate = new Date(filters.createdAt).toISOString().split('T')[0];
      filtered = filtered.filter((user) => user.createdAt === filterDate);
    }

    return filtered;
  });

  protected readonly filterFields: FilterField[] = [
    { key: 'search', label: 'Search', type: 'text', placeholder: 'Search by name or email...' },
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    { key: 'createdAt', label: 'Created Date', type: 'date' },
  ];

  protected readonly columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, width: '80px' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      format: (value) => (value === 'active' ? 'Active' : 'Inactive'),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
      format: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  protected readonly tableConfig: TableConfig = {
    pageSizeOptions: [5, 10, 20],
    defaultPageSize: 5,
    enableSelection: true,
    enablePagination: true,
    enableSorting: true,
    enableRowClick: true,
  };

  protected onRowClick(user: User): void {
    console.log('Row clicked:', user);
    alert(`Clicked on user: ${user.name}`);
  }

  protected onSelectionChange(selectedUsers: User[]): void {
    console.log('Selection changed:', selectedUsers);
  }

  protected onFilterChange(filterValue: string): void {
    console.log('Filter changed:', filterValue);
    // Apply local filtering logic here
  }

  protected onTableFilterChange(filters: FilterValue): void {
    console.log('Table filter changed (debounced):', filters);
    this.isLoading = true;

    // Simulate API call delay for debounced changes
    setTimeout(() => {
      this.currentFilters.set(this.convertToUserFilters(filters));
      this.isLoading = false;
    }, 300);
  }

  protected onTableFilterImmediateChange(filters: FilterValue): void {
    console.log('Table filter changed (immediate):', filters);
    // Apply immediately for select/date fields
    this.currentFilters.set(this.convertToUserFilters(filters));
  }

  protected onFilterClear(): void {
    console.log('All filters cleared');
    this.currentFilters.set({});
  }

  protected onSortChange(sort: Sort): void {
    console.log('Sort changed:', sort);
    // Implement sorting logic here
  }

  protected onPageChange(pageEvent: PageEvent): void {
    console.log('Page changed:', pageEvent);
    // Implement pagination logic here
  }

  protected onEditUser(user: User): void {
    console.log('Edit user:', user);
    alert(`Edit user: ${user.name}`);
  }

  protected onDeleteUser(user: User): void {
    console.log('Delete user:', user);
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      // Implement delete logic here
      alert(`Deleted user: ${user.name}`);
    }
  }

  protected onViewUser(user: User): void {
    console.log('View user:', user);
    alert(`View details for: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}`);
  }

  // Method to test loading state
  protected testLoading(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  // Method to clear all data for testing empty state
  protected clearAllFilters(): void {
    this.currentFilters.set({ search: 'nonexistentuser' }); // Set filter that matches no data
  }
}
