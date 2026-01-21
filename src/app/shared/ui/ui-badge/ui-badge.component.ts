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
  @Input() variant: 'default' | 'outline' | 'secondary' = 'default';

  getClasses(): string {
    switch (this.variant) {
      case 'default':
        return 'bg-[var(--color-primary)] text-white';
      case 'secondary':
        return 'bg-slate-100 text-slate-800';
      case 'outline':
        return 'text-slate-900 ring-1 ring-inset ring-slate-200';
      default:
        return 'bg-[var(--color-primary)] text-white';
    }
  }
}
