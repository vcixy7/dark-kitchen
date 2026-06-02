import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PieChartComponent } from './charts/pie-chart.component';
import { BarChartComponent } from './charts/bar-chart.component';
import { LineChartComponent } from './charts/line-chart.component';

@Component({
  selector: 'app-tela-dono',
  standalone: true,
  imports: [CommonModule, PieChartComponent, BarChartComponent,],
  template: `
    <section class="dono-page">
      <div class="hero-card">
        <div>
          <p class="eyebrow">Painel do dono</p>
          <h1>{{ nomeRestaurante }}</h1>
          <p class="hero-description">
            Acompanhe ganhos, desempenho da semana e pedidos recentes em tempo real.
          </p>
        </div>

        <div class="hero-actions">
          <div class="hero-status">
            <span class="status-pill">Operação ativa</span>
            <p class="hero-highlight">{{ pedidosPendentes }} pedidos aguardando</p>
          </div>
          <button type="button" class="logout-btn" (click)="sairDaConta()">Logout</button>
        </div>
      </div>

      <div class="stats-grid">
        <article class="stat-card">
          <span class="stat-label">Faturamento hoje</span>
          <strong>R$ {{ ganhosHoje.toFixed(2) }}</strong>
          <small>+{{ crescimentoHoje }}% em relação a ontem</small>
        </article>

        <article class="stat-card">
          <span class="stat-label">Faturamento da semana</span>
          <strong>R$ {{ ganhosSemana.toFixed(2) }}</strong>
          <small>{{ pedidosSemana }} pedidos concluídos</small>
        </article>

        <article class="stat-card">
          <span class="stat-label">Faturamento do mês</span>
          <strong>R$ {{ ganhosMes.toFixed(2) }}</strong>
          <small>{{ pedidosMes }} pedidos nos últimos 30 dias</small>
        </article>

        <article class="stat-card">
          <span class="stat-label">Prato mais pedido</span>
          <strong>{{ pratoMaisVendido }}</strong>
          <small>{{ vendasPratoMaisVendido }} unidades vendidas</small>
        </article>
      </div>

      <div class="dashboard-grid">
        <section class="panel panel-large">
          <div class="panel-header">
            <div>
              <h2>Ganhos por período</h2>
              <span>{{ periodoSelecionado | titlecase }}</span>
            </div>
            <span class="panel-badge">R$ {{ totalPeriodoSelecionado.toFixed(2) }}</span>
          </div>
          <div class="chart-container">
            <app-bar-chart
              [data]="dadosGanhos"
              [selectedFilter]="periodoSelecionado"
              (filterChange)="setPeriodo($event)"
            ></app-bar-chart>
          </div>
        </section>
        <section class="panel panel-chart-panel">
          <div class="panel-header">
            <div>
              <h2>Vendas por categoria</h2>
              <span>Distribuição das vendas</span>
            </div>
          </div>
          <div class="pie-panel-body">
            <app-pie-chart [data]="vendasPorCategoria"></app-pie-chart>
          </div>
        </section>
      </div>

      <div class="dashboard-grid">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Pedidos recentes</h2>
              <span>Últimas movimentações</span>
            </div>
            <span class="panel-badge">{{ pedidosRecentes.length }} ativos</span>
          </div>
          <div class="order-list">
            <article class="order-item" *ngFor="let pedido of pedidosRecentes">
              <div>
                <p class="order-code">{{ pedido.codigo }}</p>
                <p class="order-client">{{ pedido.cliente }}</p>
                <p class="order-detail">{{ pedido.itens }}</p>
              </div>
              <div class="order-meta">
                <span class="order-status" [class.completed]="pedido.status === 'Concluído'" [class.pending]="pedido.status === 'Pendente'">{{ pedido.status }}</span>
                <strong>R$ {{ pedido.total.toFixed(2) }}</strong>
              </div>
            </article>
          </div>
        </section>
        <section class="panel ranking-panel">
          <div class="panel-header">
            <div>
              <h2>Ranking de clientes</h2>
              <span>Quem mais pede no restaurante</span>
            </div>
            <span class="panel-badge">Top 5</span>
          </div>
          <div class="ranking-list">
            <article class="ranking-item" *ngFor="let cliente of rankingClientes; let index = index">
              <span class="ranking-badge">{{ index + 1 }}</span>
              <div class="ranking-body">
                <p class="order-code">{{ cliente.nome }}</p>
                <p class="order-detail">{{ cliente.pedidos }} pedidos • R$ {{ cliente.total.toFixed(2) }}</p>
              </div>
              <strong>{{ cliente.media.toFixed(2) }}</strong>
            </article>
          </div>
        </section>
      </div>

      <div class="bottom-grid">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Top itens vendidos</h2>
              <span>Mais populares no período</span>
            </div>
          </div>

          <div class="top-items-list">
            <article class="top-item" *ngFor="let item of maisVendidos">
              <div>
                <p class="top-item-name">{{ item.nome }}</p>
                <p class="top-item-copy">{{ item.vendas }} vendas</p>
              </div>
              <strong>{{ item.percentual }}%</strong>
            </article>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>Resumo da semana</h2>
              <span>Desempenho rápido</span>
            </div>
          </div>

          <div class="summary-boxes">
            <div class="summary-box">
              <span>Pedidos hoje</span>
              <strong>{{ pedidosHoje }}</strong>
            </div>
            <div class="summary-box">
              <span>Pedidos da semana</span>
              <strong>{{ pedidosSemana }}</strong>
            </div>
            <div class="summary-box">
              <span>Média de pedido por semana</span>
              <strong>R$ {{ (ganhosSemana / pedidosSemana).toFixed(2) }}</strong>
            </div>
            <div class="summary-box">
              <span>Dia com mais pedido da semana</span>
              <strong>{{ diaMaisPedido }}</strong>
            </div>
            <div class="summary-box">
              <span>Crescimento</span>
              <strong>+{{ crescimentoHoje }}%</strong>
            </div>
            <div class="summary-box">
              <span>Ticket médio</span>
              <strong>R$ {{ mediaPorPedido.toFixed(2) }}</strong>
            </div>
          </div>
        </section>
      </div>

  `,
  styleUrls: ['./tela-inicial.css']
})
export class TelaDonoComponent {
  @Output() logout = new EventEmitter<void>();

