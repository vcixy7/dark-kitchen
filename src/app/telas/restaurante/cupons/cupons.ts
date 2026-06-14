import { Component, EventEmitter, OnInit, Output, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CuponsService, Cupom } from '../../../services/cupons.service';

@Component({
  selector: 'app-cupons-restaurante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cupons.html',
  styleUrls: ['./cupons.css']
})
export class CuponsRestauranteComponent implements OnInit, OnDestroy {
  @Output() fechar = new EventEmitter<void>();

  cupons: Cupom[] = [];
  cupomEditando: Cupom | null = null;
  modoNovo = false;
  mensagemErro = '';
  carregando = false;
  unsubscribeCupons: any;

  formulario: any = {
    codigo: '',
    tipo: 'percentual',
    desconto: 10,
    minimo: 0,
    dataExpiracao: '',
    ativo: true,
    descricao: ''
  };

  constructor(private authService: AuthService, private cuponsService: CuponsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.carregarCupons();
  }

  ngOnDestroy() {
    if (this.unsubscribeCupons) {
      this.unsubscribeCupons();
    }
  }

  private carregarCupons(): void {
    try {
      this.carregando = true;
      const user = this.authService.getCurrentUserSync();
      if (user) {
        // Escutar cupons em tempo real
        this.unsubscribeCupons = this.cuponsService.escutarCuponsRestaurante(
          user.uid,
          (cupons) => {
            this.cupons = cupons;
            console.log('🎟️ Cupons atualizados:', cupons);
            this.carregando = false;
            // Firebase responde fora da zona do Angular: força a atualização da
            // view (sem isso a lista fica vazia mesmo havendo cupons salvos).
            this.cdr.detectChanges();
          }
        );
      }
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
      this.carregando = false;
    }
  }

  abrirNovoCupom(): void {
    this.modoNovo = true;
    this.cupomEditando = null;
    this.mensagemErro = '';
    this.formulario = {
      codigo: '',
      tipo: 'percentual',
      desconto: 10,
      minimo: 0,
      dataExpiracao: '',
      ativo: true,
      descricao: ''
    };
  }

  editarCupom(cupom: Cupom): void {
    this.modoNovo = false;
    this.cupomEditando = { ...cupom };
    this.mensagemErro = '';
    this.formulario = {
      codigo: cupom.codigo,
      tipo: cupom.tipo,
      desconto: cupom.desconto,
      minimo: cupom.minimo || 0,
      dataExpiracao: this.formatarDataParaInput(cupom.dataExpiracao),
      ativo: cupom.ativo,
      descricao: cupom.descricao
    };
  }

  formatarDataParaInput(data: any): string {
    if (!data) return '';
    const d = new Date(data);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  cancelarEdicao(): void {
    this.modoNovo = false;
    this.cupomEditando = null;
    this.mensagemErro = '';
    this.formulario = {
      codigo: '',
      tipo: 'percentual',
      desconto: 10,
      minimo: 0,
      dataExpiracao: '',
      ativo: true,
      descricao: ''
    };
  }

  async salvarCupom(): Promise<void> {
    if (!this.formulario.codigo.trim()) {
      this.mensagemErro = 'Informe um código para o cupom.';
      return;
    }

    if (this.formulario.desconto <= 0) {
      this.mensagemErro = 'O valor do desconto precisa ser maior que zero.';
      return;
    }

    if (this.formulario.tipo === 'percentual' && this.formulario.desconto > 100) {
      this.mensagemErro = 'A porcentagem máxima é 100%.';
      return;
    }

    if (!this.formulario.dataExpiracao) {
      this.mensagemErro = 'Informe a data de expiração.';
      return;
    }

    const codigoNormalizado = this.formulario.codigo.trim().toUpperCase();

    try {
      const dataExpiracao = new Date(this.formulario.dataExpiracao);

      if (this.cupomEditando && this.cupomEditando.id) {
        await this.cuponsService.atualizarCupom(this.cupomEditando.id, {
          codigo: codigoNormalizado,
          tipo: this.formulario.tipo,
          desconto: this.formulario.desconto,
          minimo: this.formulario.minimo,
          dataExpiracao,
          ativo: this.formulario.ativo,
          descricao: this.formulario.descricao
        });
        alert('✅ Cupom atualizado com sucesso!');
      } else {
        const user = this.authService.getCurrentUserSync();
        if (user) {
          await this.cuponsService.criarCupom(user.uid, {
            codigo: codigoNormalizado,
            tipo: this.formulario.tipo,
            desconto: this.formulario.desconto,
            minimo: this.formulario.minimo,
            dataExpiracao,
            ativo: this.formulario.ativo,
            descricao: this.formulario.descricao
          });
          alert('✅ Cupom criado com sucesso!');
        }
      }

      this.cancelarEdicao();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
      this.mensagemErro = 'Erro ao salvar cupom. Tente novamente.';
    }
  }

  async alternarAtivo(cupom: Cupom): Promise<void> {
    if (!cupom.id) return;

    try {
      await this.cuponsService.atualizarCupom(cupom.id, {
        ativo: !cupom.ativo
      });
    } catch (error) {
      console.error('Erro ao atualizar cupom:', error);
    }
  }

  async excluirCupom(cupom: Cupom): Promise<void> {
    if (!cupom.id) return;

    if (!confirm('Tem certeza que deseja deletar este cupom?')) {
      return;
    }

    try {
      await this.cuponsService.deletarCupom(cupom.id);
      alert('✅ Cupom deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar cupom:', error);
      alert('❌ Erro ao deletar cupom');
    }
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
    if (cupom.tipo === 'percentual') {
      return `${cupom.desconto.toFixed(0)}%`;
    }

    return `R$ ${cupom.desconto.toFixed(2)}`;
  }

  fecharModal() {
    this.fechar.emit();
  }
}
