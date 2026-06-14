import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { PedidosService } from '../../../services/pedidos.service';
import { ProdutosService } from '../../../services/produtos.service';
import { CuponsService } from '../../../services/cupons.service';

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
  styleUrls: ['./tela-inicial.css'],
})
export class TelaInicialComponent implements OnInit, OnDestroy {
  @Output() logout = new EventEmitter<void>();
  @ViewChild('fotoInput') fotoInput!: ElementRef<HTMLInputElement>;

  termoPesquisa: string = '';
  restauranteSelecionado: Restaurante | null = null;
  carrinhoRestaurante: Restaurante | null = null;

  // TODO: este bloco centraliza o fluxo principal da tela do cliente entre home, carrinho, status e perfil.
  etapaFluxo: 'home' | 'carrinho' | 'status' | 'perfil' = 'home';

  // Dados do formulário do carrinho
  enderecoEntrega: string = '';
  formaPagamentoEscolhida: string = 'cartao';

  // TODO: estas propriedades controlam a simulação e a animação do status do pedido na tela de acompanhamento.
  codigoPedido: string = 'ORD-1779481958745';
  codigoConfirmacao: string = '8702';
  statusPedidoAtual: number = 1;
  intervaloStatusSimulation: any;
  intervaloAnimacaoStatus: any;
  statusSteps = [
    {
      label: 'Pedido Recebido',
      descricao: 'Seu pedido foi confirmado e já entrou na fila do restaurante.',
      icone: '✓',
    },
    {
      label: 'Em Preparação',
      descricao: 'O restaurante está montando o pedido com cuidado e atenção.',
      icone: '🍳',
    },
    {
      label: 'Pronto',
      descricao: 'O pedido já foi finalizado e está aguardando a retirada.',
      icone: '📦',
    },
    {
      label: 'Motoboy no Local',
      descricao: 'O motoboy chegou ao restaurante e está pronto para buscar o pedido.',
      icone: '🏍️',
    },
    {
      label: 'Em Entrega',
      descricao: 'O pedido saiu para o seu endereço e está a caminho.',
      icone: '🚚',
    },
    { label: 'Entregue', descricao: 'Seu pedido foi entregue com sucesso.', icone: '🏠' },
  ];
  // Preenchido com o motoboy REAL do pedido (via motoboyId) quando ele assume a
  // entrega. O avatar recebe o placeholder no construtor (avatarPadrao só existe
  // depois que o campo é inicializado).
  motoboyInfo = {
    nome: 'Motoboy a caminho',
    telefone: '',
    veiculo: '',
    avatar: '',
  };

  // Id do motoboy já carregado, para não buscar o mesmo motoboy repetidamente.
  private motoboyIdCarregado: string | null = null;

  // Flag para controlar se o perfil está em modo de edição ou leitura
  modoEdicaoPerfil: boolean = false;

  // Guarda o email original para detectar quando o usuário troca de email
  private emailOriginal: string = '';

