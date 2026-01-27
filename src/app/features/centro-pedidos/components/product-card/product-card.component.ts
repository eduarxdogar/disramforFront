import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UiCardComponent } from '../../../../shared/ui/ui-card/ui-card.component';
import { UiBadgeComponent } from '../../../../shared/ui/ui-badge/ui-badge.component';
import { UiButtonComponent } from '../../../../shared/ui/ui-button/ui-button.component';
import { Producto } from '../../../../model/producto.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, UiCardComponent, UiBadgeComponent, UiButtonComponent],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Producto;
  
  // Internal State
  isAdding = signal(false);
  quantity = signal(1);

  @Input() 
  set initialQuantity(q: number) {
    if (q > 0) {
      this.isAdding.set(true);
      this.quantity.set(q);
    } else {
      this.isAdding.set(false);
      this.quantity.set(1); // Reset for next time
    }
  }
  
  @Output() quantityChange = new EventEmitter<{ product: Producto, quantity: number }>();

  startAdding(): void {
    this.isAdding.set(true);
    this.quantity.set(1);
    this.emitChange(1);
  }

  increment(): void {
    this.quantity.update(v => v + 1);
    this.emitChange(this.quantity());
  }

  decrement(): void {
    if (this.quantity() > 1) {
      this.quantity.update(v => v - 1);
      this.emitChange(this.quantity());
    } else {
      // Back to "Add" button state
      this.isAdding.set(false);
      this.emitChange(0); // 0 means remove from cart
    }
  }

  private emitChange(qty: number): void {
    this.quantityChange.emit({ product: this.product, quantity: qty });
  }
}
