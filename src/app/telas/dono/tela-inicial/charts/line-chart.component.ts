import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface LinePoint {
  label: string;
  value: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="line-chart-card">
      <div class="line-chart-header">
        <div>
          <p class="eyebrow">Frequência de pedidos</p>
          <h3>{{ heading }}</h3>
        </div>
        <span class="line-chart-caption">{{ caption }}</span>
      </div>

      <svg viewBox="0 0 320 180" class="line-chart-svg" preserveAspectRatio="none" aria-label="Gráfico de frequência de pedidos">
        <defs>
          <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.28" />
            <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0" />
          </linearGradient>
        </defs>

        <path [attr.d]="areaPath" class="line-area" />
        <path [attr.d]="linePath" class="line-path" />

        <ng-container *ngFor="let point of points">
          <circle [attr.cx]="point.x" [attr.cy]="point.y" r="4.5" class="line-dot" />
          <text [attr.x]="point.x" [attr.y]="160" text-anchor="middle" class="line-label">{{ point.label }}</text>
        </ng-container>
      </svg>

      <div class="line-chart-legend">
        <span class="legend-dot"></span>
        <span>{{ legend }}</span>
      </div>
    </div>
  `,
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent {
  @Input() data: { label: string; value: number }[] = [];
  @Input() heading = 'Pedidos por período';
  @Input() caption = 'Comparativo dos momentos com maior volume';
  @Input() legend = 'Pedidos recorrentes no restaurante';

  get points(): LinePoint[] {
    const max = Math.max(...this.data.map((item) => item.value), 1);

    return this.data.map((item, index) => ({
      label: item.label,
      value: item.value,
      x: 28 + index * 58,
      y: 150 - (item.value / max) * 95
    }));
  }

  get linePath(): string {
    return this.points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
  }

  get areaPath(): string {
    const start = `M ${this.points[0].x} 150`;
    const line = this.linePath.replace(/^M /, 'L ');
    return `${start} ${line} L ${this.points[this.points.length - 1].x} 150 Z`;
  }
}
