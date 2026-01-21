import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ui-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="bg-[var(--bg-surface)] rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col relative group transition-all duration-300 hover:shadow-md">
      
      <!-- Image Header (only if image input is provided) -->
      <div *ngIf="image" class="h-48 w-full bg-white flex items-center justify-center overflow-hidden border-b border-slate-100 relative">
        
        <!-- Image with Error Handling -->
        <img 
          *ngIf="!imageError()" 
          [src]="image" 
          [alt]="alt" 
          (error)="handleImageError()" 
          class="object-contain h-full w-full p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        >

        <!-- Fallback Icon if Error -->
        <div *ngIf="imageError()" class="flex flex-col items-center justify-center text-slate-300">
           <mat-icon class="!h-12 !w-12 !text-[48px] leading-none">image_not_supported</mat-icon>
        </div>

        <!-- Badge Slot (Projected Content) -->
        <div class="absolute top-3 right-3 z-10">
          <ng-content select="[card-badge]"></ng-content>
        </div>
      </div>

      <!-- Card Body -->
      <div class="p-4 flex flex-col flex-1">
        <ng-content></ng-content>
      </div>

    </div>
  `,
  styles: []
})
export class UiCardComponent {
  @Input() image?: string;
  @Input() alt: string = '';

  imageError = signal(false);

  handleImageError() {
    this.imageError.set(true);
  }
}
