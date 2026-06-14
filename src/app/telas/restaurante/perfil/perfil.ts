import { Component, EventEmitter, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-perfil-restaurante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilRestauranteComponent implements OnInit {
  @Output() salvar = new EventEmitter<void>();

  fotoRestaurante: string | null = null;
  nomeRestaurante = '';
  email = '';
  telefone = '';
  descricao = '';
  rua = '';
  cidade = '';
  estado = '';
  cep = '';

  // Campos do cadastro que não aparecem no formulário mas precisam ser
  // preservados ao salvar (para não apagar dados do restaurante).
  private bairro = '';
  private complemento = '';
  private numeroOriginal = '';

  statusMensagem = 'Atualize os dados do restaurante.';
  statusTipo: 'info' | 'sucesso' | 'erro' = 'info';
  salvando = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarPerfil();
  }

  onFotoSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    const erro = this.validarArquivo(file);

    if (erro) {
      this.statusMensagem = erro;
      this.statusTipo = 'erro';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.fotoRestaurante = reader.result as string;
      this.statusMensagem = 'Foto atualizada. Clique em salvar para confirmar.';
      this.statusTipo = 'sucesso';
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  async salvarAlteracoes(): Promise<void> {
    if (!this.nomeRestaurante.trim() || !this.email.trim()) {
      this.statusMensagem = 'Preencha o nome do restaurante e o email.';
      this.statusTipo = 'erro';
      return;
    }

    const user = this.authService.getCurrentUserSync();
    if (!user) {
      this.statusMensagem = 'Sua sessão expirou. Faça login novamente.';
      this.statusTipo = 'erro';
      return;
    }

    // O campo do formulário é "Rua e número": separa de volta em rua + número
    // para gravar nos mesmos campos do cadastro.
    const partes = this.rua.split(',');
    const ruaLimpa = (partes[0] || '').trim();
    const numeroLimpo = partes.length > 1 ? partes.slice(1).join(',').trim() : this.numeroOriginal;

    this.salvando = true;
    try {
      await this.userService.atualizarUser(user.uid, {
        nomeRestaurante: this.nomeRestaurante.trim(),
        emailResponsavel: this.email.trim(),
        telefoneResponsavel: this.telefone.trim(),
        descricao: this.descricao.trim(),
        rua: ruaLimpa,
        numero: numeroLimpo,
        cidade: this.cidade.trim(),
        estado: this.estado.trim(),
        cep: this.cep.trim(),
        fotoRestauranteUrl: this.fotoRestaurante || ''
      });

      this.statusMensagem = 'Alterações salvas com sucesso.';
      this.statusTipo = 'sucesso';
      this.cdr.detectChanges();
      this.salvar.emit();
    } catch (error) {
      console.error('Erro ao salvar perfil do restaurante:', error);
      this.statusMensagem = 'Erro ao salvar. Tente novamente.';
      this.statusTipo = 'erro';
      this.cdr.detectChanges();
    } finally {
      this.salvando = false;
    }
  }

  // Carrega os dados REAIS do cadastro (Firestore) para a edição bater com
  // o que foi cadastrado, em vez de mostrar dados de exemplo.
  private async carregarPerfil(): Promise<void> {
    try {
      const user = this.authService.getCurrentUserSync();
      if (!user) {
        return;
      }

      const dados = await this.userService.obterUser(user.uid);
      if (!dados) {
        return;
      }

      this.nomeRestaurante = dados.nomeRestaurante || '';
      this.email = dados.emailResponsavel || dados.email || user.email || '';
      this.telefone = dados.telefoneResponsavel || '';
      this.descricao = dados.descricao || '';
      this.numeroOriginal = dados.numero || '';
      this.bairro = dados.bairro || '';
      this.complemento = dados.complemento || '';
      this.rua = [dados.rua, dados.numero].filter(Boolean).join(', ');
      this.cidade = dados.cidade || '';
      this.estado = dados.estado || '';
      this.cep = dados.cep || '';
      this.fotoRestaurante = dados.fotoRestauranteUrl || null;

      // Firebase responde fora da zona do Angular: força a atualização da view
      // (sem isso o formulário continuaria mostrando os campos em branco).
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erro ao carregar perfil do restaurante:', error);
    }
  }

  private validarArquivo(file: File): string | null {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];

    if (!tiposPermitidos.includes(file.type)) {
      return 'Aceite apenas JPG, PNG ou WEBP. GIF não é permitido.';
    }

    if (file.size > 2 * 1024 * 1024) {
      return 'A imagem deve ter no máximo 2MB.';
    }

    return null;
  }
}
