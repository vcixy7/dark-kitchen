import { Component, EventEmitter, OnInit, Output, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Acompanhamento {
  nome: string;
  preco: number;
  selecionado: boolean;
}

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  disponivel: boolean;
  emAlta: boolean;
  quantidade: number;
  acompanhamentosPossiveis?: Acompanhamento[];
  acompanhamentosEscolhidos?: Acompanhamento[];
}

interface Restaurante {
  nome: string;
  categoria: string;
  nota: number;
  tempo: string;
  taxa: number;
  imagem: string;
  cardapio: Produto[];
}

@Component({
  selector: 'app-tela-inicial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tela-inicial.html',
  styleUrls: ['./tela-inicial.css']
})
export class TelaInicialComponent implements OnInit, OnDestroy {
  @Output() logout = new EventEmitter<void>();

  termoPesquisa: string = '';
  categoriaSelecionada: string = 'Todos';
  restauranteSelecionado: Restaurante | null = null;
  carrinhoRestaurante: Restaurante | null = null;
  
  // Controle Centralizado do Fluxo de Telas: 'home' | 'carrinho' | 'status' | 'perfil'
  etapaFluxo: 'home' | 'carrinho' | 'status' | 'perfil' = 'home';
  
  // Dados do formulário do carrinho
  enderecoEntrega: string = '';
  formaPagamentoEscolhida: string = 'cartao';

  // Variáveis da Tela de Status
  codigoPedido: string = 'ORD-1779481958745';
  codigoConfirmacao: string = '8702';
  statusPedidoAtual: number = 1; 
  intervaloStatusSimulation: any;
  statusSteps = [
    { label: 'Pedido Recebido', descricao: 'Seu pedido foi confirmado e já entrou na fila do restaurante.', icone: '✓' },
    { label: 'Em Preparação', descricao: 'O restaurante está montando o pedido com cuidado e atenção.', icone: '🍳' },
    { label: 'Pronto', descricao: 'O pedido já foi finalizado e está aguardando a retirada.', icone: '📦' },
    { label: 'Motoboy no Local', descricao: 'O motoboy chegou ao restaurante e está pronto para buscar o pedido.', icone: '🏍️' },
    { label: 'Em Entrega', descricao: 'O pedido saiu para o seu endereço e está a caminho.', icone: '🚚' },
    { label: 'Entregue', descricao: 'Seu pedido foi entregue com sucesso.', icone: '🏠' }
  ];
  motoboyInfo = {
    nome: 'Beatriz Sousa',
    telefone: '(11) 98765-4321',
    veiculo: 'Moto Yamaha MT-03',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200'
  };

  // Flag para controlar se o perfil está em modo de edição ou leitura
  modoEdicaoPerfil: boolean = false;

  // Dados do Perfil do Usuário vinculados via ngModel
  clienteInfo = {
    nome: 'Renan Cardoso.',
    email: 'thiago@merecemosdez.com',
    telefone: '(11) 98765-4321',
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150',
    historicoPedidos: [
      { restaurante: 'Burger Master', status: 'Entregue', codigo: '#ORD-1772584623001', data: '07/03/2026', itens: '2 itens', valor: 64.70 },
      { restaurante: 'Pizza Bella', status: 'Entregue', codigo: '#ORD-1772584623002', data: '04/03/2026', itens: '3 itens', valor: 89.50 },
      { restaurante: 'Sushi House', status: 'Entregue', codigo: '#ORD-1772584623003', data: '28/02/2026', itens: '4 itens', valor: 156.80 }
    ]
  };

  // Propriedade para compatibilidade reversa
  get visualizandoCarrinho(): boolean { return this.etapaFluxo === 'carrinho'; }
  set visualizandoCarrinho(val: boolean) { this.etapaFluxo = val ? 'carrinho' : 'home'; }
  
  // Controle do Modal de Customização
  exibirModalAcompanhamentos: boolean = false;
  produtoEmCustomizacao: Produto | null = null;
  acompanhamentosTemporarios: Acompanhamento[] = [];

  categorias: string[] = ['Todos', 'Hambúrgueres', 'Pizzas', 'Japonesa', 'Italiana', 'Brasileira', 'Saudável'];

