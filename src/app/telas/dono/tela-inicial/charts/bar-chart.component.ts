import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bar-chart-filter">
      <button *ngFor="let f of filters" [class.active]="f === selectedFilter" (click)="setFilter(f)">{{ f | titlecase }}</button>
    </div>
    <div class="bar-chart">
      <div class="bar-column" *ngFor="let d of chartData">
        <div class="bar-track">
          <span class="bar-fill" [style.height.%]="d.percentual"></span>
        </div>
        <strong>{{ d.label }}</strong>
        <small>R$ {{ d.valor.toFixed(2) }}</small>
      </div>
    </div>
  `,
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent {
  @Input() data: { label: string; valor: number }[][] = [];
  @Input() selectedFilter: 'dia' | 'semana' | 'mes' = 'dia';
  @Output() filterChange = new EventEmitter<'dia' | 'semana' | 'mes'>();

  filters: Array<'dia' | 'semana' | 'mes'> = ['dia', 'semana', 'mes'];

  setFilter(filter: 'dia' | 'semana' | 'mes') {
    this.filterChange.emit(filter);
  }

  get chartData() {
    const idx = this.filters.indexOf(this.selectedFilter);
    const arr = this.data[idx] || [];
    const max = Math.max(...arr.map(d => d.valor), 1);
    return arr.map(d => ({ ...d, percentual: (d.valor / max) * 100 }));
  }
}
