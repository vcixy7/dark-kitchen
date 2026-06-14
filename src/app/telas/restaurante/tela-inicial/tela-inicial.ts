import { Component, EventEmitter, OnInit, OnDestroy, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProdutosRestauranteComponent } from '../produtos/produtos';
import { CuponsRestauranteComponent } from '../cupons/cupons';
import { PerfilRestauranteComponent } from '../perfil/perfil';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { PedidosService } from '../../../services/pedidos.service';

interface PedidoItem {
  nome: string;
  qtd: number;
  preco: number;
}

type PedidoStatus =
  | 'Novo Pedido'
  | 'Em Preparo'
  | 'Pronto'
  | 'Aguardando Motoboy'
  | 'Retirado'
  | 'Entregue';

type FiltroStatus = 'Todos' | PedidoStatus;

interface Pedido {
  id: string;
  codigo: string;
  hora: string;
  cliente: string;
  telefone: string;
  endereco: string;
  status: PedidoStatus;
  itens: PedidoItem[];
  valor: number;
  dataPedidoMs: number;
}

@Component({
  selector: 'app-tela-restaurante',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProdutosRestauranteComponent,
    CuponsRestauranteComponent,
    PerfilRestauranteComponent
  ],
  templateUrl: './tela-inicial.html',
  styleUrls: ['./tela-inicial.css']
})
export class TelaRestauranteComponent implements OnInit, OnDestroy {
  mostrarProdutos = false;
  mostrarCupons = false;
  mostrarPerfil = false;
  nomeRestaurante = 'Meu Restaurante';
  unsubscribePedidos: any;

  constructor(private authService: AuthService, private userService: UserService, private pedidosService: PedidosService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.carregarDadosUsuario();
    this.escutarPedidos();
  }

  ngOnDestroy() {
    if (this.unsubscribePedidos) {
      this.unsubscribePedidos();
    }
  }

  // Escuta em tempo real APENAS os pedidos feitos para ESTE restaurante.
  // O id usado é o uid do restaurante (mesmo valor que o cliente grava em
  // restauranteId ao finalizar o pedido). Antes usava o nome do restaurante,
  // por isso os pedidos reais nunca apareciam aqui.
  escutarPedidos() {
    const user = this.authService.getCurrentUserSync();
    if (!user) return;

    this.unsubscribePedidos = this.pedidosService.escutarPedidosRestaurante(
      user.uid,
      (pedidos: any[]) => {
        this.pedidosEmAndamento = (pedidos || [])
          .map(p => this.mapearPedido(p))
          .sort((a, b) => b.dataPedidoMs - a.dataPedidoMs);
        this.atualizarResumo();
        // Firestore responde fora da zona do Angular: força a atualização da view.
        this.cdr.detectChanges();
      }
    );
  }

  // Converte o pedido do Firestore para o formato exibido no painel.
  private mapearPedido(p: any): Pedido {
    const ms = this.tsParaMs(p.dataPedido);
    return {
      id: p.id,
      codigo: p.codigo || p.id,
      hora: this.tempoRelativo(ms),
      cliente: p.cliente?.nome || 'Cliente',
      telefone: p.cliente?.telefone || '',
      endereco: p.enderecoEntrega || p.cliente?.endereco || 'Endereço não informado',
      status: (p.status || 'Novo Pedido') as PedidoStatus,
      itens: (p.itens || []).map((i: any) => ({
        nome: i.nome,
        qtd: i.quantidade ?? i.qtd ?? 1,
        preco: i.preco || 0
      })),
      valor: p.valor ?? 0,
      dataPedidoMs: ms
    };
  }

  // Avança o status do pedido GRAVANDO no Firestore. Como o painel e a tela
  // do cliente escutam o mesmo documento, a mudança aparece em tempo real
  // nos dois lugares.
  async atualizarStatusPedido(pedidoId: string, novoStatus: string) {
    try {
      await this.pedidosService.atualizarStatusPedido(pedidoId, novoStatus as any);
      console.log('✅ Status atualizado:', novoStatus);
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
    }
  }

