import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucidePlus, LucideX } from '@lucide/angular';

type TransactionFormField = 'title' | 'type' | 'category' | 'amount' | 'date';

interface TransactionFormData {
  title: string;
  type: 'income' | 'expense';
  category: string;
  amount: number | string;
  date: string;
}

@Component({
  selector: 'app-transaction-form-modal',
  standalone: true,
  imports: [LucidePlus, LucideX],
  templateUrl: './transaction-form-modal.html',
})
export class TransactionFormModal {
  @Input({ required: true }) newTransaction!: TransactionFormData;
  @Input({ required: true }) categories: string[] = [];
  @Input() editingTransactionId: string | null = null;
  @Input() isSaving = false;
  @Input() currencySymbol = '$';

  @Output() fieldChange = new EventEmitter<{
    field: TransactionFormField;
    value: string;
  }>();

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  updateField(field: TransactionFormField, value: string): void {
    this.fieldChange.emit({ field, value });
  }

  submitForm(event: Event): void {
    event.preventDefault();

    if (!this.isSaving) {
      this.save.emit();
    }
  }
}
