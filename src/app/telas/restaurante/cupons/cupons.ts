import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Cupom {
  id: number;
  codigo: string;
  tipo: 'porcentagem' | 'valor';
  valor: number;
  minimoPedido: number;
  dataExpiracao: string;
  ativo: boolean;
}

interface FormularioCupom {
  codigo: string;
  tipo: 'porcentagem' | 'valor';
  valor: number;
  minimoPedido: number;
  dataExpiracao: string;
  ativo: boolean;
}

@Component({
  selector: 'app-cupons-restaurante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cupons.html',
  styleUrls: ['./cupons.css']
})
export class CuponsRestauranteComponent implements OnInit {
  @Output() fechar = new EventEmitter<void>();

  private readonly storageKey = 'dark-kitchen-cupons';

  cupons: Cupom[] = [];
  cupomEditando: Cupom | null = null;
  modoNovo = false;
  mensagemErro = '';

  formulario: FormularioCupom = {
    codigo: '',
    tipo: 'porcentagem',
    valor: 10,
    minimoPedido: 0,
    dataExpiracao: '',
    ativo: true
  };

  ngOnInit(): void {
    this.carregarCupons();
  }

  private carregarCupons(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const dados = window.localStorage.getItem(this.storageKey);

    if (!dados) {
      this.persistirCupons();
      return;
    }

    try {
      const parseados = JSON.parse(dados) as Cupom[];

      if (Array.isArray(parseados)) {
        this.cupons = parseados;
        return;
      }
    } catch {
      // Ignora dados corrompidos e reinicia a lista
    }

    this.cupons = [];
    this.persistirCupons();
  }

  private persistirCupons(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(this.cupons));
  }

  abrirNovoCupom(): void {
    this.modoNovo = true;
    this.cupomEditando = null;
    this.mensagemErro = '';
    this.formulario = {
      codigo: '',
      tipo: 'porcentagem',
      valor: 10,
      minimoPedido: 0,
      dataExpiracao: '',
      ativo: true
    };
  }

  editarCupom(cupom: Cupom): void {
    this.modoNovo = false;
    this.cupomEditando = { ...cupom };
    this.mensagemErro = '';
    this.formulario = {
      codigo: cupom.codigo,
      tipo: cupom.tipo,
      valor: cupom.valor,
      minimoPedido: cupom.minimoPedido,
      dataExpiracao: cupom.dataExpiracao,
      ativo: cupom.ativo
    };
  }

  cancelarEdicao(): void {
    this.modoNovo = false;
    this.cupomEditando = null;
    this.mensagemErro = '';
    this.formulario = {
      codigo: '',
      tipo: 'porcentagem',
      valor: 10,
      minimoPedido: 0,
      dataExpiracao: '',
      ativo: true
    };
  }

  salvarCupom(): void {
    if (!this.formulario.codigo.trim()) {
      this.mensagemErro = 'Informe um código para o cupom.';
      return;
    }

    if (this.formulario.valor <= 0) {
      this.mensagemErro = 'O valor do desconto precisa ser maior que zero.';
      return;
    }

    if (this.formulario.tipo === 'porcentagem' && this.formulario.valor > 100) {
      this.mensagemErro = 'A porcentagem máxima é 100%.';
      return;
    }

    const codigoNormalizado = this.formulario.codigo.trim().toUpperCase();

    if (this.cupomEditando) {
      const index = this.cupons.findIndex(cupom => cupom.id === this.cupomEditando!.id);

      if (index > -1) {
        this.cupons[index] = {
          ...this.cupomEditando,
          codigo: codigoNormalizado,
          tipo: this.formulario.tipo,
          valor: this.formulario.valor,
          minimoPedido: this.formulario.minimoPedido,
          dataExpiracao: this.formulario.dataExpiracao,
          ativo: this.formulario.ativo
        };
      }
    } else {
      this.cupons.push({
        id: Date.now(),
        codigo: codigoNormalizado,
        tipo: this.formulario.tipo,
        valor: this.formulario.valor,
        minimoPedido: this.formulario.minimoPedido,
        dataExpiracao: this.formulario.dataExpiracao,
        ativo: this.formulario.ativo
      });
    }

    this.persistirCupons();
    this.cancelarEdicao();
  }

  alternarAtivo(cupom: Cupom): void {
    cupom.ativo = !cupom.ativo;
    this.persistirCupons();
  }

  excluirCupom(cupom: Cupom): void {
    this.cupons = this.cupons.filter(item => item.id !== cupom.id);
    this.persistirCupons();
  }

  isCupomExpirado(cupom: Cupom): boolean {
    if (!cupom.dataExpiracao) {
      return false;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const expiracao = new Date(cupom.dataExpiracao);

    return expiracao.getTime() < hoje.getTime();
  }

  getStatusCupom(cupom: Cupom): string {
    if (!cupom.ativo) {
      return 'Inativo';
    }

    if (this.isCupomExpirado(cupom)) {
      return 'Expirado';
    }

    return 'Ativo';
  }

  formatarValor(cupom: Cupom): string {
    if (cupom.tipo === 'porcentagem') {
      return `${cupom.valor.toFixed(0)}%`;
    }

    return `R$ ${cupom.valor.toFixed(2)}`;
  }
}