  nomeRestaurante = 'Burger Master';
  ganhosHoje = 845.60;
  ganhosSemana = 4850.20;
  ganhosMes = 19920.40;
  pedidosHoje = 27;
  pedidosSemana = 128;
  pedidosMes = 512;
  pedidosPendentes = 8;
  pratoMaisVendido = 'Combo Duplo';
  vendasPratoMaisVendido = 58;
  crescimentoHoje = 12;
  taxaConversao = 74;
  mediaPorPedido = 37.9;
  diaMaisPedido = 'Sábado';


  // Dados para gráfico de barras (ganhos por período)
  dadosGanhos = [
    // Dia
    [
      { label: 'Seg', valor: 680 },
      { label: 'Ter', valor: 760 },
      { label: 'Qua', valor: 900 },
      { label: 'Qui', valor: 720 },
      { label: 'Sex', valor: 980 },
      { label: 'Sáb', valor: 1100 },
      { label: 'Dom', valor: 610 }
    ],
    // Semana
    [
      { label: 'Semana 1', valor: 4200 },
      { label: 'Semana 2', valor: 4850 },
      { label: 'Semana 3', valor: 5100 },
      { label: 'Semana 4', valor: 4770 }
    ],
    // Mês
    [
      { label: 'Jan', valor: 18000 },
      { label: 'Fev', valor: 19200 },
      { label: 'Mar', valor: 19920 },
      { label: 'Abr', valor: 21000 }
    ]
  ];

  periodoSelecionado: 'dia' | 'semana' | 'mes' = 'dia';

  setPeriodo(periodo: 'dia' | 'semana' | 'mes') {
    this.periodoSelecionado = periodo;
  }

  get totalPeriodoSelecionado(): number {
    const idx = this.periodoSelecionado === 'dia' ? 0 : this.periodoSelecionado === 'semana' ? 1 : 2;
    return Number(this.dadosGanhos[idx].reduce((total, item) => total + item.valor, 0).toFixed(2));
  }

  // Dados para gráfico de pizza
  vendasPorCategoria = [
    { label: 'Hambúrgueres', value: 42, color: '#7c3aed' },
    { label: 'Pizza', value: 33, color: '#f59e42' },
    { label: 'Japonesa', value: 25, color: '#f43f5e' }
  ];

  pedidosRecentes = [
    { codigo: 'ORD-1772584623010', cliente: 'Ana Lima', itens: '1x Combo Duplo + 1x Batata', status: 'Concluído', total: 54.9 },
    { codigo: 'ORD-1772584623011', cliente: 'Lucas Mendes', itens: '2x Burger Especial', status: 'Pendente', total: 48.2 },
    { codigo: 'ORD-1772584623012', cliente: 'Mariana Costa', itens: '1x Salada + 1x Refri', status: 'Concluído', total: 32.4 },
    { codigo: 'ORD-1772584623013', cliente: 'João Silva', itens: '1x Combo Família', status: 'Pendente', total: 63.6 }
  ];

  maisVendidos = [
    { nome: 'Combo Duplo', vendas: 58, percentual: 34 },
    { nome: 'Burger Especial', vendas: 47, percentual: 28 },
    { nome: 'Batata Grande', vendas: 41, percentual: 24 },
    { nome: 'Refrigerante', vendas: 33, percentual: 19 }
  ];

  rankingClientes = [
    { nome: 'Ana Lima', pedidos: 32, total: 968.4, media: 30.26 },
    { nome: 'Lucas Mendes', pedidos: 27, total: 812.5, media: 30.09 },
    { nome: 'Mariana Costa', pedidos: 24, total: 724.1, media: 30.17 },
    { nome: 'João Silva', pedidos: 19, total: 588.8, media: 30.99 },
    { nome: 'Paula Rocha', pedidos: 16, total: 486.0, media: 30.38 }
  ];

  frequenciaPedidos = [
    { label: 'Seg', value: 28 },
    { label: 'Ter', value: 34 },
    { label: 'Qua', value: 42 },
    { label: 'Qui', value: 36 },
    { label: 'Sex', value: 49 },
    { label: 'Sáb', value: 58 },
    { label: 'Dom', value: 26 }
  ];

  sairDaConta(): void {
    if (window.confirm('Deseja realmente sair?')) {
      this.logout.emit();
    }
  }
}
