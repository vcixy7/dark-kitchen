import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProdutosRestauranteComponent } from '../produtos/produtos';
import { CuponsRestauranteComponent } from '../cupons/cupons';
import { PerfilRestauranteComponent } from '../perfil/perfil';

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
  codigo: string;
  hora: string;
  cliente: string;
  telefone: string;
  endereco: string;
  status: PedidoStatus;
  itens: PedidoItem[];
}

interface ResumoDiaStorage {
  faturamentoHoje: number;
  pedidosHoje: number;
}

const STORAGE_KEY_PEDIDOS = 'dark-kitchen-restaurante-pedidos';
const STORAGE_KEY_RESUMO = 'dark-kitchen-restaurante-resumo';

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
export class TelaRestauranteComponent implements OnInit {
  mostrarProdutos = false;
  mostrarCupons = false;
  mostrarPerfil = false;

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

  pedidosEmAndamento: Pedido[] = [
    {
      codigo: 'ORD-1772584623065',
      hora: 'Há 8 min',
      cliente: 'João Silva',
      telefone: '(11) 98765-4321',
      endereco: 'Rua das Flores, 123 - São Paulo, SP',
      status: 'Novo Pedido',
      itens: [
        { nome: 'Burger Clássico', qtd: 2, preco: 24.9 },
        { nome: 'Batata Frita', qtd: 1, preco: 12.5 }
      ]
    },
    {
      codigo: 'ORD-1772584612345',
      hora: 'Há 15 min',
      cliente: 'Maria Santos',
      telefone: '(11) 91234-5678',
      endereco: 'Av. Paulista, 1000 - São Paulo, SP',
      status: 'Em Preparo',
      itens: [
        { nome: 'Pizza Margherita', qtd: 1, preco: 38.9 }
      ]
    }
  ];

  pedidosHoje = 0;
  pedidosPendentes = 0;
  pedidosProntos = 0;
  faturamentoHoje = 0;

  ngOnInit(): void {
    this.carregarEstado();
  }

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

  private calcularTotalNumerico(itens: PedidoItem[]): number {
    return itens.reduce((acc, item) => acc + item.qtd * item.preco, 0);
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
        return 'Finalizar Pedido';
      case 'Aguardando Motoboy':
        return 'Retirado';
      case 'Retirado':
        return 'Entregue';
      default:
        return 'Pedido concluído';
    }
  }

  avancarStatus(pedido: Pedido): void {
    switch (pedido.status) {
      case 'Novo Pedido':
        pedido.status = 'Em Preparo';
        break;
      case 'Em Preparo':
        pedido.status = 'Pronto';
        break;
      case 'Pronto':
        pedido.status = 'Aguardando Motoboy';
        break;
      case 'Aguardando Motoboy':
        pedido.status = 'Retirado';
        break;
      case 'Retirado':
        pedido.status = 'Entregue';
        break;
      case 'Entregue':
        break;
    }

    this.atualizarResumo();
    this.salvarEstado();
  }

  processarPedido(pedido: Pedido): void {
    if (pedido.status === 'Pronto') {
      this.finalizarPedido(pedido);
      return;
    }

    this.avancarStatus(pedido);
  }

  finalizarPedido(pedido: Pedido): void {
    if (pedido.status === 'Pronto') {
      this.faturamentoHoje += this.calcularTotalNumerico(pedido.itens);
      this.pedidosHoje += 1;
      this.pedidosEmAndamento = this.pedidosEmAndamento.filter(p => p.codigo !== pedido.codigo);
      this.atualizarResumo();
      this.salvarEstado();
    }
  }

  excluirPrato(pedido: Pedido, item: PedidoItem): void {
    const pedidoEncontrado = this.pedidosEmAndamento.find(p => p.codigo === pedido.codigo);

    if (pedidoEncontrado) {
      pedidoEncontrado.itens = pedidoEncontrado.itens.filter(i => i.nome !== item.nome);
      this.salvarEstado();
    }
  }

  sairDaConta(): void {
    this.logout.emit();
  }

  private carregarEstado(): void {
    const pedidosSalvos = localStorage.getItem(STORAGE_KEY_PEDIDOS);
    const pedidosPadrao = this.getPedidosPadrao();

    if (pedidosSalvos) {
      try {
        const pedidos = JSON.parse(pedidosSalvos) as Pedido[];
        this.pedidosEmAndamento = Array.isArray(pedidos) && pedidos.length > 0 ? pedidos : pedidosPadrao;
      } catch {
        this.pedidosEmAndamento = pedidosPadrao;
      }
    } else {
      this.pedidosEmAndamento = pedidosPadrao;
    }

    const resumoSalvo = localStorage.getItem(STORAGE_KEY_RESUMO);

    if (resumoSalvo) {
      try {
        const resumo = JSON.parse(resumoSalvo) as ResumoDiaStorage;
        this.pedidosHoje = resumo.pedidosHoje ?? 0;
        this.faturamentoHoje = resumo.faturamentoHoje ?? 0;
      } catch {
        this.pedidosHoje = 0;
        this.faturamentoHoje = 0;
      }
    }

    this.atualizarResumo();
  }

  private getPedidosPadrao(): Pedido[] {
    return [
      {
        codigo: 'ORD-1772584623065',
        hora: 'Há 8 min',
        cliente: 'João Silva',
        telefone: '(11) 98765-4321',
        endereco: 'Rua das Flores, 123 - São Paulo, SP',
        status: 'Novo Pedido',
        itens: [
          { nome: 'Burger Clássico', qtd: 2, preco: 24.9 },
          { nome: 'Batata Frita', qtd: 1, preco: 12.5 }
        ]
      },
      {
        codigo: 'ORD-1772584612345',
        hora: 'Há 15 min',
        cliente: 'Maria Santos',
        telefone: '(11) 91234-5678',
        endereco: 'Av. Paulista, 1000 - São Paulo, SP',
        status: 'Em Preparo',
        itens: [
          { nome: 'Pizza Margherita', qtd: 1, preco: 38.9 }
        ]
      }
    ];
  }

  private atualizarResumo(): void {
    this.pedidosPendentes = this.pedidosAtivos.filter(pedido =>
      pedido.status === 'Novo Pedido' || pedido.status === 'Em Preparo'
    ).length;

    this.pedidosProntos = this.pedidosAtivos.filter(pedido =>
      pedido.status === 'Pronto' || pedido.status === 'Aguardando Motoboy'
    ).length;
  }

  private salvarEstado(): void {
    localStorage.setItem(STORAGE_KEY_PEDIDOS, JSON.stringify(this.pedidosEmAndamento));
    localStorage.setItem(
      STORAGE_KEY_RESUMO,
      JSON.stringify({
        faturamentoHoje: this.faturamentoHoje,
        pedidosHoje: this.pedidosHoje
      })
    );
  }
}