  restaurantes: Restaurante[] = [
    {
      nome: 'Burger Master',
      categoria: 'Hambúrgueres',
      nota: 4.8,
      tempo: '20-30 min',
      taxa: 5.99,
      imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500',
      cardapio: [
        {
          id: 1,
          nome: 'Burger Clássico',
          descricao: 'Hambúrguer artesanal com queijo cheddar, alface, tomate e molho especial.',
          preco: 25.90,
          imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0,
          acompanhamentosPossiveis: [
            { nome: 'Batata Frita Palito', preco: 7.90, selecionado: false },
            { nome: 'Anéis de Cebola', preco: 9.90, selecionado: false },
            { nome: 'Refrigerante Lata', preco: 5.00, selecionado: false }
          ]
        },
        {
          id: 2,
          nome: 'Burger Bacon',
          descricao: 'Hambúrguer com bacon crocante, queijo e cebola caramelizada.',
          preco: 29.90,
          imagem: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0,
          acompanhamentosPossiveis: [
            { nome: 'Batata Rústica', preco: 8.90, selecionado: false },
            { nome: 'Molho Barbecue Extra', preco: 2.50, selecionado: false }
          ]
        },
        {
          id: 3,
          nome: 'Double Cheeseburger',
          descricao: 'Dois hambúrgueres, queijo cheddar duplo, picles e molho especial.',
          preco: 34.90,
          imagem: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0
        },
        {
          id: 4,
          nome: 'Chicken Burger Especial',
          descricao: 'Frango crocante com maionese artesanal, alface e pão brioche.',
          preco: 27.90,
          imagem: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0
        }
      ]
    },
    {
      nome: 'Smash Burger House',
      categoria: 'Hambúrgueres',
      nota: 4.9,
      tempo: '25-35 min',
      taxa: 0,
      imagem: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=500',
      cardapio: [
        {
          id: 5,
          nome: 'Smash Duplo',
          descricao: 'Hambúrguer smash com cheddar, onion crispy e molho house.',
          preco: 32.90,
          imagem: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0
        },
        {
          id: 6,
          nome: 'Smash Bacon Egg',
          descricao: 'Hambúrguer smash com bacon, ovo e queijo gouda.',
          preco: 35.90,
          imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0
        },
        {
          id: 7,
          nome: 'Batata Smash',
          descricao: 'Batatas fritas crocantes com cheddar e bacon.',
          preco: 12.90,
          imagem: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0
        }
      ]
    },
    {
      nome: 'Pizza Bella',
      categoria: 'Pizzas',
      nota: 4.9,
      tempo: '30-40 min',
      taxa: 6.99,
      imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500',
      cardapio: [
        {
          id: 8,
          nome: 'Pizza Margherita',
          descricao: 'Mussarela de búfala, tomate, manjericão e molho artesanal.',
          preco: 42.90,
          imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0
        },
        {
          id: 9,
          nome: 'Pizza Pepperoni',
          descricao: 'Pepperoni, queijo mussarela e borda recheada.',
          preco: 49.90,
          imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0
        },
        {
          id: 10,
          nome: 'Calzone Recheado',
          descricao: 'Calzone de queijo, presunto e champignon.',
          preco: 38.90,
          imagem: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0
        }
      ]
    },
    {
      nome: 'Pizzaria Napolitana',
      categoria: 'Pizzas',
      nota: 4.7,
      tempo: '20-30 min',
      taxa: 0,
      imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500',
      cardapio: [
        {
          id: 11,
          nome: 'Pizza Quatro Queijos',
          descricao: 'Mussarela, gorgonzola, parmesão e provolone.',
          preco: 45.90,
          imagem: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0
        },
        {
          id: 12,
          nome: 'Pizza de Frango com Catupiry',
          descricao: 'Frango desfiado, catupiry e milho.',
          preco: 47.90,
          imagem: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0
        },
        {
          id: 13,
          nome: 'Focaccia de Alecrim',
          descricao: 'Focaccia artesanal com azeite e alecrim.',
          preco: 18.90,
          imagem: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0
        }
      ]
    },
    {
      nome: 'Sushi House',
      categoria: 'Japonesa',
      nota: 4.8,
      tempo: '35-45 min',
      taxa: 7.99,
      imagem: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500',
      cardapio: [
        {
          id: 14,
          nome: 'Combo Sushi Deluxe',
          descricao: 'Sushi, sashimi e temaki para duas pessoas.',
          preco: 89.90,
          imagem: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0
        },
        {
          id: 15,
          nome: 'Temaki Salmão',
          descricao: 'Salmão fresco, cream cheese e cebolinha.',
          preco: 24.90,
          imagem: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0
        },
        {
          id: 16,
          nome: 'Hot Roll Especial',
          descricao: 'Roll quente com cream cheese e frango crocante.',
          preco: 29.90,
          imagem: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0
        }
      ]
    },
    {
      nome: 'Casa da Massa',
      categoria: 'Italiana',
      nota: 4.7,
      tempo: '25-35 min',
      taxa: 6.49,
      imagem: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=500',
      cardapio: [
        {
          id: 17,
          nome: 'Ravioli ao Funghi',
          descricao: 'Ravioli recheado com ricota e funghi cremoso.',
          preco: 39.90,
          imagem: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0
        },
        {
          id: 18,
          nome: 'Lasanha Bolonhesa',
          descricao: 'Lasanha clássica com molho bolognese e queijo gratinado.',
          preco: 43.90,
          imagem: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0
        },
        {
          id: 19,
          nome: 'Pesto alla Genovese',
          descricao: 'Pesto caseiro com espaguete e parmesão.',
          preco: 36.90,
          imagem: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0
        }
      ]
    },
    {
      nome: 'Green Bites',
      categoria: 'Saudável',
      nota: 4.9,
      tempo: '20-30 min',
      taxa: 0,
      imagem: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=500',
      cardapio: [
        {
          id: 20,
          nome: 'Bowl Verde',
          descricao: 'Quinoa, avocado, tomate, espinafre e vinagrete.',
          preco: 31.90,
          imagem: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0
        },
        {
          id: 21,
          nome: 'Wrap de Frango',
          descricao: 'Wrap integral com frango grelhado, alface e molho de iogurte.',
          preco: 29.90,
          imagem: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0
        },
        {
          id: 22,
          nome: 'Smoothie Power',
          descricao: 'Açaí, banana e linhaça para um boost energético.',
          preco: 18.90,
          imagem: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0
        }
      ]
    },
    {
      nome: 'Churrasco do Zé',
      categoria: 'Brasileira',
      nota: 4.8,
      tempo: '35-45 min',
      taxa: 4.99,
      imagem: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=500',
      cardapio: [
        {
          id: 23,
          nome: 'Prato Feito do Zé',
          descricao: 'Arroz, farofa, feijão e escolha de carne suína ou bovina.',
          preco: 34.90,
          imagem: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0
        },
        {
          id: 24,
          nome: 'Espetinho de Frango',
          descricao: 'Espetinho artesanal com farofa e molho chimichurri.',
          preco: 26.90,
          imagem: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0
        },
        {
          id: 25,
          nome: 'Farofa Especial',
          descricao: 'Farofa crocante com bacon e banana.',
          preco: 11.90,
          imagem: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0
        }
      ]
    }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}
  ngOnDestroy(): void { this.limparSimuladorStatus(); }

