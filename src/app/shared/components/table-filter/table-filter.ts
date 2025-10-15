import { Component, input, output, signal, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'number';
  placeholder?: string;
  options?: { value: any; label: string }[];
  width?: string;
}

export interface FilterValue {
  [key: string]: unknown;
}

@Component({
  selector: 'app-table-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './table-filter.html',
  styleUrls: ['./table-filter.css'],
})
export class TableFilter {
  readonly fields = input<FilterField[]>([]);
  readonly values = input<FilterValue>({});
  readonly placeholder = input<string>('Search...');
  readonly showClearAll = input<boolean>(true);
  readonly debounceTime = input<number>(300);

  readonly filterChange = output<FilterValue>();
  readonly filterImmediateChange = output<FilterValue>();
  readonly filterClear = output<void>();

  private readonly currentValues = signal<Record<string, unknown>>({});
  private readonly filterSubject = new Subject<FilterValue>();
  private isExternalUpdate = false;

  constructor() {
    this.filterSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => {
          return (
            Object.keys(a).length === Object.keys(b).length &&
            Object.keys(a).every((k) => a[k] === b[k])
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe((values) => {
        if (!this.isExternalUpdate) {
          this.filterChange.emit(values);
        }
      });

    effect(() => {
      const externalValues = structuredClone(this.values());
      this.isExternalUpdate = true;
      this.currentValues.set(externalValues);
      queueMicrotask(() => {
        this.isExternalUpdate = false;
      });
    });
  }

  public onFieldChange(key: string, value: unknown): void {
    const current = { ...this.currentValues() };

    if (value === null || value === undefined || value === '') {
      delete current[key];
    } else {
      current[key] = value;
    }

    this.currentValues.set(current);

    if (!this.isExternalUpdate) {
      const field = this.fields().find((f) => f.key === key);

      if (field && (field.type === 'select' || field.type === 'date')) {
        this.filterImmediateChange.emit(current);
      } else {
        this.filterSubject.next(current);
      }
    }
  }

  public clearField(key: string): void {
    const current = { ...this.currentValues() };
    delete current[key];
    this.currentValues.set(current);

    if (!this.isExternalUpdate) {
      this.filterSubject.next(current);
    }
  }

  public clearAll(): void {
    const emptyFilters = {};
    this.currentValues.set(emptyFilters);

    this.filterClear.emit();
  }

  public hasActiveFilters(): boolean {
    return Object.keys(this.currentValues()).length > 0;
  }

  public getActiveFilterCount(): number {
    return Object.keys(this.currentValues()).length;
  }

  public getFieldValue(key: string): unknown {
    return this.currentValues()[key] ?? '';
  }
}
