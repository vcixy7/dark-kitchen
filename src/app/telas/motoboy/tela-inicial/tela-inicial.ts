import { Component, EventEmitter, OnInit, OnDestroy, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { PedidosService, Pedido } from '../../../services/pedidos.service';

@Component({
  selector: 'app-tela-motoboy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="motoboy-page">
      <div class="hero-card">
        <div>
          <p class="eyebrow">Área do motoboy</p>
          <h1>Bem-vindo, {{ nome }}</h1>
          <p class="hero-description">
            Acompanhe suas entregas, o status da rota e prossiga com as ações do dia.
          </p>
        </div>

        <div class="hero-right">
          <div class="hero-status">
            <span class="status-pill">{{ status }}</span>
            <p class="rating">⭐ {{ avaliacao }} de avaliação</p>
          </div>

          <div class="top-actions">
            <button type="button" class="profile-toggle-btn" (click)="alternarPerfil()">
              <span class="profile-toggle-icon">👤</span>
              <span class="profile-toggle-copy">
                <strong>{{ motoboyInfo.nome }}</strong>
                <small>Editar perfil</small>
              </span>
            </button>
            <button type="button" class="logout-btn" (click)="sairDaConta()">
              Logout
            </button>
          </div>
        </div>
      </div>

      <section class="profile-screen" *ngIf="perfilAberto">
        <div class="profile-screen-header">
          <div>
            <p class="eyebrow">Perfil do motoboy</p>
            <h2>Gerencie suas informações, metas e histórico</h2>
            <p class="profile-screen-copy">
              Aqui você atualiza seus dados, acompanha a meta de entregas para ganhar recompensas e revisa o histórico das entregas concluídas.
            </p>
          </div>

          <div class="profile-screen-actions">
            <button type="button" class="secondary-btn" (click)="alternarPerfil()">
              Voltar para entregas
            </button>
            <button type="button" class="primary-btn" (click)="salvarPerfil()">
              Salvar alterações
            </button>
          </div>
        </div>

        <div class="profile-screen-grid">
          <section class="profile-section-card">
            <div class="section-title-row">
              <h3>Alterar informações</h3>
              <span>Dados pessoais</span>
            </div>

            <div class="profile-form-grid">
              <label class="profile-field">
                <span>Nome</span>
                <input type="text" [(ngModel)]="motoboyInfo.nome" />
              </label>

              <label class="profile-field">
                <span>Email</span>
                <input type="email" [(ngModel)]="motoboyInfo.email" />
              </label>

              <label class="profile-field">
                <span>Telefone</span>
                <input type="tel" [(ngModel)]="motoboyInfo.telefone" />
              </label>

              <label class="profile-field">
                <span>Veículo</span>
                <input type="text" [(ngModel)]="motoboyInfo.veiculo" />
              </label>
            </div>
          </section>

          <section class="profile-section-card">
            <div class="section-title-row">
              <h3>Meta de entregas para recompensas</h3>
              <span>{{ metasCompletas }} / {{ metas.length }}</span>
            </div>

            <div class="goals-list">
              <article class="goal-item" *ngFor="let meta of metas">
                <div>
                  <p class="goal-title">{{ meta.titulo }}</p>
                  <p class="goal-caption">{{ meta.descricao }}</p>
                </div>
                <div class="goal-badge" [class.completed]="meta.concluida">
                  {{ meta.concluida ? 'Concluída' : 'Em andamento' }}
                </div>
              </article>
            </div>

            <div class="goal-progress">
              <div class="goal-progress-bar">
                <span [style.width.%]="(metasCompletas / metas.length) * 100"></span>
              </div>
              <p>{{ ((metasCompletas / metas.length) * 100).toFixed(0) }}% da meta diária concluída</p>
            </div>

            <div class="reward-banner">
              <strong>Próxima recompensa</strong>
              <span>R$ 15,00 de bônus ao concluir a meta do dia.</span>
            </div>
          </section>

          <section class="profile-section-card">
            <div class="section-title-row">
              <h3>Histórico de entregas</h3>
              <span>{{ historicoEntregas.length }} concluídas</span>
            </div>

            <div class="history-list">
              <p *ngIf="historicoEntregas.length === 0" class="history-empty">
                Você ainda não concluiu nenhuma entrega.
              </p>
              <article class="history-item" *ngFor="let entrega of historicoEntregas">
                <div>
                  <p class="history-code">{{ entrega.codigo }}</p>
                  <p class="history-client">{{ entrega.cliente }}</p>
                  <p class="history-address">{{ entrega.endereco }}</p>
                </div>
                <div class="history-meta">
                  <span class="history-status">{{ entrega.status }}</span>
                  <strong>R$ {{ entrega.valor.toFixed(2) }}</strong>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>

      <ng-container *ngIf="!perfilAberto">
        <div class="summary-grid">
        <article class="summary-card">
          <span class="summary-label">Entregas pendentes</span>
          <strong>{{ entregasEmAndamento.length }}</strong>
        </article>

        <article class="summary-card">
          <span class="summary-label">Entregas hoje</span>
          <strong>{{ entregasHoje }}</strong>
        </article>

        <article class="summary-card">
          <span class="summary-label">Ganhos hoje</span>
          <strong>R$ {{ ganhosHoje.toFixed(2) }}</strong>
        </article>
      </div>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Entregas em andamento</h2>
            <span>Atualize conforme sair</span>
          </div>
          <span class="panel-badge">{{ entregasEmAndamento.length }} em rota</span>
        </div>

        <div class="delivery-list">
          <p *ngIf="entregasEmAndamento.length === 0" class="delivery-empty">
            Nenhuma entrega disponível no momento. Assim que um restaurante marcar um pedido como pronto, ele aparece aqui.
          </p>
          <article class="delivery-item" *ngFor="let entrega of entregasEmAndamento">
            <div class="delivery-top-row">
              <div>
                <p class="delivery-code">{{ entrega.codigo }}</p>
                <p class="delivery-client">{{ entrega.cliente }}</p>
              </div>

              <div class="delivery-meta">
                <span class="delivery-status">{{ entrega.status }}</span>
                <strong class="delivery-value">R$ {{ entrega.valor.toFixed(2) }}</strong>
              </div>
            </div>

            <div class="route-card">
              <div class="route-block" [class.disabled]="entrega.etapa > 2">
                <p class="route-label pickup">📍 RETIRAR EM</p>
                <p class="route-point">{{ entrega.restaurante }}</p>
                <p class="route-address">{{ entrega.enderecoRestaurante }}</p>
              </div>

              <div class="route-divider"></div>

              <div class="route-block" [class.disabled]="entrega.etapa < 3">
                <p class="route-label delivery">🚀 ENTREGAR EM</p>
                <p class="route-point">{{ entrega.cliente }}</p>
                <p class="route-address">{{ entrega.endereco }}</p>
              </div>
            </div>

            <div class="actions-row">
              <button type="button" class="secondary-btn" (click)="navegarPara(entrega)">
                🗺️ Navegar
              </button>

              <button
                type="button"
                class="primary-btn"
                *ngIf="entrega.etapa < 4"
                (click)="proximaEtapa(entrega)"
              >
                <span *ngIf="entrega.etapa === 1">Aceitar Entrega</span>
                <span *ngIf="entrega.etapa === 2">Confirmar Retirada</span>
                <span *ngIf="entrega.etapa === 3">Cheguei ao Cliente</span>
              </button>
            </div>

            <div *ngIf="entrega.etapa === 4" class="confirm-box">
              <p class="confirm-title">Digite o código de confirmação do cliente:</p>
              <div class="confirm-actions">
                <input
                  type="text"
                  #txtCodigo
                  placeholder="Ex: 1234"
                  class="confirm-input"
                >
                <button
                  type="button"
                  class="confirm-btn"
                  (click)="verificarCodigo(entrega, txtCodigo.value)"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
      </ng-container>
    </section>
  `,
  styleUrls: ['./tela-inicial.css']
})
export class TelaMotoboyComponent implements OnInit, OnDestroy {
  @Output() logout = new EventEmitter<void>();

  nome = 'Motoboy';
  status = 'Disponível';
  avaliacao = 4.9;
  perfilAberto = false;

  // Pedidos prontos (disponíveis para qualquer motoboy) e os pedidos atribuídos
  // a ESTE motoboy — ambos vêm do Firestore em tempo real.
  private pedidosProntosRaw: Pedido[] = [];
  private meusPedidosRaw: Pedido[] = [];
  // Pedidos em que o motoboy já clicou "Cheguei ao Cliente" (mostra o campo do código).
  private chegou = new Set<string>();

  private unsubProntos: any;
  private unsubMeus: any;

  motoboyInfo = {
    nome: 'Motoboy',
    email: 'motoboy@flashfood.com',
    telefone: '(11) 99999-0000',
    veiculo: 'Moto Yamaha MT-03'
  };

  metas = [
    {
      titulo: '5 entregas concluídas',
      descricao: 'Foque em fechar pelo menos 5 entregas hoje',
      concluida: true
    },
    {
      titulo: 'R$ 200 em ganhos',
      descricao: 'Acompanhe o valor total do dia',
      concluida: false
    },
    {
      titulo: 'Retirada rápida',
      descricao: 'Aceitar e sair para o restaurante em até 10 minutos',
      concluida: true
    }
  ];

  constructor(private authService: AuthService, private userService: UserService, private pedidosService: PedidosService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.carregarDadosUsuario();
    this.escutarEntregas();
  }

  ngOnDestroy() {
    if (this.unsubProntos) this.unsubProntos();
    if (this.unsubMeus) this.unsubMeus();
  }

  // Escuta em tempo real os pedidos prontos (disponíveis) e os pedidos deste
  // motoboy (em rota + histórico). Como o status é gravado no Firestore, a
  // tela do cliente acompanha cada mudança no mesmo instante.
  private escutarEntregas(): void {
    const user = this.authService.getCurrentUserSync();
    if (!user) return;

    this.unsubProntos = this.pedidosService.escutarPedidosProntos((pedidos) => {
      this.pedidosProntosRaw = pedidos;
      this.cdr.detectChanges();
    });

    this.unsubMeus = this.pedidosService.escutarPedidosDoMotoboy(user.uid, (pedidos) => {
      this.meusPedidosRaw = pedidos;
      this.cdr.detectChanges();
    });
  }

  // Entregas mostradas no painel: minhas entregas ativas + pedidos prontos
  // ainda sem motoboy. Começa SEMPRE do banco real (sem pedidos de exemplo).
  get entregasEmAndamento(): any[] {
    const meusAtivos = this.meusPedidosRaw
      .filter(p => p.status === 'Aguardando Motoboy' || p.status === 'Retirado')
      .map(p => this.mapEntrega(p));

    const disponiveis = this.pedidosProntosRaw
      .filter(p => !(p as any).motoboyId)
      .map(p => this.mapEntrega(p));

    return [...meusAtivos, ...disponiveis].sort((a, b) => b.dataPedidoMs - a.dataPedidoMs);
  }

  get historicoEntregas(): any[] {
    return this.meusPedidosRaw
      .filter(p => p.status === 'Entregue')
      .sort((a, b) => this.tsParaMs(b.dataPedido) - this.tsParaMs(a.dataPedido))
      .map(p => ({
        codigo: p.codigo || p.id,
        cliente: p.cliente?.nome || 'Cliente',
        endereco: (p as any).enderecoEntrega || p.cliente?.endereco || '',
        valor: p.valor ?? 0,
        status: 'Concluída'
      }));
  }

  get entregasHoje(): number {
    return this.meusPedidosRaw.filter(p => p.status === 'Entregue' && this.mesmoDia(this.tsParaMs(p.dataPedido))).length;
  }

  get ganhosHoje(): number {
    return this.meusPedidosRaw
      .filter(p => p.status === 'Entregue' && this.mesmoDia(this.tsParaMs(p.dataPedido)))
      .reduce((acc, p) => acc + ((p as any).taxaEntrega || 0), 0);
  }

  get metasCompletas(): number {
    return this.metas.filter((meta) => meta.concluida).length;
  }

  // Botão de ação único: cada etapa avança o pedido e grava o novo status.
  async proximaEtapa(entrega: any): Promise<void> {
    if (entrega.etapa === 1) {
      await this.aceitarEntrega(entrega);
    } else if (entrega.etapa === 2) {
      await this.confirmarRetirada(entrega);
    } else if (entrega.etapa === 3) {
      this.chegueiAoCliente(entrega);
    }
  }

  // Etapa 1 -> 2: motoboy aceita e assume o pedido (status 'Aguardando Motoboy').
  private async aceitarEntrega(entrega: any): Promise<void> {
    const user = this.authService.getCurrentUserSync();
    if (!user || !entrega.id) return;

    try {
      await this.pedidosService.atribuirMotoboy(entrega.id, user.uid);
      await this.pedidosService.atualizarStatusPedido(entrega.id, 'Aguardando Motoboy');
    } catch (error) {
      console.error('Erro ao aceitar entrega:', error);
    }
  }

  // Etapa 2 -> 3: motoboy retirou o pedido no restaurante (status 'Retirado').
  private async confirmarRetirada(entrega: any): Promise<void> {
    if (!entrega.id) return;
    try {
      await this.pedidosService.atualizarStatusPedido(entrega.id, 'Retirado');
    } catch (error) {
      console.error('Erro ao confirmar retirada:', error);
    }
  }

  // Etapa 3 -> 4: chegou no cliente, abre o campo do código de confirmação.
  private chegueiAoCliente(entrega: any): void {
    if (!entrega.id) return;
    this.chegou.add(entrega.id);
    this.cdr.detectChanges();
  }

  // Finaliza o pedido SOMENTE com o código de confirmação (a "senha") do cliente.
  async verificarCodigo(entrega: any, codigoDigitado: string): Promise<void> {
    const digitado = (codigoDigitado || '').trim();

    if (!digitado) {
      alert('Digite o código de confirmação do cliente para finalizar.');
      return;
    }

    if (digitado !== String(entrega.codigoConfirmacao || '')) {
      alert('Código de confirmação incorreto. Peça o código ao cliente e tente novamente.');
      return;
    }

    try {
      await this.pedidosService.atualizarStatusPedido(entrega.id, 'Entregue');
      this.chegou.delete(entrega.id);
      alert('✅ Entrega concluída com sucesso!');
      // O listener atualiza a lista (o pedido sai de "em andamento") e o cliente
      // vê "Entregue" em tempo real.
    } catch (error) {
      console.error('Erro ao finalizar entrega:', error);
      alert('Erro ao finalizar a entrega. Tente novamente.');
    }
  }

  navegarPara(entrega: any) {
    const destino = entrega.etapa <= 2 ? entrega.enderecoRestaurante : entrega.endereco;

    const abrirRota = (origem: string) => {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origem)}&destination=${encodeURIComponent(destino)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => abrirRota(`${coords.latitude},${coords.longitude}`),
        () => abrirRota('Minha+Localiza%C3%A7%C3%A3o')
      );
      return;
    }

    abrirRota('Minha+Localiza%C3%A7%C3%A3o');
  }

  alternarPerfil(): void {
    this.perfilAberto = !this.perfilAberto;
  }

  // Salva o perfil no cadastro real (Firestore), para a edição bater com o cadastro.
  async salvarPerfil(): Promise<void> {
    const user = this.authService.getCurrentUserSync();
    if (!user) {
      alert('Sua sessão expirou. Faça login novamente para salvar.');
      return;
    }

    try {
      const partes = (this.motoboyInfo.nome || '').trim().split(/\s+/);
      const nome = partes.shift() || '';
      const sobrenome = partes.join(' ');

      await this.userService.atualizarUser(user.uid, {
        nome,
        sobrenome,
        email: (this.motoboyInfo.email || '').trim(),
        telefone: (this.motoboyInfo.telefone || '').trim(),
        modeloMoto: (this.motoboyInfo.veiculo || '').trim()
      });

      this.nome = this.motoboyInfo.nome;
      this.perfilAberto = false;
      this.cdr.detectChanges();
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil do motoboy:', error);
      alert('Erro ao salvar suas informações. Tente novamente.');
    }
  }

  async carregarDadosUsuario() {
    try {
      const user = this.authService.getCurrentUserSync();
      if (user) {
        const dados = await this.userService.obterUser(user.uid);
        if (dados) {
          this.motoboyInfo = {
            nome: `${dados.nome || ''} ${dados.sobrenome || ''}`.trim() || 'Motoboy',
            email: dados.email || user.email || '',
            telefone: dados.telefone || '',
            veiculo: dados.modeloMoto || 'Moto'
          };
          this.nome = this.motoboyInfo.nome;
          console.log('✅ Dados do motoboy carregados:', this.motoboyInfo);
          // Firestore responde fora da zona do Angular: força a atualização da view.
          this.cdr.detectChanges();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do motoboy:', error);
    }
  }

  sairDaConta(): void {
    if (window.confirm('Deseja realmente sair?')) {
      this.logout.emit();
    }
  }

  // Converte um pedido do Firestore para o formato exibido no card de entrega.
  private mapEntrega(p: any): any {
    return {
      id: p.id,
      codigo: p.codigo || p.id,
      restaurante: p.restaurante?.nome || 'Restaurante',
      enderecoRestaurante: p.restaurante?.endereco || p.enderecoRestaurante || 'Retirada no restaurante',
      cliente: p.cliente?.nome || 'Cliente',
      endereco: p.enderecoEntrega || p.cliente?.endereco || 'Endereço não informado',
      valor: p.valor ?? 0,
      status: this.rotuloStatus(p.status),
      codigoConfirmacao: p.codigoConfirmacao || '',
      dataPedidoMs: this.tsParaMs(p.dataPedido),
      etapa: this.etapaDe(p)
    };
  }

  // Etapa do fluxo do motoboy a partir do status real do pedido.
  private etapaDe(p: any): number {
    switch (p.status) {
      case 'Pronto': return 1;
      case 'Aguardando Motoboy': return 2;
      case 'Retirado': return this.chegou.has(p.id) ? 4 : 3;
      default: return 4;
    }
  }

  private rotuloStatus(s: string): string {
    switch (s) {
      case 'Pronto': return 'Disponível para retirada';
      case 'Aguardando Motoboy': return 'A caminho do restaurante';
      case 'Retirado': return 'Em rota para o cliente';
      case 'Entregue': return 'Entregue';
      default: return s;
    }
  }

  private tsParaMs(d: any): number {
    if (!d) return 0;
    if (typeof d?.seconds === 'number') return d.seconds * 1000;
    if (typeof d?.toDate === 'function') return d.toDate().getTime();
    const t = new Date(d).getTime();
    return isNaN(t) ? 0 : t;
  }

  private mesmoDia(ms: number): boolean {
    if (!ms) return false;
    const d = new Date(ms);
    const hoje = new Date();
    return d.getFullYear() === hoje.getFullYear()
      && d.getMonth() === hoje.getMonth()
      && d.getDate() === hoje.getDate();
  }
}
