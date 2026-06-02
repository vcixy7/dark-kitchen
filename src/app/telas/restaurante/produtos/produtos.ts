import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  imagem: string;
  disponivel: boolean;
}

@Component({
  selector: 'app-produtos-restaurante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produtos.html',
  styleUrls: ['./produtos.css']
})
export class ProdutosRestauranteComponent implements OnInit {
  @Output() fechar = new EventEmitter<void>();

  private readonly storageKey = 'dark-kitchen-produtos';

  categoriasDisponiveis = [
    'Hambúrgueres',
    'Pizzas',
    'Bebidas',
    'Acompanhamentos',
    'Sobremesas',
    'Saladas',
    'Promoções'
  ];

  formatosPermitidos = ['png', 'jpg', 'jpeg', 'webp'];

  produtos: Produto[] = [
    {
      id: 1,
      nome: 'Burger Clássico',
      descricao: 'Hambúrguer artesanal com queijo cheddar',
      categoria: 'Hambúrgueres',
      preco: 25.9,
      imagem: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
      disponivel: true
    }
  ];

  produtoEditando: Produto | null = null;
  modoNovo = false;
  imagemErro = '';
  precoTexto = '0';

  ngOnInit(): void {
    this.carregarProdutos();
  }

  private carregarProdutos(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const dados = window.localStorage.getItem(this.storageKey);

    if (!dados) {
      this.persistirProdutos();
      return;
    }

    try {
      const parseados = JSON.parse(dados) as Produto[];

      if (Array.isArray(parseados) && parseados.length) {
        this.produtos = parseados;
        return;
      }
    } catch {
      // Ignora dados inválidos e reinicia com o estado padrão
    }

    this.produtos = [
      {
        id: 1,
        nome: 'Burger Clássico',
        descricao: 'Hambúrguer artesanal com queijo cheddar',
        categoria: 'Hambúrgueres',
        preco: 25.9,
        imagem: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
        disponivel: true
      }
    ];
    this.persistirProdutos();
  }

  private persistirProdutos(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(this.produtos));
  }

  abrirNovoProduto() {
    this.produtoEditando = {
      id: Date.now(),
      nome: '',
      descricao: '',
      categoria: this.categoriasDisponiveis[0],
      preco: 0,
      imagem: '',
      disponivel: true
    };
    this.precoTexto = '0';
    this.modoNovo = true;
    this.imagemErro = '';
  }

  editarProduto(produto: Produto) {
    this.produtoEditando = { ...produto };
    this.precoTexto = produto.preco.toFixed(2);
    this.modoNovo = false;
    this.imagemErro = '';
  }

  onArquivoSelecionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];

    if (!arquivo || !this.produtoEditando) {
      return;
    }

    if (!this.validarTipoArquivo(arquivo)) {
      input.value = '';
      this.produtoEditando.imagem = '';
      this.imagemErro = 'Formato não permitido. Use apenas PNG, JPG, JPEG ou WEBP.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.produtoEditando!.imagem = String(reader.result);
      this.imagemErro = '';
    };
    reader.readAsDataURL(arquivo);
  }

  validarTipoArquivo(arquivo: File): boolean {
    const mime = arquivo.type?.toLowerCase() || '';

    if (mime) {
      return this.formatosPermitidos.some(formato => mime.includes(formato));
    }

    const nome = arquivo.name.toLowerCase();
    const extensao = nome.split('.').pop() || '';

    return this.formatosPermitidos.includes(extensao);
  }

  validarUrlImagem(url: string): boolean {
    if (!url) {
      return false;
    }

    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  extensaoPossivelmentePermitida(url: string): boolean {
    const lower = url.toLowerCase();

    if (lower.includes('.gif') || lower.includes('gif')) {
      return false;
    }

    const extensao = (lower.match(/\.([a-z0-9]+)(?:[?#]|$)/)?.[1] || '').trim();

    if (!extensao) {
      return true;
    }

    return this.formatosPermitidos.includes(extensao);
  }

  ehImagemValida(imagem: string): boolean {
    if (!imagem) {
      return false;
    }

    if (imagem.startsWith('data:image/')) {
      const tipo = imagem.match(/^data:image\/([a-z0-9+.-]+);/)?.[1]?.toLowerCase() || '';
      return this.formatosPermitidos.includes(tipo);
    }

    if (!this.validarUrlImagem(imagem)) {
      return false;
    }

    return this.extensaoPossivelmentePermitida(imagem);
  }

  atualizarPrecoTexto(valor: string) {
    this.precoTexto = valor;

    if (!this.produtoEditando) {
      return;
    }

    this.produtoEditando.preco = this.parsePreco(valor);
  }

  parsePreco(valor: string): number {
    if (!valor) {
      return 0;
    }

    const normalizado = valor.replace(',', '.').trim();
    const numero = Number(normalizado);

    return Number.isFinite(numero) ? numero : 0;
  }

  atualizarImagemUrl(url: string) {
    if (!this.produtoEditando) {
      return;
    }

    this.produtoEditando.imagem = url;

    if (!url) {
      this.imagemErro = 'Adicione uma foto pelo upload ou informe uma URL válida.';
      return;
    }

    if (!this.ehImagemValida(url)) {
      this.imagemErro = 'Use apenas PNG, JPG, JPEG ou WEBP. GIF e outros formatos não são permitidos.';
      return;
    }

    this.imagemErro = '';
  }

  salvarProduto() {
    if (!this.produtoEditando) {
      return;
    }

    this.produtoEditando.preco = this.parsePreco(this.precoTexto);

    if (!this.produtoEditando.imagem) {
      this.imagemErro = 'Selecione uma imagem para salvar o produto.';
      return;
    }

    if (!this.ehImagemValida(this.produtoEditando.imagem)) {
      this.imagemErro = 'Use apenas PNG, JPG, JPEG ou WEBP. GIF e outros formatos não são permitidos.';
      return;
    }

    this.imagemErro = '';

    if (this.modoNovo) {
      this.produtos.push({ ...this.produtoEditando });
    } else {
      const idx = this.produtos.findIndex(p => p.id === this.produtoEditando!.id);
      if (idx > -1) {
        this.produtos[idx] = { ...this.produtoEditando };
      }
    }

    this.persistirProdutos();
    this.produtoEditando = null;
    this.modoNovo = false;
  }

  excluirProduto(produto: Produto) {
    this.produtos = this.produtos.filter(p => p.id !== produto.id);
    this.persistirProdutos();
  }

  cancelarEdicao() {
    this.produtoEditando = null;
    this.modoNovo = false;
    this.imagemErro = '';
  }

  alternarDisponibilidade(produto: Produto) {
    produto.disponivel = !produto.disponivel;
    this.persistirProdutos();
  }

  handleImagemErro(produto: Produto) {
    produto.imagem = '';
    this.persistirProdutos();
  }

  imagemComFallback(produto: Produto): string {
    return produto.imagem || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ff6600" font-size="16">Sem foto</text></svg>';
  }
}
