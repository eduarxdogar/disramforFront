import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [ngClass]="getClasses()"
      [disabled]="disabled"
      class="inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: []
})
export class UiButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() fullWidth = false;

  getClasses(): string {
    const baseClasses = 'rounded-lg';
    let variantClasses = '';
    let sizeClasses = '';
    let widthClass = this.fullWidth ? 'w-full' : '';

    switch (this.variant) {
      case 'primary':
        variantClasses = 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] focus:ring-[var(--color-primary)]';
        break;
      case 'secondary':
        variantClasses = 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-500';
        break;
      case 'outline':
        variantClasses = 'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-slate-500';
        break;
      case 'ghost':
        variantClasses = 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500';
        break;
    }

    switch (this.size) {
      case 'sm':
        sizeClasses = 'h-8 px-3 text-xs';
        break;
      case 'md':
        sizeClasses = 'h-10 px-4 text-sm';
        break;
      case 'lg':
        sizeClasses = 'h-12 px-6 text-base';
        break;
    }

    return `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass}`;
  }
}