  // Avatar padrão (placeholder "sem foto") — só muda se o usuário enviar uma foto
  readonly avatarPadrao =
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="#e2e8f0"/><circle cx="75" cy="56" r="26" fill="#94a3b8"/><path d="M28 132c0-26 21-42 47-42s47 16 47 42z" fill="#94a3b8"/></svg>`,
    );

  // Placeholder para imagens de restaurantes/produtos que não carregam
  readonly imagemPadrao =
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f1f5f9"/><g fill="#cbd5e1"><circle cx="200" cy="118" r="46"/><path d="M154 118a46 46 0 0 0 92 0"/></g><text x="200" y="214" font-family="sans-serif" font-size="19" fill="#94a3b8" text-anchor="middle">Imagem indisponível</text></svg>`,
    );

  // Dados do Perfil do Usuário vinculados via ngModel
  clienteInfo = {
    nome: 'Renan Cardoso.',
    email: 'thiago@merecemosdez.com',
    telefone: '(11) 98765-4321',
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    avatar: this.avatarPadrao,
    historicoPedidos: [] as any[],
  };

  // TODO: este id identifica o pedido atual que está sendo acompanhado na tela de status.
  pedidoAtualId: string | null = null;
  // Detalhes do pedido para a tela de "Pedido concluído"
  pedidoDetalhe: any = null;

  // Propriedade para compatibilidade reversa
  get visualizandoCarrinho(): boolean {
    return this.etapaFluxo === 'carrinho';
  }
  set visualizandoCarrinho(val: boolean) {
    this.etapaFluxo = val ? 'carrinho' : 'home';
  }

  // Controle do Modal de Customização
  exibirModalAcompanhamentos: boolean = false;
  produtoEmCustomizacao: Produto | null = null;
  acompanhamentosTemporarios: Acompanhamento[] = [];

  categorias: string[] = [
    'Todos',
    'brasileira',
    'pizzaria',
    'hamburgueria',
    'japonesa',
    'italiana',
    'tailandesa',
    'coreana',
    'mexicana',
    'indiana',
    'vegetariana',
  ];

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
          preco: 25.9,
          imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0,
          acompanhamentosPossiveis: [
            { nome: 'Batata Frita Palito', preco: 7.9, selecionado: false },
            { nome: 'Anéis de Cebola', preco: 9.9, selecionado: false },
            { nome: 'Refrigerante Lata', preco: 5.0, selecionado: false },
          ],
        },
        {
          id: 2,
          nome: 'Burger Bacon',
          descricao: 'Hambúrguer com bacon crocante, queijo e cebola caramelizada.',
          preco: 29.9,
          imagem: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0,
          acompanhamentosPossiveis: [
            { nome: 'Batata Rústica', preco: 8.9, selecionado: false },
            { nome: 'Molho Barbecue Extra', preco: 2.5, selecionado: false },
          ],
        },
        {
          id: 3,
          nome: 'Double Cheeseburger',
          descricao: 'Dois hambúrgueres, queijo cheddar duplo, picles e molho especial.',
          preco: 34.9,
          imagem: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0,
        },
        {
          id: 4,
          nome: 'Chicken Burger Especial',
          descricao: 'Frango crocante com maionese artesanal, alface e pão brioche.',
          preco: 27.9,
          imagem: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0,
        },
      ],
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
          preco: 32.9,
          imagem: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0,
        },
        {
          id: 6,
          nome: 'Smash Bacon Egg',
          descricao: 'Hambúrguer smash com bacon, ovo e queijo gouda.',
          preco: 35.9,
          imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0,
        },
        {
          id: 7,
          nome: 'Batata Smash',
          descricao: 'Batatas fritas crocantes com cheddar e bacon.',
          preco: 12.9,
          imagem: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0,
        },
      ],
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
          preco: 42.9,
          imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0,
        },
        {
          id: 9,
          nome: 'Pizza Pepperoni',
          descricao: 'Pepperoni, queijo mussarela e borda recheada.',
          preco: 49.9,
          imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0,
        },
        {
          id: 10,
          nome: 'Calzone Recheado',
          descricao: 'Calzone de queijo, presunto e champignon.',
          preco: 38.9,
          imagem: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0,
        },
      ],
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
          preco: 45.9,
          imagem: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0,
        },
        {
          id: 12,
          nome: 'Pizza de Frango com Catupiry',
          descricao: 'Frango desfiado, catupiry e milho.',
          preco: 47.9,
          imagem: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0,
        },
        {
          id: 13,
          nome: 'Focaccia de Alecrim',
          descricao: 'Focaccia artesanal com azeite e alecrim.',
          preco: 18.9,
          imagem: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0,
        },
      ],
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
          preco: 89.9,
          imagem: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0,
        },
        {
          id: 15,
          nome: 'Temaki Salmão',
          descricao: 'Salmão fresco, cream cheese e cebolinha.',
          preco: 24.9,
          imagem: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0,
        },
        {
          id: 16,
          nome: 'Hot Roll Especial',
          descricao: 'Roll quente com cream cheese e frango crocante.',
          preco: 29.9,
          imagem: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0,
        },
      ],
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
          preco: 39.9,
          imagem: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0,
        },
        {
          id: 18,
          nome: 'Lasanha Bolonhesa',
          descricao: 'Lasanha clássica com molho bolognese e queijo gratinado.',
          preco: 43.9,
          imagem: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0,
        },
        {
          id: 19,
          nome: 'Pesto alla Genovese',
          descricao: 'Pesto caseiro com espaguete e parmesão.',
          preco: 36.9,
          imagem: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0,
        },
      ],
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
          preco: 31.9,
          imagem: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0,
        },
        {
          id: 21,
          nome: 'Wrap de Frango',
          descricao: 'Wrap integral com frango grelhado, alface e molho de iogurte.',
          preco: 29.9,
          imagem: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0,
        },
        {
          id: 22,
          nome: 'Smoothie Power',
          descricao: 'Açaí, banana e linhaça para um boost energético.',
          preco: 18.9,
          imagem: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0,
        },
      ],
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
          preco: 34.9,
          imagem: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=150',
          disponivel: true,
          emAlta: true,
          quantidade: 0,
        },
        {
          id: 24,
          nome: 'Espetinho de Frango',
          descricao: 'Espetinho artesanal com farofa e molho chimichurri.',
          preco: 26.9,
          imagem: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0,
        },
        {
          id: 25,
          nome: 'Farofa Especial',
          descricao: 'Farofa crocante com bacon e banana.',
          preco: 11.9,
          imagem: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=150',
          disponivel: true,
          emAlta: false,
          quantidade: 0,
        },
      ],
    },
  ];

  cupomAplicado = '';
  descontoCupom = 0;
  mensagemCupom = '';
  unsubscribeRestaurantes: any;
  unsubscriberProdutos: any = {};
  unsubscribePedido: any;
  categoriasDisponiveis: string[] = ['Todas'];
  // Home (lista de restaurantes) usa 'Todos'; dentro do restaurante o filtro de
  // produtos usa 'Todas'. Iniciar em 'Todos' para a home mostrar tudo no login.
  categoriaSelecionada = 'Todos';
  resultadosPesquisa: any[] = [];
  mostrarvResultadosPesquisa = false;
  statusMap: { [key: string]: number } = {
    'Novo Pedido': 1,
    'Em Preparo': 2,
    Pronto: 3,
    'Aguardando Motoboy': 4,
    Retirado: 5,
    'Em Entrega': 5,
    Entregue: 6,
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private userService: UserService,
    private pedidosService: PedidosService,
    private produtosService: ProdutosService,
    private cuponsService: CuponsService,
  ) {
    this.motoboyInfo.avatar = this.avatarPadrao;
  }

  async ngOnInit() {
    // Restaura o carrinho salvo localmente (sobrevive a recarregar a página)
    this.restaurarCarrinho();
    // Carrega os restaurantes ANTES do histórico para conseguir esconder os
    // pedidos de restaurantes que não existem mais (ver carregarPedidosCliente).
    await this.carregarRestaurantes();
    await Promise.all([this.carregarDadosUsuario(), this.carregarPedidosCliente()]);
  }

  async carregarRestaurantes() {
    try {
      const restaurantesFirebase = await this.userService.obterRestaurantes();
      this.restaurantes = restaurantesFirebase.map(
        (r) =>
          ({
            nome: r.nomeRestaurante || 'Restaurante',
            categoria: r.categoria || 'Geral',
            nota: 4.8,
            tempo: '30-40 min',
            taxa: 5.99,
            imagem: r.fotoRestauranteUrl || this.imagemPadrao,
            cardapio: [],
            _restauranteId: r.userId,
          }) as any,
      );
      console.log('✅ Restaurantes carregados:', this.restaurantes.length);
      // Firestore responde fora da zona do Angular: força a atualização da view
      // (sem isso a home continua mostrando os restaurantes de exemplo).
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erro ao carregar restaurantes:', error);
    }
  }

  carregarProdutosRestaurante(restaurante: any) {
    // Lazy load: só carrega quando clica no restaurante
    if (restaurante.cardapio.length > 0) {
      this.atualizarCategorias();
      return;
    }

    const restauranteIdx = this.restaurantes.indexOf(restaurante);
    if (restauranteIdx === -1) return;

    this.unsubscriberProdutos[restaurante._restauranteId] =
      this.produtosService.escutarProdutosRestaurante(restaurante._restauranteId, (produtos) => {
        // Preserva o que já estava no carrinho (quantidade/acompanhamentos)
        // para o snapshot do Firestore não zerar os itens adicionados.
        const anteriores = this.restaurantes[restauranteIdx].cardapio || [];
        const salvos = this.itensSalvosDoCarrinho(restaurante._restauranteId);
        this.restaurantes[restauranteIdx].cardapio = produtos.map((p: any) => {
          const antigo = anteriores.find((a: any) => a.nome === p.nome);
          const salvo = salvos.find((s: any) => s.nome === p.nome);
          const ref = antigo || salvo;
          return {
            id: parseInt(p.id) || Date.now(),
            nome: p.nome,
            descricao: p.descricao,
            preco: p.preco,
            imagem: p.imagem,
            categoria: p.categoria || 'Outros',
            disponivel: p.disponivel,
            emAlta: p.emAlta,
            quantidade: ref?.quantidade || 0,
            acompanhamentosPossiveis: p.acompanhamentosPossiveis || [],
            acompanhamentosEscolhidos: ref?.acompanhamentosEscolhidos || [],
          };
        });
        this.atualizarCategorias();
        this.cdr.detectChanges();
      });
  }

  async carregarDadosUsuario() {
    try {
      const user = this.authService.getCurrentUserSync();
      if (user) {
        const dados = await this.userService.obterUser(user.uid);
        if (dados) {
          const enderecoMontado =
            `${dados.rua || ''}, ${dados.numero || ''} - ${dados.cidade || ''}, ${dados.estado || ''}`
              .replace(/^[,\s-]+|[,\s-]+$/g, '')
              .trim();
          this.clienteInfo = {
            nome: `${dados.nome || ''} ${dados.sobrenome || ''}`.trim() || 'Usuário',
            email: dados.email || user.email || '',
            telefone: dados.telefone || '',
            endereco: dados.enderecoCompleto || enderecoMontado,
            avatar: dados.fotoUrl || this.avatarPadrao,
            historicoPedidos: [],
          };
          this.emailOriginal = this.clienteInfo.email;
          console.log('✅ Dados do usuário carregados:', this.clienteInfo);
          this.cdr.detectChanges();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  }

  ngOnDestroy(): void {
    this.limparSimuladorStatus();
    if (this.unsubscribeRestaurantes) {
      this.unsubscribeRestaurantes();
    }
    if (this.unsubscribePedido) {
      this.unsubscribePedido();
    }
    Object.values(this.unsubscriberProdutos).forEach((unsub: any) => {
      if (unsub) unsub();
    });
  }

  selecionarCategoria(categoria: string): void {
    this.categoriaSelecionada = categoria;
  }

  get restaurantesFiltrados(): Restaurante[] {
    return this.restaurantes.filter((resto) => {
      const bateCategoria =
        this.categoriaSelecionada === 'Todos' ||
        resto.categoria?.toLowerCase() === this.categoriaSelecionada?.toLowerCase();
      const batePesquisa =
        resto.nome.toLowerCase().includes(this.termoPesquisa.toLowerCase()) ||
        resto.categoria?.toLowerCase().includes(this.termoPesquisa.toLowerCase());
      return bateCategoria && batePesquisa;
    });
  }

  get restauranteParaCarrinho(): Restaurante | null {
    return this.carrinhoRestaurante ?? this.restauranteSelecionado;
  }

  selecionarRestaurante(resto: any): void {
    this.restauranteSelecionado = resto;
    this.carrinhoRestaurante = resto;
    this.etapaFluxo = 'home';
    this.categoriaSelecionada = 'Todas';
    this.termoPesquisa = '';
    // Lazy load de produtos quando clica no restaurante
    this.carregarProdutosRestaurante(resto);
  }

  get produtosFiltrados(): any[] {
    if (!this.restauranteSelecionado) return [];

    let produtos = this.restauranteSelecionado.cardapio || [];

    // Filtrar por categoria
    if (this.categoriaSelecionada !== 'Todas') {
      produtos = produtos.filter((p: any) => p.categoria === this.categoriaSelecionada);
    }

    // Filtrar por busca
    const termo = this.termoPesquisa.toLowerCase().trim();
    if (termo) {
      produtos = produtos.filter(
        (p: any) =>
          p.nome.toLowerCase().includes(termo) ||
          p.descricao.toLowerCase().includes(termo) ||
          (p.categoria && p.categoria.toLowerCase().includes(termo)),
      );
    }

    return produtos;
  }

  private atualizarCategorias(): void {
    const categorias = new Set<string>();
    categorias.add('Todas');

    if (this.restauranteSelecionado?.cardapio) {
      this.restauranteSelecionado.cardapio.forEach((produto: any) => {
        if (produto.categoria) {
          categorias.add(produto.categoria);
        }
      });
    }

    this.categoriasDisponiveis = Array.from(categorias);
  }

  voltarParaLista(): void {
    this.carrinhoRestaurante = this.restauranteSelecionado ?? this.carrinhoRestaurante;
    this.restauranteSelecionado = null;
    this.etapaFluxo = 'home';
    this.categoriaSelecionada = 'Todos'; // volta o filtro da home para "Todos"
    this.termoPesquisa = '';
  }

  solicitarAdicao(produto: Produto): void {
    if (!produto.disponivel) return;
    if (produto.acompanhamentosPossiveis && produto.acompanhamentosPossiveis.length > 0) {
      this.produtoEmCustomizacao = produto;
      this.acompanhamentosTemporarios = produto.acompanhamentosPossiveis.map((ac) => ({
        ...ac,
        selecionado: false,
      }));
      this.exibirModalAcompanhamentos = true;
    } else {
      produto.quantidade = 1;
      this.salvarCarrinho();
    }
  }

  confirmarAcompanhamentos(): void {
    if (this.produtoEmCustomizacao) {
      this.produtoEmCustomizacao.acompanhamentosEscolhidos = this.acompanhamentosTemporarios.filter(
        (a) => a.selecionado,
      );
      this.produtoEmCustomizacao.quantidade = 1;
    }
    this.salvarCarrinho();
    this.fecharModal();
  }

  fecharModal(): void {
    this.exibirModalAcompanhamentos = false;
    this.produtoEmCustomizacao = null;
  }
  alterarQuantidade(produto: Produto, valor: number): void {
    produto.quantidade += valor;
    if (produto.quantidade < 0) produto.quantidade = 0;
    this.salvarCarrinho();
  }
  irParaCarrinho(): void {
    this.etapaFluxo = 'carrinho';
  }
  abrirPerfil(): void {
    this.etapaFluxo = 'perfil';
    this.modoEdicaoPerfil = false;
  }
  voltarDoCarrinho(): void {
    this.etapaFluxo = 'home';
    if (!this.restauranteSelecionado) {
      this.categoriaSelecionada = 'Todos';
    }
  }
  sairDaConta(): void {
    if (window.confirm('Deseja realmente sair?')) {
      this.logout.emit();
    }
  }

  // Botão Editar/Salvar do perfil
  async alternarEdicaoPerfil(): Promise<void> {
    // Entrando no modo de edição: apenas libera os campos
    if (!this.modoEdicaoPerfil) {
      this.modoEdicaoPerfil = true;
      return;
    }
    // Saindo do modo de edição: salvar de verdade
    await this.salvarPerfil();
  }

  private async salvarPerfil(): Promise<void> {
    const user = this.authService.getCurrentUserSync();
    if (!user) {
      alert('Sua sessão expirou. Faça login novamente para salvar.');
      return;
    }

    const novoEmail = (this.clienteInfo.email || '').trim();
    const emailMudou = !!novoEmail && novoEmail.toLowerCase() !== this.emailOriginal.toLowerCase();

    try {
      // 1) Salvar os campos do perfil no Firestore (sem o email ainda)
      const partesNome = this.clienteInfo.nome.trim().split(/\s+/);
      const primeiroNome = partesNome.shift() || '';
      const sobrenome = partesNome.join(' ');

      await this.userService.atualizarUser(user.uid, {
        nome: primeiroNome,
        sobrenome,
        telefone: this.clienteInfo.telefone || '',
        enderecoCompleto: this.clienteInfo.endereco || '',
        fotoUrl: this.clienteInfo.avatar === this.avatarPadrao ? '' : this.clienteInfo.avatar,
      });

      // 2) Se o email mudou, alterar no login (Firebase Auth) e só então no Firestore
      if (emailMudou) {
        try {
          const modo = await this.authService.atualizarEmail(novoEmail);
          await this.userService.atualizarUser(user.uid, { email: novoEmail });
          this.emailOriginal = novoEmail;
          if (modo === 'verificacao') {
            alert(
              'Enviamos um link de confirmação para ' +
                novoEmail +
                '.\n\nApós confirmar pelo link, faça login com o NOVO email.',
            );
          } else {
            alert('Email alterado com sucesso! No próximo login use: ' + novoEmail);
          }
        } catch (err: any) {
          // Reverte o email exibido para não enganar o usuário
          this.clienteInfo.email = this.emailOriginal;
          if (err?.code === 'auth/requires-recent-login') {
            alert(
              'Por segurança, saia e entre novamente antes de trocar o email. Seus outros dados foram salvos.',
            );
          } else if (err?.code === 'auth/email-already-in-use') {
            alert('Esse email já está em uso por outra conta. Os outros dados foram salvos.');
          } else if (err?.code === 'auth/invalid-email') {
            alert('Email inválido. Os outros dados foram salvos.');
          } else {
            console.error('Erro ao atualizar email no Auth:', err);
            alert('Não foi possível alterar o email de login agora. Os outros dados foram salvos.');
          }
        }
      } else {
        alert('Informações atualizadas com sucesso!');
      }

      this.modoEdicaoPerfil = false;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar suas informações. Tente novamente.');
    }
  }

  // Abre o seletor de arquivo para o usuário escolher uma foto de perfil
  abrirSeletorFoto(): void {
    this.fotoInput?.nativeElement.click();
  }

  // Lê a foto escolhida, reduz o tamanho e salva como avatar do usuário
  aoEscolherFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    input.value = ''; // permite reescolher o mesmo arquivo depois
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = async () => {
        // Redimensiona para no máximo 240px mantendo a proporção
        const max = 240;
        let { width, height } = img;
        if (width > height && width > max) {
          height = Math.round((height * max) / width);
          width = max;
        } else if (height >= width && height > max) {
          width = Math.round((width * max) / height);
          height = max;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        this.clienteInfo.avatar = dataUrl;
        const user = this.authService.getCurrentUserSync();
        if (user) {
          try {
            await this.userService.atualizarUser(user.uid, { fotoUrl: dataUrl });
          } catch (e) {
            console.error('Erro ao salvar a foto de perfil:', e);
          }
        }
        this.cdr.detectChanges();
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // Quando uma imagem (restaurante/produto/avatar) falha ao carregar, troca por um placeholder
  tratarErroImagem(event: Event, tipo: 'comida' | 'avatar' = 'comida'): void {
    const img = event.target as HTMLImageElement;
    const fallback = tipo === 'avatar' ? this.avatarPadrao : this.imagemPadrao;
    if (img.getAttribute('src') !== fallback) {
      img.src = fallback;
    }
  }

  async finalizarPedido(): Promise<void> {
    try {
      const user = this.authService.getCurrentUserSync();
      const restaurante = this.restauranteParaCarrinho;

      if (!user || !restaurante) {
        alert('Erro: Usuário ou restaurante não encontrado');
        return;
      }

      // Itens com imagem e acompanhamentos (para o resumo do pedido concluído)
      const itens = restaurante.cardapio
        .filter((p) => p.quantidade > 0)
        .map((p) => ({
          nome: p.nome,
          preco: p.preco,
          quantidade: p.quantidade,
          imagem: p.imagem || '',
          acompanhamentos: (p.acompanhamentosEscolhidos || []).map((a) => ({
            nome: a.nome,
            preco: a.preco,
          })),
        }));

      if (itens.length === 0) {
        alert('Seu carrinho está vazio.');
        return;
      }

      const subtotal = itens.reduce((s, i) => {
        const ac = i.acompanhamentos.reduce((x, a) => x + (a.preco || 0), 0);
        return s + (i.preco + ac) * i.quantidade;
      }, 0);
      const taxaEntrega = (restaurante as any).taxa || 0;
      const desconto = this.descontoCupom || 0;
      const valor = subtotal - desconto;
      const codigo = 'ORD-' + Math.floor(1000000000000 + Math.random() * 9000000000000);
      const codigoConfirmacao = Math.floor(1000 + Math.random() * 9000).toString();
      const formaPagamento =
        this.formaPagamentoEscolhida === 'pix' ? 'Pix' : 'Cartão de Crédito / Débito';
      const endereco = (this.enderecoEntrega || this.clienteInfo?.endereco || '').trim();

      const pedido = {
        // usa o id real do restaurante para que ele apareça no painel do restaurante
        restauranteId: (restaurante as any)._restauranteId || restaurante.nome,
        clienteId: user.uid,
        codigo,
        codigoConfirmacao,
        cliente: {
          nome: this.clienteInfo?.nome || 'Cliente',
          telefone: this.clienteInfo?.telefone || '',
          endereco: this.clienteInfo?.endereco || '',
        },
        restaurante: {
          nome: restaurante.nome,
          endereco: 'Endereço do restaurante',
        },
        itens,
        valor,
        subtotal,
        desconto,
        taxaEntrega,
        formaPagamento,
        enderecoEntrega: endereco,
        status: 'Novo Pedido' as any,
        dataPedido: new Date(),
      };

      const pedidoId = await this.pedidosService.criarPedido(pedido as any);

      this.pedidoAtualId = pedidoId;
      this.codigoPedido = codigo;
      this.codigoConfirmacao = codigoConfirmacao;
      this.pedidoDetalhe = this.montarPedidoDetalhe(pedido);
      this.statusPedidoAtual = 1;
      this.etapaFluxo = 'status';
      this.limparSimuladorStatus();

      // Limpa o carrinho (os itens já foram salvos no pedido)
      restaurante.cardapio.forEach((p) => {
        p.quantidade = 0;
      });
      this.limparCarrinhoLocal();

      // Escuta atualizações em tempo real e mostra a tela de status na hora
      this.escutarAtualizacoesPedido(pedidoId);
      this.cdr.detectChanges();

      // Atualiza o histórico do perfil com o novo pedido
      this.carregarPedidosCliente();
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      alert('Erro ao criar pedido!');
    }
  }

  // Carrega os pedidos reais do cliente e monta o histórico do perfil
  async carregarPedidosCliente(): Promise<void> {
    try {
      const user = this.authService.getCurrentUserSync();
      if (!user) return;
      const pedidos = await this.pedidosService.obterPedidosCliente(user.uid);
      pedidos.sort((a: any, b: any) => this.tsParaMs(b.dataPedido) - this.tsParaMs(a.dataPedido));
      // Esconde pedidos de restaurantes que não existem mais (ex.: "Wach").
      // Mantém o pedido se o restaurante ainda existe por id OU por nome.
      const visiveis = this.filtrarRestaurantesExistentes(pedidos);
      this.clienteInfo.historicoPedidos = visiveis.map((p: any) => ({
        id: p.id,
        restaurante: p.restaurante?.nome || 'Restaurante',
        status: p.status || 'Novo Pedido',
        statusRaw: p.status || 'Novo Pedido',
        codigo: '#' + (p.codigo || ''),
        codigoPuro: p.codigo || '',
        codigoConfirmacao: p.codigoConfirmacao || '----',
        data: this.formatarData(p.dataPedido),
        itens: (p.itens?.reduce((s: number, i: any) => s + (i.quantidade || 1), 0) || 0) + ' itens',
        valor: p.valor || 0,
        raw: p,
      }));
      this.cdr.detectChanges();
    } catch (e) {
      console.error('Erro ao carregar pedidos do cliente:', e);
    }
  }

  // Remove do histórico os pedidos cujo restaurante não existe mais. Um pedido
  // é mantido se o restaurante ainda existe (casa por _restauranteId OU pelo
  // nome). Se a lista de restaurantes ainda não carregou, não filtra nada.
  private filtrarRestaurantesExistentes(pedidos: any[]): any[] {
    const ids = new Set(this.restaurantes.map((r: any) => r._restauranteId).filter(Boolean));
    const nomes = new Set(
      this.restaurantes.map((r: any) => (r.nome || '').toLowerCase()).filter(Boolean),
    );
    if (ids.size === 0 && nomes.size === 0) {
      return pedidos;
    }
    return pedidos.filter(
      (p: any) => ids.has(p.restauranteId) || nomes.has((p.restaurante?.nome || '').toLowerCase()),
    );
  }

  // Abre a tela de status para acompanhar um pedido existente (do histórico)
  acompanharPedido(ped: any): void {
    if (!ped) return;
    // Reseta o motoboy carregado para buscar o motoboy correto deste pedido.
    this.motoboyIdCarregado = null;
    this.pedidoAtualId = ped.id || null;
    this.codigoPedido = ped.codigoPuro || (ped.codigo || '').replace(/^#/, '');
    this.codigoConfirmacao = ped.codigoConfirmacao || '----';
    this.statusPedidoAtual = this.statusMap[ped.statusRaw || ped.status] || 1;
    this.pedidoDetalhe = this.montarPedidoDetalhe(ped.raw || {});
    this.etapaFluxo = 'status';
    this.limparSimuladorStatus();
    if (this.unsubscribePedido) {
      this.unsubscribePedido();
      this.unsubscribePedido = null;
    }
    if (ped.id) {
      this.escutarAtualizacoesPedido(ped.id);
    }
    this.cdr.detectChanges();
  }

  private tsParaMs(d: any): number {
    if (!d) return 0;
    if (typeof d?.seconds === 'number') return d.seconds * 1000;
    const t = new Date(d).getTime();
    return isNaN(t) ? 0 : t;
  }

  private formatarData(d: any): string {
    const ms = this.tsParaMs(d);
    return ms ? new Date(ms).toLocaleDateString('pt-BR') : '';
  }

  private formatarDataHora(d: any): string {
    const ms = this.tsParaMs(d);
    if (!ms) return '';
    const dt = new Date(ms);
    return (
      dt.toLocaleDateString('pt-BR') +
      ' ' +
      dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    );
  }

  // Monta os dados exibidos na tela de "Pedido concluído" a partir de um pedido
  private montarPedidoDetalhe(p: any): any {
    const itens = (p.itens || []).map((i: any) => ({
      nome: i.nome,
      preco: i.preco || 0,
      quantidade: i.quantidade || 1,
      imagem: i.imagem || this.imagemPadrao,
      acompanhamentos: i.acompanhamentos || [],
    }));
    const subtotal =
      p.subtotal ??
      itens.reduce((s: number, i: any) => {
        const ac = (i.acompanhamentos || []).reduce((x: number, a: any) => x + (a.preco || 0), 0);
        return s + (i.preco + ac) * i.quantidade;
      }, 0);
    const taxaEntrega = p.taxaEntrega ?? 0;
    const desconto = p.desconto ?? 0;
    return {
      codigo: p.codigo,
      codigoConfirmacao: p.codigoConfirmacao,
      restauranteNome: p.restaurante?.nome || 'Restaurante',
      itens,
      subtotal,
      desconto,
      taxaEntrega,
      total: subtotal - desconto + taxaEntrega,
      formaPagamento: p.formaPagamento || 'Pago pelo app',
      endereco: p.enderecoEntrega || p.cliente?.endereco || 'Endereço não informado',
      dataConclusao: this.formatarDataHora(p.dataPedido),
    };
  }

  // ---- Persistência do carrinho (localStorage, sobrevive a recarregar) ----
  private chaveCarrinho(): string {
    const u = this.authService.getCurrentUserSync();
    return 'flashfood_cart_' + (u?.uid || 'anon');
  }

  private salvarCarrinho(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const r = this.restauranteParaCarrinho as any;
      const itens = (r?.cardapio || [])
        .filter((p: any) => p.quantidade > 0)
        .map((p: any) => ({
          id: p.id,
          nome: p.nome,
          descricao: p.descricao,
          preco: p.preco,
          imagem: p.imagem,
          categoria: p.categoria,
          disponivel: true,
          emAlta: p.emAlta,
          quantidade: p.quantidade,
          acompanhamentosPossiveis: p.acompanhamentosPossiveis || [],
          acompanhamentosEscolhidos: p.acompanhamentosEscolhidos || [],
        }));
      if (!r || itens.length === 0) {
        localStorage.removeItem(this.chaveCarrinho());
        return;
      }
      const dados = {
        nome: r.nome,
        categoria: r.categoria,
        nota: r.nota || 4.8,
        tempo: r.tempo || '30-40 min',
        taxa: r.taxa || 0,
        imagem: r.imagem,
        _restauranteId: r._restauranteId,
        cardapio: itens,
      };
      localStorage.setItem(this.chaveCarrinho(), JSON.stringify(dados));
    } catch {}
  }

  private restaurarCarrinho(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(this.chaveCarrinho());
      if (!raw) return;
      const dados = JSON.parse(raw);
      if (dados?.cardapio?.length) {
        this.carrinhoRestaurante = dados;
      }
    } catch {}
  }

  private limparCarrinhoLocal(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(this.chaveCarrinho());
    } catch {}
  }

  // Itens salvos para um restaurante específico (usado ao recarregar os produtos)
  private itensSalvosDoCarrinho(restauranteId: string): any[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.chaveCarrinho());
      if (!raw) return [];
      const dados = JSON.parse(raw);
      if (dados?._restauranteId === restauranteId) return dados.cardapio || [];
    } catch {}
    return [];
  }

  private escutarAtualizacoesPedido(pedidoId: string): void {
    if (this.unsubscribePedido) {
      this.unsubscribePedido();
      this.unsubscribePedido = null;
    }
    this.unsubscribePedido = this.pedidosService.escutarPedido(pedidoId, (pedido: any) => {
      if (pedido && pedido.status) {
        const novoStatus = this.statusMap[pedido.status] || 1;
        if (novoStatus !== this.statusPedidoAtual) {
          console.log('📦 Status atualizado para:', pedido.status);
          // Animar a transição do status
          this.animarTransicaoStatus(novoStatus);
        }
        // Mostra o motoboy REAL que assumiu a entrega (não mais dados genéricos).
        this.carregarMotoboyDoPedido(pedido.motoboyId);
      }
    });
  }

  // Busca no Firestore os dados do motoboy que assumiu o pedido e preenche o
  // bloco "Informações do Motoboy" com nome, telefone, veículo e foto reais.
  private async carregarMotoboyDoPedido(motoboyId: string | null | undefined): Promise<void> {
    if (!motoboyId || this.motoboyIdCarregado === motoboyId) return;
    this.motoboyIdCarregado = motoboyId;
    try {
      const dados = await this.userService.obterUser(motoboyId);
      if (dados) {
        this.motoboyInfo = {
          nome: `${dados.nome || ''} ${dados.sobrenome || ''}`.trim() || 'Motoboy',
          telefone: dados.telefone || '',
          veiculo: dados.modeloMoto || 'Moto',
          avatar: dados.fotoUrl || this.avatarPadrao,
        };
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error('Erro ao carregar dados do motoboy do pedido:', e);
    }
  }

  private animarTransicaoStatus(novoStatus: number): void {
    // Garante que não fiquem várias animações rodando ao mesmo tempo
    if (this.intervaloAnimacaoStatus) {
      clearInterval(this.intervaloAnimacaoStatus);
    }
    this.intervaloAnimacaoStatus = setInterval(() => {
      if (this.statusPedidoAtual < novoStatus) {
        this.statusPedidoAtual++;
        this.cdr.detectChanges();
      } else {
        clearInterval(this.intervaloAnimacaoStatus);
        this.intervaloAnimacaoStatus = undefined;
        this.cdr.detectChanges();
      }
    }, 1500); // Anima a cada 1.5s
  }

  voltarParaHomeLimpo(): void {
    if (this.restauranteParaCarrinho) {
      this.restauranteParaCarrinho.cardapio.forEach((p) => (p.quantidade = 0));
    }
    this.limparSimuladorStatus();
    this.restauranteSelecionado = null;
    this.etapaFluxo = 'home';
    this.categoriaSelecionada = 'Todos'; // volta o filtro da home para "Todos"
    this.termoPesquisa = '';
  }

  limparSimuladorStatus(): void {
    if (this.intervaloStatusSimulation) {
      clearInterval(this.intervaloStatusSimulation);
      this.intervaloStatusSimulation = undefined;
    }
    if (this.intervaloAnimacaoStatus) {
      clearInterval(this.intervaloAnimacaoStatus);
      this.intervaloAnimacaoStatus = undefined;
    }
  }
  get etapaAtual() {
    return this.statusSteps[this.statusPedidoAtual - 1];
  }
  get progressoPedido(): number {
    return Math.round((this.statusPedidoAtual / this.statusSteps.length) * 100);
  }
  get motoboyNoLocal(): boolean {
    return this.statusPedidoAtual >= 4;
  }
  // Pedido entregue/concluído (último passo) -> mostra a tela de resumo no lugar do rastreamento
  get pedidoConcluido(): boolean {
    return this.statusPedidoAtual >= this.statusSteps.length;
  }
  get totalItensCarrinho(): number {
    return (
      this.restauranteParaCarrinho?.cardapio.reduce((acc, prod) => acc + prod.quantidade, 0) || 0
    );
  }
  // Soma dos itens SEM o desconto do cupom (usada na linha "Subtotal" do resumo)
  get subtotalBrutoCarrinho(): number {
    return (
      this.restauranteParaCarrinho?.cardapio.reduce((acc, prod) => {
        const custoAdicionais =
          prod.acompanhamentosEscolhidos?.reduce((sum, item) => sum + item.preco, 0) || 0;
        return acc + (prod.quantidade > 0 ? (prod.preco + custoAdicionais) * prod.quantidade : 0);
      }, 0) || 0
    );
  }
  // Subtotal já com o desconto aplicado (base para o Total = este + taxa)
  get valorTotalCarrinho(): number {
    return this.subtotalBrutoCarrinho - this.descontoCupom;
  }

  async aplicarCupom(): Promise<void> {
    if (!this.cupomAplicado.trim()) {
      this.mensagemCupom = 'Digite o código do cupom';
      return;
    }

    if (!this.restauranteParaCarrinho) {
      this.mensagemCupom = 'Selecione um restaurante';
      return;
    }

    // O id real do restaurante no Firestore fica em _restauranteId (ver carregarRestaurantes)
    const restaurante = this.restauranteParaCarrinho as any;
    const restauranteId =
      restaurante?._restauranteId ||
      (this.restaurantes.find((r) => r.nome === this.restauranteParaCarrinho!.nome) as any)
        ?._restauranteId;
    if (!restauranteId) {
      this.mensagemCupom = 'Restaurante não encontrado';
      this.cdr.detectChanges();
      return;
    }

    try {
      const resultado = await this.cuponsService.validarCupom(
        this.cupomAplicado,
        restauranteId,
        this.subtotalBrutoCarrinho,
      );

      if (resultado.valido) {
        this.descontoCupom = resultado.desconto;
        this.mensagemCupom = resultado.mensagem;
      } else {
        this.descontoCupom = 0;
        this.mensagemCupom = resultado.mensagem;
      }
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      this.descontoCupom = 0;
      this.mensagemCupom = 'Erro ao validar cupom';
    }
    // Firebase resolve fora da NgZone: forçar atualização da view
    this.cdr.detectChanges();
  }

  limparCupom(): void {
    this.cupomAplicado = '';
    this.descontoCupom = 0;
    this.mensagemCupom = '';
    this.cdr.detectChanges();
  }

  async pesquisarProdutos(termo: string): Promise<void> {
    if (!termo.trim()) {
      this.resultadosPesquisa = [];
      this.mostrarvResultadosPesquisa = false;
      return;
    }

    const termoLower = termo.toLowerCase();
    const resultados: any[] = [];

    for (const restaurante of this.restaurantes) {
      const produtosEncontrados = (restaurante.cardapio || []).filter(
        (p: any) =>
          p.nome.toLowerCase().includes(termoLower) ||
          p.descricao.toLowerCase().includes(termoLower) ||
          p.categoria?.toLowerCase().includes(termoLower),
      );

      for (const produto of produtosEncontrados) {
        resultados.push({
          ...produto,
          nomeRestaurante: restaurante.nome,
          categoriaRestaurante: restaurante.categoria,
          imagemRestaurante: restaurante.imagem,
          restaurante: restaurante,
        });
      }
    }

    this.resultadosPesquisa = resultados;
    this.mostrarvResultadosPesquisa = resultados.length > 0;
  }

  selecionarResultado(resultado: any): void {
    this.restauranteSelecionado = resultado.restaurante;
    this.carrinhoRestaurante = resultado.restaurante;
    this.etapaFluxo = 'home';
    this.categoriaSelecionada = 'Todas';
    this.termoPesquisa = '';
    this.resultadosPesquisa = [];
    this.mostrarvResultadosPesquisa = false;
    this.carregarProdutosRestaurante(resultado.restaurante);
  }
}