  selecionarCategoria(categoria: string): void { this.categoriaSelecionada = categoria; }
  
  get restaurantesFiltrados(): Restaurante[] {
    return this.restaurantes.filter(resto => {
      const bateCategoria = this.categoriaSelecionada === 'Todos' || resto.categoria === this.categoriaSelecionada;
      return bateCategoria && resto.nome.toLowerCase().includes(this.termoPesquisa.toLowerCase());
    });
  }

  get restauranteParaCarrinho(): Restaurante | null { return this.carrinhoRestaurante ?? this.restauranteSelecionado; }
  
  selecionarRestaurante(resto: Restaurante): void { 
    this.restauranteSelecionado = resto; 
    this.carrinhoRestaurante = resto; 
    this.etapaFluxo = 'home'; 
  }
  
  voltarParaLista(): void { 
    this.carrinhoRestaurante = this.restauranteSelecionado ?? this.carrinhoRestaurante; 
    this.restauranteSelecionado = null; 
    this.etapaFluxo = 'home'; 
  }

  solicitarAdicao(produto: Produto): void {
    if (!produto.disponivel) return;
    if (produto.acompanhamentosPossiveis && produto.acompanhamentosPossiveis.length > 0) {
      this.produtoEmCustomizacao = produto;
      this.acompanhamentosTemporarios = produto.acompanhamentosPossiveis.map(ac => ({ ...ac, selecionado: false }));
      this.exibirModalAcompanhamentos = true;
    } else { 
      produto.quantidade = 1; 
    }
  }

