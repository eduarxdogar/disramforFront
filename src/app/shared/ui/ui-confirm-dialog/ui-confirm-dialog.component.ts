import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UiButtonComponent } from '../ui-button/ui-button.component';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

@Component({
  selector: 'app-ui-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, UiButtonComponent],
  template: `
    <div class="p-6 bg-white rounded-xl max-w-md w-full mx-auto">
      <h2 class="text-xl font-bold text-slate-900 mb-2">{{ data.title }}</h2>
      <p class="text-slate-600 mb-6 leading-relaxed">{{ data.message }}</p>
      
      <div class="flex justify-end gap-3">
        <app-ui-button variant="ghost" (click)="onDismiss()">
          {{ data.cancelText || 'Cancelar' }}
        </app-ui-button>
        
        <app-ui-button 
          variant="primary" 
          [class]="data.isDestructive ? '!bg-red-600 !hover:bg-red-700 !shadow-red-900/20' : ''"
          (click)="onConfirm()">
          {{ data.confirmText || 'Confirmar' }}
        </app-ui-button>
      </div>
    </div>
  `,
  styles: []
})
export class UiConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UiConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
