import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AfterViewInit,
  Component,
  ViewChild,
  inject,
  input,
  computed,
  output,
  TemplateRef,
  contentChild,
  DestroyRef,
  effect,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

export interface TableColumn<T = object> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  width?: string;
  sticky?: 'start' | 'end';
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
  cellTemplate?: TemplateRef<unknown>;
  format?: (value: unknown, row: T) => string;
  cellClass?: string | ((value: unknown, row: T) => string);
}

export interface TableConfig {
  enableSelection?: boolean;
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableRowClick?: boolean;
  enableRowHover?: boolean;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  stickyHeader?: boolean;
  showFirstLastButtons?: boolean;
  noDataMessage?: string;
  loadingMessage?: string;
}

@Component({
  selector: 'app-base-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './base-table.html',
})
export class BaseTable<T extends object> implements AfterViewInit {
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly destroyRef = inject(DestroyRef);

  readonly data = input<T[]>([]);

  readonly columns = input<TableColumn<T>[]>([]);

  readonly config = input<TableConfig>({
    enableSelection: true,
    enablePagination: true,
    enableSorting: true,
    enableRowClick: true,
    enableRowHover: true,
    pageSizeOptions: [5, 10, 20, 50],
    defaultPageSize: 10,
    stickyHeader: true,
    showFirstLastButtons: true,
    noDataMessage: 'No data available',
  });

  readonly actionsTemplate = contentChild<TemplateRef<unknown>>('actions');

  readonly rowClick = output<T>();
  readonly selectionChange = output<T[]>();
  readonly sortChange = output<Sort>();
  readonly pageChange = output<PageEvent>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<T>();
  selection = new SelectionModel<T>(true, []);

  readonly displayedColumns = computed(() => {
    const cols = this.columns()
      .filter((col) => !col.hidden)
      .map((col) => col.key);

    const result: string[] = [];

    if (this.config().enableSelection) {
      result.push('select');
    }

    result.push(...cols);

    if (this.actionsTemplate()) {
      result.push('actions');
    }

    return result;
  });

  constructor() {
    this.selection.changed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.selectionChange.emit(this.selection.selected);
    });

    effect(() => {
      this.dataSource.data = this.data();
    });
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      if (this.config().enablePagination && this.paginator) {
        this.dataSource.paginator = this.paginator;
        this.paginator.pageSize = this.config().defaultPageSize ?? 10;
      }

      if (this.config().enableSorting && this.sort) {
        this.dataSource.sort = this.sort;
      }
    });
  }

  public applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  protected isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows && numRows > 0;
  }

  protected toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.dataSource.data);
    }
  }

  protected checkboxLabel(row?: T): string {
    if (!row) {
      return `${this.isAllSelected() ? 'Deselect' : 'Select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'Deselect' : 'Select'} row`;
  }

  protected clearSelection(): void {
    this.selection.clear();
  }

  protected onRowClick(event: Event, row: T): void {
    const target = event.target as HTMLElement;
    if (
      target.closest('mat-checkbox') ||
      target.closest('.row-actions') ||
      target.closest('button')
    ) {
      return;
    }

    if (this.config().enableRowClick) {
      this.rowClick.emit(row);
    }
  }

  protected onRowKeydown(event: KeyboardEvent, row: T): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.rowClick.emit(row);
    }
  }

  protected announceSortChange(sortState: Sort): void {
    if (sortState.direction) {
      this.liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this.liveAnnouncer.announce('Sorting cleared');
    }

    this.sortChange.emit(sortState);
  }

  protected onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  protected getCellValue(row: T, column: TableColumn<T>): string {
    const value = (row as Record<string, unknown>)[column.key];

    if (column.format) {
      return column.format(value, row);
    }

    return value !== null && value !== undefined ? String(value) : '';
  }

  protected getCellClass(row: T, column: TableColumn<T>): string {
    if (typeof column.cellClass === 'function') {
      return column.cellClass((row as Record<string, unknown>)[column.key], row);
    }
    return column.cellClass ?? '';
  }

  protected getSelectionCount(): number {
    return this.selection.selected.length;
  }

  protected hasData(): boolean {
    return this.dataSource.data.length > 0;
  }

  public exportSelected(): T[] {
    return this.selection.selected;
  }

  public refresh(): void {
    this.dataSource.data = [...this.data()];
  }
}