  async carregarDadosUsuario() {
    try {
      const user = this.authService.getCurrentUserSync();
      if (user) {
        const dados = await this.userService.obterUser(user.uid);
        if (dados) {
          this.nomeRestaurante = dados.nomeRestaurante || 'Meu Restaurante';
          console.log('✅ Dados do restaurante carregados:', dados);
          // Firestore responde fora da zona do Angular: força a atualização da view.
          this.cdr.detectChanges();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do restaurante:', error);
    }
  }

  filtroStatus: FiltroStatus = 'Todos';
  termoBusca = '';

  readonly filtrosDisponiveis: FiltroStatus[] = [
    'Todos',
    'Novo Pedido',
    'Em Preparo',
    'Pronto',
    'Aguardando Motoboy',
    'Retirado',
    'Entregue'
  ];

  readonly progressoPorStatus: Record<PedidoStatus, number> = {
    'Novo Pedido': 12,
    'Em Preparo': 40,
    'Pronto': 68,
    'Aguardando Motoboy': 82,
    'Retirado': 92,
    'Entregue': 100
  };

  // Sequência de status controlada pelo RESTAURANTE: ele cuida da cozinha até
  // "Pronto". A partir daí o MOTOBOY assume a entrega (Aguardando Motoboy ->
  // Retirado -> Entregue), e o restaurante apenas acompanha em tempo real.
  private readonly proximoStatus: Record<PedidoStatus, PedidoStatus | null> = {
    'Novo Pedido': 'Em Preparo',
    'Em Preparo': 'Pronto',
    'Pronto': null,
    'Aguardando Motoboy': null,
    'Retirado': null,
    'Entregue': null
  };

  // O restaurante só pode avançar enquanto o pedido está sob responsabilidade
  // dele (até marcar como Pronto). Depois o botão fica desabilitado.
  podeAvancar(pedido: Pedido): boolean {
    return !!this.proximoStatus[pedido.status];
  }

  abrirProdutos() {
    this.mostrarProdutos = true;
  }

  fecharProdutos() {
    this.mostrarProdutos = false;
  }

  abrirCupons() {
    this.mostrarCupons = true;
  }

  fecharCupons() {
    this.mostrarCupons = false;
  }

  abrirPerfil() {
    this.mostrarPerfil = true;
  }

  fecharPerfil() {
    this.mostrarPerfil = false;
  }

  @Output() logout = new EventEmitter<void>();

  // Começa SEMPRE vazio: o restaurante só recebe os pedidos que os clientes
  // realmente fizerem nele (sem nenhum pedido de exemplo pré-carregado).
  pedidosEmAndamento: Pedido[] = [];

  pedidosHoje = 0;
  pedidosPendentes = 0;
  pedidosProntos = 0;
  faturamentoHoje = 0;

  get pedidosAtivos(): Pedido[] {
    return this.pedidosEmAndamento.filter(pedido => pedido.status !== 'Entregue');
  }

  get pedidosFiltrados(): Pedido[] {
    const termo = this.termoBusca.trim().toLowerCase();

    return this.pedidosAtivos.filter(pedido => {
      const atendeStatus = this.filtroStatus === 'Todos' || pedido.status === this.filtroStatus;
      const atendeBusca =
        !termo ||
        pedido.codigo.toLowerCase().includes(termo) ||
        pedido.cliente.toLowerCase().includes(termo) ||
        pedido.endereco.toLowerCase().includes(termo);

      return atendeStatus && atendeBusca;
    });
  }

  calcularTotal(itens: PedidoItem[]): string {
    const total = itens.reduce((acc, item) => acc + item.qtd * item.preco, 0);
    return total.toFixed(2);
  }

  progressoPedido(pedido: Pedido): number {
    return this.progressoPorStatus[pedido.status];
  }

  textoAcao(pedido: Pedido): string {
    switch (pedido.status) {
      case 'Novo Pedido':
        return 'Aceitar Pedido';
      case 'Em Preparo':
        return 'Marcar como Pronto';
      case 'Pronto':
        return 'Aguardando motoboy';
      case 'Aguardando Motoboy':
        return 'Motoboy a caminho';
      case 'Retirado':
        return 'Em entrega';
      default:
        return 'Pedido concluído';
    }
  }

  // Avança o pedido para o próximo status. A mudança é gravada no Firestore e
  // o listener em tempo real cuida de atualizar o painel e a tela do cliente.
  async processarPedido(pedido: Pedido): Promise<void> {
    const proximo = this.proximoStatus[pedido.status];
    if (!proximo || !pedido.id) {
      return;
    }

    // Atualização otimista: reflete na hora no painel; o snapshot do Firestore
    // confirma logo em seguida (e corrige se houver divergência).
    const statusAnterior = pedido.status;
    pedido.status = proximo;
    this.atualizarResumo();
    this.cdr.detectChanges();

    try {
      await this.pedidosService.atualizarStatusPedido(pedido.id, proximo as any);
    } catch (error) {
      console.error('❌ Erro ao avançar status do pedido:', error);
      pedido.status = statusAnterior;
      this.atualizarResumo();
      this.cdr.detectChanges();
    }
  }

  // Remove visualmente um item do pedido (não altera o pedido salvo do cliente).
  excluirPrato(pedido: Pedido, item: PedidoItem): void {
    const pedidoEncontrado = this.pedidosEmAndamento.find(p => p.id === pedido.id);

    if (pedidoEncontrado) {
      pedidoEncontrado.itens = pedidoEncontrado.itens.filter(i => i.nome !== item.nome);
    }
  }

  sairDaConta(): void {
    this.logout.emit();
  }

  // Recalcula os cartões de resumo a partir dos pedidos reais do dia.
  private atualizarResumo(): void {
    const pedidosDoDia = this.pedidosEmAndamento.filter(pedido => this.mesmoDia(pedido.dataPedidoMs));

    this.pedidosHoje = pedidosDoDia.length;
    this.faturamentoHoje = pedidosDoDia.reduce((acc, pedido) => acc + (pedido.valor || 0), 0);

    this.pedidosPendentes = this.pedidosAtivos.filter(pedido =>
      pedido.status === 'Novo Pedido' || pedido.status === 'Em Preparo'
    ).length;

    this.pedidosProntos = this.pedidosAtivos.filter(pedido =>
      pedido.status === 'Pronto' || pedido.status === 'Aguardando Motoboy'
    ).length;
  }

  // ---- Helpers de data ----
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

  private tempoRelativo(ms: number): string {
    if (!ms) return '';
    const diff = Date.now() - ms;
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Agora mesmo';
    if (min < 60) return `Há ${min} min`;
    const horas = Math.floor(min / 60);
    if (horas < 24) return `Há ${horas} h`;
    const dias = Math.floor(horas / 24);
    return `Há ${dias} d`;
  }
}
