import { Component, EventEmitter, OnInit, OnDestroy, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PieChartComponent } from './charts/pie-chart.component';
import { BarChartComponent } from './charts/bar-chart.component';
import { LineChartComponent } from './charts/line-chart.component';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { PedidosService } from '../../../services/pedidos.service';

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
export class TelaDonoComponent implements OnInit, OnDestroy {
  @Output() logout = new EventEmitter<void>();

  nomeRestaurante = 'Burger Master';

  private unsubPedidos: any;
  private categoriaPorRestaurante: Record<string, string> = {};

  // Quando quem acessa o painel é uma conta de RESTAURANTE (mesmo login do
  // restaurante usado na aba "Dono"), os dados reais são escopados a esse
  // restaurante. Para uma conta de dono "de verdade", fica null = agrega tudo.
  private escopoRestauranteId: string | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private pedidosService: PedidosService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    await this.carregarDadosUsuario();
    await this.carregarCategorias();
    this.escutarPedidosReais();
  }

  ngOnDestroy() {
    if (this.unsubPedidos) this.unsubPedidos();
  }

  // Mapa restauranteId -> categoria, para distribuir as vendas reais no gráfico
  // de pizza ("vendas por categoria").
  private async carregarCategorias() {
    try {
      const rests = await this.userService.obterRestaurantes();
      rests.forEach((r: any) => {
        this.categoriaPorRestaurante[r.id] = r.categoria || 'Outros';
      });
    } catch (error) {
      console.error('Erro ao carregar categorias dos restaurantes:', error);
    }
  }

  // Escuta TODOS os pedidos da plataforma em tempo real e recalcula o painel.
  // Cada vez que um pedido é concluído (status "Entregue") os indicadores e
  // gráficos refletem o novo valor automaticamente.
  private escutarPedidosReais() {
    this.unsubPedidos = this.pedidosService.escutarTodosPedidos((pedidos) => {
      this.recalcular(pedidos || []);
      // Firestore responde fora da zona do Angular: força a atualização da view.
      this.cdr.detectChanges();
    });
  }

  async carregarDadosUsuario() {
    try {
      const user = this.authService.getCurrentUserSync();
      if (user) {
        const dados = await this.userService.obterUser(user.uid);
        if (dados) {
          if (dados.tipo === 'restaurante') {
            // Restaurante acessando como dono: escopa os números a ele mesmo.
            this.escopoRestauranteId = user.uid;
            this.nomeRestaurante = dados.nomeRestaurante || 'Meu Estabelecimento';
          } else {
            // Conta de dono "de verdade": agrega todos os restaurantes.
            this.escopoRestauranteId = null;
            this.nomeRestaurante = dados.nomeProprietario || 'Meu Estabelecimento';
          }
          console.log('✅ Dados do painel carregados:', dados.tipo, this.nomeRestaurante);
          // Firestore responde fora da zona do Angular: força a atualização da view.
          this.cdr.detectChanges();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do painel do dono:', error);
    }
  }
  // ---- BASE DEMO (dados fictícios mantidos para a demonstração) ----
  private readonly baseGanhosHoje = 845.60;
  private readonly baseGanhosSemana = 4850.20;
  private readonly baseGanhosMes = 19920.40;
  private readonly basePedidosHoje = 27;
  private readonly basePedidosSemana = 128;
  private readonly basePedidosMes = 512;
  private readonly basePedidosPendentes = 8;

  // ---- valores EXIBIDOS = base demo + pedidos reais concluídos (tempo real) ----
  ganhosHoje = this.baseGanhosHoje;
  ganhosSemana = this.baseGanhosSemana;
  ganhosMes = this.baseGanhosMes;
  pedidosHoje = this.basePedidosHoje;
  pedidosSemana = this.basePedidosSemana;
  pedidosMes = this.basePedidosMes;
  pedidosPendentes = this.basePedidosPendentes;
  pratoMaisVendido = 'Combo Duplo';
  vendasPratoMaisVendido = 58;
  crescimentoHoje = 12;
  taxaConversao = 74;
  mediaPorPedido = 37.9;
  diaMaisPedido = 'Sábado';

  // Base demo do gráfico de barras (ganhos por período)
  private readonly baseDadosGanhos = [
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
  dadosGanhos = this.baseDadosGanhos.map((arr) => arr.map((x) => ({ ...x })));

  periodoSelecionado: 'dia' | 'semana' | 'mes' = 'dia';

  setPeriodo(periodo: 'dia' | 'semana' | 'mes') {
    this.periodoSelecionado = periodo;
  }

  get totalPeriodoSelecionado(): number {
    const idx = this.periodoSelecionado === 'dia' ? 0 : this.periodoSelecionado === 'semana' ? 1 : 2;
    return Number(this.dadosGanhos[idx].reduce((total, item) => total + item.valor, 0).toFixed(2));
  }

  // Base demo do gráfico de pizza
  private readonly baseVendasPorCategoria = [
    { label: 'Hambúrgueres', value: 42, color: '#7c3aed' },
    { label: 'Pizza', value: 33, color: '#f59e42' },
    { label: 'Japonesa', value: 25, color: '#f43f5e' }
  ];
  vendasPorCategoria = this.baseVendasPorCategoria.map((x) => ({ ...x }));

  private readonly basePedidosRecentes = [
    { codigo: 'ORD-1772584623010', cliente: 'Ana Lima', itens: '1x Combo Duplo + 1x Batata', status: 'Concluído', total: 54.9 },
    { codigo: 'ORD-1772584623011', cliente: 'Lucas Mendes', itens: '2x Burger Especial', status: 'Pendente', total: 48.2 },
    { codigo: 'ORD-1772584623012', cliente: 'Mariana Costa', itens: '1x Salada + 1x Refri', status: 'Concluído', total: 32.4 },
    { codigo: 'ORD-1772584623013', cliente: 'João Silva', itens: '1x Combo Família', status: 'Pendente', total: 63.6 }
  ];
  pedidosRecentes = this.basePedidosRecentes.map((x) => ({ ...x }));

  private readonly baseMaisVendidos = [
    { nome: 'Combo Duplo', vendas: 58, percentual: 34 },
    { nome: 'Burger Especial', vendas: 47, percentual: 28 },
    { nome: 'Batata Grande', vendas: 41, percentual: 24 },
    { nome: 'Refrigerante', vendas: 33, percentual: 19 }
  ];
  maisVendidos = this.baseMaisVendidos.map((x) => ({ ...x }));

  private readonly baseRankingClientes = [
    { nome: 'Ana Lima', pedidos: 32, total: 968.4, media: 30.26 },
    { nome: 'Lucas Mendes', pedidos: 27, total: 812.5, media: 30.09 },
    { nome: 'Mariana Costa', pedidos: 24, total: 724.1, media: 30.17 },
    { nome: 'João Silva', pedidos: 19, total: 588.8, media: 30.99 },
    { nome: 'Paula Rocha', pedidos: 16, total: 486.0, media: 30.38 }
  ];
  rankingClientes = this.baseRankingClientes.map((x) => ({ ...x }));

  // Recalcula todos os indicadores e gráficos: base demo + pedidos reais.
  // "Concluído" = status 'Entregue'. Os pendentes alimentam o contador de
  // "pedidos aguardando". Envolto em try/catch para que um pedido malformado
  // nunca derrube o painel (mantém a base demo).
  private recalcular(pedidos: any[]): void {
    try {
      // Se for um restaurante acessando como dono, considera só os pedidos dele.
      const todos = this.escopoRestauranteId
        ? pedidos.filter((p) => p.restauranteId === this.escopoRestauranteId)
        : pedidos;
      const valor = (p: any) => Number(p.valor) || 0;
      const ms = (p: any) => this.msDe(p.dataPedido);

      const concluidos = todos.filter((p) => p.status === 'Entregue');
      const pendentes = todos.filter((p) => p.status && p.status !== 'Entregue' && p.status !== 'Cancelado');

      const concluidosHoje = concluidos.filter((p) => this.mesmoDia(ms(p)));
      const concluidosOntem = concluidos.filter((p) => this.ehDiaAnterior(ms(p)));
      const concluidosSemana = concluidos.filter((p) => this.dentroDeDias(ms(p), 7));
      const concluidosMes = concluidos.filter((p) => this.dentroDeDias(ms(p), 30));

      const realGanhosHoje = concluidosHoje.reduce((a, p) => a + valor(p), 0);
      const realGanhosOntem = concluidosOntem.reduce((a, p) => a + valor(p), 0);
      const realGanhosSemana = concluidosSemana.reduce((a, p) => a + valor(p), 0);
      const realGanhosMes = concluidosMes.reduce((a, p) => a + valor(p), 0);

      // KPIs = base demo + real
      this.ganhosHoje = this.baseGanhosHoje + realGanhosHoje;
      this.ganhosSemana = this.baseGanhosSemana + realGanhosSemana;
      this.ganhosMes = this.baseGanhosMes + realGanhosMes;
      this.pedidosHoje = this.basePedidosHoje + concluidosHoje.length;
      this.pedidosSemana = this.basePedidosSemana + concluidosSemana.length;
      this.pedidosMes = this.basePedidosMes + concluidosMes.length;
      this.pedidosPendentes = this.basePedidosPendentes + pendentes.length;

      this.mediaPorPedido = this.pedidosSemana > 0
        ? Number((this.ganhosSemana / this.pedidosSemana).toFixed(2))
        : this.mediaPorPedido;

      // Crescimento hoje vs ontem (só com dados reais; senão mantém demo)
      if (realGanhosOntem > 0) {
        const c = Math.round(((realGanhosHoje - realGanhosOntem) / realGanhosOntem) * 100);
        this.crescimentoHoje = Math.max(0, c);
      }

      // Gráfico de barras: base + real injetado no bucket "atual" de cada período
      const dg = this.baseDadosGanhos.map((arr) => arr.map((x) => ({ ...x })));
      const hojeLabel = this.labelDiaSemana(new Date());
      const bucketDia = dg[0].find((b) => b.label === hojeLabel);
      if (bucketDia) bucketDia.valor += realGanhosHoje;
      if (dg[1].length) dg[1][dg[1].length - 1].valor += realGanhosSemana;
      if (dg[2].length) dg[2][dg[2].length - 1].valor += realGanhosMes;
      this.dadosGanhos = dg;

      // Pizza: base + contagem real por categoria do restaurante do pedido
      const catCount: Record<string, number> = {};
      concluidos.forEach((p) => {
        const cat = this.categoriaPorRestaurante[p.restauranteId] || p.restaurante?.categoria || 'Outros';
        const nome = this.capitalizar(cat);
        catCount[nome] = (catCount[nome] || 0) + 1;
      });
      const cores = ['#7c3aed', '#f59e42', '#f43f5e', '#22c55e', '#0ea5e9', '#eab308', '#ec4899'];
      const pizza = this.baseVendasPorCategoria.map((x) => ({ ...x }));
      Object.keys(catCount).forEach((nome) => {
        const existente = pizza.find((c) => c.label.toLowerCase() === nome.toLowerCase());
        if (existente) existente.value += catCount[nome];
        else pizza.push({ label: nome, value: catCount[nome], color: cores[pizza.length % cores.length] });
      });
      this.vendasPorCategoria = pizza;

      // Pedidos recentes: reais (mais novos primeiro) e completa com a base demo
      const reaisRecentes = [...todos]
        .sort((a, b) => ms(b) - ms(a))
        .slice(0, 6)
        .map((p) => ({
          codigo: p.codigo || p.id,
          cliente: p.cliente?.nome || 'Cliente',
          itens: (p.itens || []).map((i: any) => `${i.quantidade ?? i.qtd ?? 1}x ${i.nome}`).join(' + ') || '—',
          status: p.status === 'Entregue' ? 'Concluído' : 'Pendente',
          total: valor(p),
        }));
      this.pedidosRecentes = [...reaisRecentes, ...this.basePedidosRecentes].slice(0, 6);

      // Top itens: base + soma real por nome de item, recalcula percentual
      const itemCount: Record<string, number> = {};
      this.baseMaisVendidos.forEach((i) => (itemCount[i.nome] = i.vendas));
      concluidos.forEach((p) =>
        (p.itens || []).forEach((i: any) => {
          const q = i.quantidade ?? i.qtd ?? 1;
          itemCount[i.nome] = (itemCount[i.nome] || 0) + q;
        }),
      );
      const itensArr = Object.keys(itemCount).map((nome) => ({ nome, vendas: itemCount[nome] }));
      const totalVendas = itensArr.reduce((a, i) => a + i.vendas, 0) || 1;
      itensArr.sort((a, b) => b.vendas - a.vendas);
      this.maisVendidos = itensArr
        .slice(0, 5)
        .map((i) => ({ ...i, percentual: Math.round((i.vendas / totalVendas) * 100) }));
      if (this.maisVendidos.length) {
        this.pratoMaisVendido = this.maisVendidos[0].nome;
        this.vendasPratoMaisVendido = this.maisVendidos[0].vendas;
      }

      // Ranking de clientes: base (seed) + real, ordenado por total gasto
      const rk: Record<string, { nome: string; pedidos: number; total: number }> = {};
      this.baseRankingClientes.forEach((c) => (rk[c.nome] = { nome: c.nome, pedidos: c.pedidos, total: c.total }));
      concluidos.forEach((p) => {
        const nome = p.cliente?.nome || 'Cliente';
        if (!rk[nome]) rk[nome] = { nome, pedidos: 0, total: 0 };
        rk[nome].pedidos += 1;
        rk[nome].total += valor(p);
      });
      this.rankingClientes = Object.values(rk)
        .map((c) => ({ ...c, media: c.pedidos ? Number((c.total / c.pedidos).toFixed(2)) : 0 }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Dia da semana com mais pedidos (real); senão mantém o demo
      const porDia: Record<string, number> = {};
      concluidosSemana.forEach((p) => {
        const l = this.labelDiaSemana(new Date(ms(p)));
        porDia[l] = (porDia[l] || 0) + 1;
      });
      const ordenados = Object.keys(porDia).sort((a, b) => porDia[b] - porDia[a]);
      if (ordenados.length) {
        const completo: Record<string, string> = {
          Seg: 'Segunda', Ter: 'Terça', Qua: 'Quarta', Qui: 'Quinta', Sex: 'Sexta', 'Sáb': 'Sábado', Dom: 'Domingo',
        };
        this.diaMaisPedido = completo[ordenados[0]] || ordenados[0];
      }
    } catch (error) {
      console.error('Erro ao recalcular painel do dono:', error);
    }
  }

  // ---- Helpers de data ----
  private msDe(d: any): number {
    if (!d) return 0;
    if (typeof d?.seconds === 'number') return d.seconds * 1000;
    if (typeof d?.toDate === 'function') return d.toDate().getTime();
    const t = new Date(d).getTime();
    return isNaN(t) ? 0 : t;
  }

  private mesmoDia(ms: number): boolean {
    if (!ms) return false;
    const d = new Date(ms);
    const h = new Date();
    return d.getFullYear() === h.getFullYear() && d.getMonth() === h.getMonth() && d.getDate() === h.getDate();
  }

  private ehDiaAnterior(ms: number): boolean {
    if (!ms) return false;
    const d = new Date(ms);
    const o = new Date();
    o.setDate(o.getDate() - 1);
    return d.getFullYear() === o.getFullYear() && d.getMonth() === o.getMonth() && d.getDate() === o.getDate();
  }

  private dentroDeDias(ms: number, dias: number): boolean {
    if (!ms) return false;
    return ms >= Date.now() - dias * 86400000;
  }

  private labelDiaSemana(d: Date): string {
    return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()];
  }

  private capitalizar(s: string): string {
    s = (s || '').trim();
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Outros';
  }

  sairDaConta(): void {
    if (window.confirm('Deseja realmente sair?')) {
      this.logout.emit();
    }
  }
}
