import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PieSlice {
  label: string;
  value: number;
  color: string;
  percent: number;
  offset: number;
}

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pie-chart-wrapper">
      <div class="pie-shell">
        <svg viewBox="0 0 36 36" class="pie" aria-label="Vendas por categoria">
          <ng-container *ngFor="let slice of slices">
            <circle
              class="pie-slice"
              [class.active]="activeSlice?.label === slice.label"
              [attr.stroke]="slice.color"
              [attr.stroke-dasharray]="slice.percent + ' ' + (100 - slice.percent)"
              [attr.stroke-dashoffset]="slice.offset"
              r="16"
              cx="18"
              cy="18"
              stroke-width="6"
              fill="none"
              (mouseenter)="activeSlice = slice"
              (mouseleave)="activeSlice = null"
              (focus)="activeSlice = slice"
              (blur)="activeSlice = null"
              tabindex="0"
            />
          </ng-container>
          <circle class="pie-center" cx="18" cy="18" r="9" fill="#ffffff" />
        </svg>

        <div class="pie-tooltip" *ngIf="activeSlice as active">
          <p>{{ active.label }}</p>
          <strong>{{ active.value.toFixed(1) }}%</strong>
          <span>{{ active.value.toFixed(1) }}% das vendas</span>
        </div>
      </div>

      <div class="pie-legend">
        <div
          *ngFor="let slice of slices"
          class="pie-legend-item"
          [class.active]="activeSlice?.label === slice.label"
          (mouseenter)="activeSlice = slice"
          (mouseleave)="activeSlice = null"
        >
          <span class="pie-legend-color" [style.background]="slice.color"></span>
          <span class="pie-legend-label">{{ slice.label }}</span>
          <strong>{{ slice.value.toFixed(1) }}%</strong>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent {
  @Input() data: { label: string; value: number; color: string }[] = [];
  activeSlice: PieSlice | null = null;

  get slices(): PieSlice[] {
    const total = this.data.reduce((sum, d) => sum + d.value, 0) || 1;
    let cumulative = 0;

    return this.data.map((d) => {
      const percent = Number(((d.value / total) * 100).toFixed(1));
      const offset = 100 - cumulative;
      cumulative += percent;
      return {
        ...d,
        percent,
        offset
      };
    });
  }
}
