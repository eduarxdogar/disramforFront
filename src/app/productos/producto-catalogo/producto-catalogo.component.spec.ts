import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoCatalogoComponent } from './producto-catalogo.component';

describe('ProductoCatalogoComponent', () => {
  let component: ProductoCatalogoComponent;
  let fixture: ComponentFixture<ProductoCatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoCatalogoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductoCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
