import { Component, ElementRef, ViewChild, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-table-filter',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './table-filter.html',
})
export class TableFilterComponent {
  readonly placeholder = input<string>('Filter...');
  readonly filterChange = output<string>();

  @ViewChild('filterInput') filterInput!: ElementRef<HTMLInputElement>;

  protected onFilterChange(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterChange.emit(filterValue.trim().toLowerCase());
  }

  public getValue(): string {
    return this.filterInput?.nativeElement?.value ?? '';
  }

  public clear(): void {
    if (this.filterInput) {
      this.filterInput.nativeElement.value = '';
      this.filterChange.emit('');
    }
  }
}
