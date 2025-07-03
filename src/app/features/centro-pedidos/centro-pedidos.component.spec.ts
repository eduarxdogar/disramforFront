import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentroPedidosComponent } from './centro-pedidos.component';

describe('CentroPedidosComponent', () => {
  let component: CentroPedidosComponent;
  let fixture: ComponentFixture<CentroPedidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentroPedidosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CentroPedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
