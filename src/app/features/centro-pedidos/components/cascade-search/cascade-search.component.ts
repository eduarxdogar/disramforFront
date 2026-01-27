import { Component, computed, effect, inject, output, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap, tap, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { CatalogService } from '../../../../service/catalog.service';
import { SearchCriteria } from '../../../../model/catalog.model';
import { UiButtonComponent } from '../../../../shared/ui/ui-button/ui-button.component';
import { UiConfirmDialogComponent } from '../../../../shared/ui/ui-confirm-dialog/ui-confirm-dialog.component';

@Component({
  selector: 'app-cascade-search',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    FormsModule, 
    UiButtonComponent, 
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './cascade-search.component.html',
})
export class CascadeSearchComponent {
  private catalogService = inject(CatalogService);
  private dialog = inject(MatDialog);

  // -- Outputs --
  filterChange = output<SearchCriteria>();

  // -- Search Text Control (Debounced) --
  searchControl = new FormControl('');

  // -- State Signals (Selections) --
  selectedType = signal<string | null>(null);
  selectedBrand = signal<string | null>(null);
  selectedModel = signal<string | null>(null);
  selectedEngine = signal<string | null>(null);

  // -- Loading States --
  loadingTypes = signal(false);
  loadingBrands = signal(false);
  loadingModels = signal(false);
  loadingEngines = signal(false);

  // -- Resources (Async String Arrays) --
  types$ = this.catalogService.getTypes().pipe(tap(() => this.loadingTypes.set(false)));
  types = toSignal(this.types$, { initialValue: [] });

  private brands$ = toObservable(this.selectedType).pipe(
    tap(() => this.loadingBrands.set(true)),
    switchMap(type => type ? this.catalogService.getBrands(type) : of([])),
    tap(() => this.loadingBrands.set(false))
  );
  brands = toSignal(this.brands$, { initialValue: [] });

  private models$ = toObservable(
    computed(() => ({ type: this.selectedType(), brand: this.selectedBrand() }))
  ).pipe(
    tap(() => this.loadingModels.set(true)),
    switchMap(({ type, brand }) => (type && brand) ? this.catalogService.getModels(type, brand) : of([])),
    tap(() => this.loadingModels.set(false))
  );
  models = toSignal(this.models$, { initialValue: [] });

  private engines$ = toObservable(
    computed(() => ({ type: this.selectedType(), brand: this.selectedBrand(), model: this.selectedModel() }))
  ).pipe(
    tap(() => this.loadingEngines.set(true)),
    switchMap(({ type, brand, model }) => (type && brand && model) ? this.catalogService.getEngines(type, brand, model) : of([])),
    tap(() => this.loadingEngines.set(false))
  );
  engines = toSignal(this.engines$, { initialValue: [] });


  constructor() {
    this.loadingTypes.set(true);

    // 1. Text Search Subscription (Debounced)
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => this.emitFilters());

    // 2. Cascade Reset Effects (Untracked downstream resets)
    effect(() => {
      this.selectedType(); 
      untracked(() => {
        this.selectedBrand.set(null);
        this.selectedModel.set(null);
        this.selectedEngine.set(null);
        this.emitFilters(); // Auto-search on change
      });
    });

    effect(() => {
      this.selectedBrand(); 
      untracked(() => {
        this.selectedModel.set(null);
        this.selectedEngine.set(null);
        this.emitFilters();
      });
    });

    effect(() => {
      this.selectedModel(); 
      untracked(() => {
        this.selectedEngine.set(null);
        this.emitFilters();
      });
    });

    effect(() => {
      this.selectedEngine();
      untracked(() => {
        this.emitFilters();
      });
    });
  }

  // -- Logic --
  updateFilter(signalName: 'selectedType' | 'selectedBrand' | 'selectedModel' | 'selectedEngine', value: any): void {
    // We set the signal, and the effect will handle the rest (reset + emit)
    // Note: 'value' comes from DOM event as string or null
    // Need to cast appropriately
    const val = value === 'null' ? null : value;
    
    if (signalName === 'selectedType') this.selectedType.set(val);
    if (signalName === 'selectedBrand') this.selectedBrand.set(val);
    if (signalName === 'selectedModel') this.selectedModel.set(val);
    if (signalName === 'selectedEngine') this.selectedEngine.set(val);
  }

  emitFilters(): void {
    const criteria: SearchCriteria = {
      type: this.selectedType(),
      brand: this.selectedBrand(),
      model: this.selectedModel(),
      engine: this.selectedEngine(),
      term: this.searchControl.value
    };
    this.filterChange.emit(criteria);
  }

  onClearFilters(): void {
    this.dialog.open(UiConfirmDialogComponent, {
      data: {
        title: 'Limpiar Filtros',
        message: '¿Estás seguro que deseas limpiar todos los filtros de búsqueda?',
        isDestructive: false 
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // Reset everything
        this.selectedType.set(null);
        this.selectedBrand.set(null);
        this.selectedModel.set(null);
        this.selectedEngine.set(null);
        this.searchControl.setValue('', { emitEvent: true }); // emitEvent true will trigger debounce subscription
      }
    });
  }
}
