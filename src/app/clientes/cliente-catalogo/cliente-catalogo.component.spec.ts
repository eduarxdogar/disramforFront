import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteCatalogoComponent } from './cliente-catalogo.component';

describe('ClienteCatalogoComponent', () => {
  let component: ClienteCatalogoComponent;
  let fixture: ComponentFixture<ClienteCatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteCatalogoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
