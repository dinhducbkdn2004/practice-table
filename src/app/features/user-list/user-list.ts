import { BaseTable, TableColumn } from '../../shared/components/base-table/base-table';
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableFilterComponent } from '../../shared/components/table-filter/table-filter';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.html',
  imports: [
    BaseTable,
    TableFilterComponent,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
})
export class UserListComponent {
  @ViewChild('tableRef') tableRef!: BaseTable<User>;

  users: User[] = [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', role: 'Admin' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', role: 'User' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', role: 'Editor' },
    { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com', role: 'User' },
    { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@example.com', role: 'Admin' },
    { id: 6, name: 'Đặng Thị F', email: 'dangthif@example.com', role: 'Editor' },
    { id: 7, name: 'Vũ Văn G', email: 'vuvang@example.com', role: 'User' },
    { id: 8, name: 'Bùi Thị H', email: 'buithih@example.com', role: 'User' },
    { id: 9, name: 'Đỗ Văn I', email: 'dovani@example.com', role: 'Admin' },
    { id: 10, name: 'Lý Thị K', email: 'lythik@example.com', role: 'Editor' },
    { id: 11, name: 'Nguyễn Văn L', email: 'nguyenvanal@example.com', role: 'Admin' },
    { id: 12, name: 'Trần Thị M', email: 'tranthimb@example.com', role: 'User' },
    { id: 13, name: 'Lê Văn N', email: 'levann@example.com', role: 'Editor' },
    { id: 14, name: 'Phạm Thị O', email: 'phamtho@example.com', role: 'User' },
    { id: 15, name: 'Hoàng Văn P', email: 'hoangvanp@example.com', role: 'Admin' },
    { id: 16, name: 'Đặng Thị Q', email: 'dangthiq@example.com', role: 'Editor' },
    { id: 17, name: 'Vũ Văn R', email: 'vuvanr@example.com', role: 'User' },
    { id: 18, name: 'Bùi Thị S', email: 'buithis@example.com', role: 'User' },
    { id: 19, name: 'Đỗ Văn T', email: 'dovat@example.com', role: 'Admin' },
    { id: 20, name: 'Lý Thị U', email: 'lythiu@example.com', role: 'Editor' },
  ];

  columns: TableColumn<User>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: false },
  ];

  tableConfig = {
    enableSelection: true,
    enablePagination: true,
    enableSorting: true,
  };

  onEdit(user: User): void {
    console.log('Edit', user);
  }

  onDelete(user: User): void {
    console.log('Delete', user);
  }

  onView(user: User): void {
    console.log('View', user);
  }
}