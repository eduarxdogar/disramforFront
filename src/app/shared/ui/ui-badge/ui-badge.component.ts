import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      [ngClass]="getClasses()"
    >
      <ng-content></ng-content>
    </span>
  `,
  styles: []
})
export class UiBadgeComponent {
  @Input() variant: 'default' | 'outline' | 'secondary' | 'success' | 'warning' | 'destructive' = 'default';

  getClasses(): string {
    switch (this.variant) {
      case 'default':
        return 'bg-[var(--color-primary)] text-white';
      case 'secondary':
        return 'bg-slate-100 text-slate-800';
      case 'outline':
        return 'text-slate-900 ring-1 ring-inset ring-slate-200';
      case 'success':
        return 'bg-emerald-100 text-emerald-700';
      case 'warning':
        return 'bg-amber-100 text-amber-700';
      case 'destructive':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-[var(--color-primary)] text-white';
    }
  }
}
