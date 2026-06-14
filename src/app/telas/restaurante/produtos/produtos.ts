import { Component, EventEmitter, OnInit, Output, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ProdutosService, Produto } from '../../../services/produtos.service';

@Component({
  selector: 'app-produtos-restaurante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produtos.html',
  styleUrls: ['./produtos.css']
})
export class ProdutosRestauranteComponent implements OnInit, OnDestroy {
  @Output() fechar = new EventEmitter<void>();

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

  produtos: Produto[] = [];
  produtoEditando: Produto | null = null;
  modoNovo = false;
  imagemErro = '';
  precoTexto = '0';
  carregando = false;
  unsubscribeProdutos: any;

  constructor(private authService: AuthService, private produtosService: ProdutosService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.carregarProdutos();
  }

  ngOnDestroy() {
    if (this.unsubscribeProdutos) {
      this.unsubscribeProdutos();
    }
  }

  private async carregarProdutos() {
    try {
      this.carregando = true;
      const user = this.authService.getCurrentUserSync();
      if (user) {
        // Escutar produtos em tempo real
        this.unsubscribeProdutos = this.produtosService.escutarProdutosRestaurante(
          user.uid,
          (produtos) => {
            this.produtos = produtos;
            console.log('📦 Produtos atualizados:', produtos);
            this.carregando = false;
            // Firebase responde fora da zona do Angular: força a atualização da
            // view (sem isso a lista fica vazia mesmo havendo produtos salvos).
            this.cdr.detectChanges();
          }
        );
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      this.carregando = false;
    }
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

  abrirNovoProduto() {
    this.produtoEditando = {
      nome: '',
      descricao: '',
      preco: 0,
      imagem: '',
      disponivel: true,
      emAlta: false,
      restauranteId: this.authService.getCurrentUserSync()?.uid || ''
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

  async salvarProduto() {
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

    try {
      if (this.modoNovo) {
        const user = this.authService.getCurrentUserSync();
        if (user) {
          await this.produtosService.criarProduto(user.uid, this.produtoEditando);
          alert('✅ Produto criado com sucesso!');
        }
      } else if (this.produtoEditando.id) {
        await this.produtosService.atualizarProduto(this.produtoEditando.id, this.produtoEditando);
        alert('✅ Produto atualizado com sucesso!');
      }

      this.produtoEditando = null;
      this.modoNovo = false;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('❌ Erro ao salvar produto');
    }
  }

  async excluirProduto(produto: Produto) {
    if (!produto.id) return;

    if (!confirm('Tem certeza que deseja deletar este produto?')) {
      return;
    }

    try {
      await this.produtosService.deletarProduto(produto.id);
      alert('✅ Produto deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      alert('❌ Erro ao deletar produto');
    }
  }

  cancelarEdicao() {
    this.produtoEditando = null;
    this.modoNovo = false;
    this.imagemErro = '';
  }

  async alternarDisponibilidade(produto: Produto) {
    if (!produto.id) return;

    try {
      await this.produtosService.atualizarProduto(produto.id, {
        disponivel: !produto.disponivel
      });
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
    }
  }

  imagemComFallback(produto: Produto): string {
    return produto.imagem || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ff6600" font-size="16">Sem foto</text></svg>';
  }

  handleImagemErro(produto: Produto): void {
    produto.imagem = '';
  }

  fecharModal() {
    this.fechar.emit();
  }
}