  confirmarAcompanhamentos(): void {
    if (this.produtoEmCustomizacao) {
      this.produtoEmCustomizacao.acompanhamentosEscolhidos = this.acompanhamentosTemporarios.filter(a => a.selecionado);
      this.produtoEmCustomizacao.quantidade = 1;
    }
    this.fecharModal();
  }

  fecharModal(): void { this.exibirModalAcompanhamentos = false; this.produtoEmCustomizacao = null; }
  alterarQuantidade(produto: Produto, valor: number): void { produto.quantidade += valor; if (produto.quantidade < 0) produto.quantidade = 0; }
  irParaCarrinho(): void { this.etapaFluxo = 'carrinho'; }
  abrirPerfil(): void { this.etapaFluxo = 'perfil'; this.modoEdicaoPerfil = false; }
  voltarDoCarrinho(): void { this.etapaFluxo = 'home'; }
  sairDaConta(): void { if (window.confirm('Deseja realmente sair?')) { this.logout.emit(); } }

  // Função funcional do botão de Editar/Salvar informações do perfil
  alternarEdicaoPerfil(): void {
    if (this.modoEdicaoPerfil) {
      console.log('Dados salvos com sucesso:', this.clienteInfo);
      alert('Informações atualizadas com sucesso!');
    }
    this.modoEdicaoPerfil = !this.modoEdicaoPerfil;
  }

  finalizarPedido(): void {
    this.codigoPedido = 'ORD-' + Math.floor(1000000000000 + Math.random() * 9000000000000);
    this.codigoConfirmacao = Math.floor(1000 + Math.random() * 9000).toString();
    this.statusPedidoAtual = 1;
    this.etapaFluxo = 'status';
    this.limparSimuladorStatus();
    this.intervaloStatusSimulation = setInterval(() => this.avancarStatusPedido(), 2000);
  }

  private avancarStatusPedido(): void {
    if (this.statusPedidoAtual < this.statusSteps.length) {
      this.statusPedidoAtual++;
      this.statusSteps = [...this.statusSteps];
      this.cdr.detectChanges();
    } else { this.limparSimuladorStatus(); }
  }

  voltarParaHomeLimpo(): void {
    if (this.restauranteParaCarrinho) { this.restauranteParaCarrinho.cardapio.forEach(p => p.quantidade = 0); }
    this.limparSimuladorStatus();
    this.restauranteSelecionado = null;
    this.etapaFluxo = 'home';
  }

  limparSimuladorStatus(): void { if (this.intervaloStatusSimulation) { clearInterval(this.intervaloStatusSimulation); this.intervaloStatusSimulation = undefined; } }
  get etapaAtual() { return this.statusSteps[this.statusPedidoAtual - 1]; }
  get progressoPedido(): number { return Math.round((this.statusPedidoAtual / this.statusSteps.length) * 100); }
  get motoboyNoLocal(): boolean { return this.statusPedidoAtual >= 4; }
  get totalItensCarrinho(): number { return this.restauranteParaCarrinho?.cardapio.reduce((acc, prod) => acc + prod.quantidade, 0) || 0; }
  get valorTotalCarrinho(): number {
    return this.restauranteParaCarrinho?.cardapio.reduce((acc, prod) => {
      const custoAdicionais = prod.acompanhamentosEscolhidos?.reduce((sum, item) => sum + item.preco, 0) || 0;
      return acc + (prod.quantidade > 0 ? (prod.preco + custoAdicionais) * prod.quantidade : 0);
    }, 0) || 0;
  }
}