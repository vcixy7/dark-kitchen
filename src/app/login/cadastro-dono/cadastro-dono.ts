import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ValidatorsService } from '../../services/validators.service';

@Component({
  selector: 'app-cadastro-dono',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-dono.html',
  styleUrls: ['./cadastro-dono.css']
})
export class CadastroDonoComponent {
  @Output() voltar = new EventEmitter<void>();
  @Output() finalizar = new EventEmitter<void>();

  isLoading = false;
  errorMessage = '';

  formData = {
    nomeProprietario: '',
    sobrenome: '',
    cpf: '',
    cnpjEmpresa: '',
    emailCorporativo: '',
    telefoneComercial: '',
    senha: '',
    confirmaSenha: ''
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    public validators: ValidatorsService
  ) {}

  onCPFInput(event: any) {
    const value = event.target.value;
    event.target.value = this.validators.formatarCPF(value);
    this.formData.cpf = event.target.value;
  }

  onCNPJInput(event: any) {
    const value = event.target.value;
    event.target.value = this.validators.formatarCNPJ(value);
    this.formData.cnpjEmpresa = event.target.value;
  }

  onTelefoneInput(event: any) {
    const value = event.target.value;
    event.target.value = this.validators.formatarTelefone(value);
    this.formData.telefoneComercial = event.target.value;
  }

  voltarParaTelaAnterior() {
    this.voltar.emit();
  }

  async finalizarCadastro() {
    console.log('🔵 INICIANDO finalizarCadastro()...');
    if (!this.validarDados()) {
      console.log('❌ Validação de dados falhou');
      return;
    }

    if (this.formData.senha !== this.formData.confirmaSenha) {
      this.errorMessage = 'As senhas não conferem!';
      console.log('❌ Senhas não conferem');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout ao criar cadastro')), 15000)
    );

    try {
      console.log('1️⃣ Iniciando cadastro dono para:', this.formData.emailCorporativo);
      let user: any;

      try {
        await Promise.race([this.authService.signupSecao(this.formData.emailCorporativo, this.formData.senha, 'dono'), timeoutPromise]);
        console.log('2️⃣ Signup concluído, aguardando sincronização do usuário...');
        user = await Promise.race([this.authService.waitForCurrentUser(), timeoutPromise]) as any;
      } catch (signupError: any) {
        if (signupError.code === 'auth/email-already-in-use') {
          console.log('📧 Email já existe nesta seção, tentando fazer login...');
          await Promise.race([this.authService.loginSecao(this.formData.emailCorporativo, this.formData.senha, 'dono'), timeoutPromise]);
          user = await Promise.race([this.authService.waitForCurrentUser(), timeoutPromise]) as any;
        } else {
          throw signupError;
        }
      }

      console.log('3️⃣ Usuário sincronizado:', user?.uid);

      if (user) {
        console.log('4️⃣ Salvando dados do dono para UID:', user.uid);
        await Promise.race([this.userService.salvarDono(user.uid, this.formData), timeoutPromise]);
        console.log('5️⃣ Dados salvos com sucesso!');
        console.log('6️⃣ EMITINDO evento finalizar...');
        this.finalizar.emit();
        console.log('7️⃣ Evento finalizar emitido com sucesso!');
      } else {
        this.errorMessage = 'Erro ao obter dados do usuário!';
        console.log('❌ Usuário é null');
      }
    } catch (error: any) {
      console.error('❌ Erro completo:', error);
      let mensagem = 'Erro ao criar cadastro!';

      if (error.code === 'auth/email-already-in-use') {
        mensagem = 'Email já cadastrado!';
      } else if (error.code === 'auth/weak-password') {
        mensagem = 'Senha muito fraca (mínimo 6 caracteres)!';
      } else if (error.code === 'auth/invalid-email') {
        mensagem = 'Email inválido!';
      } else if (error.message?.includes('Timeout')) {
        mensagem = 'Operação demorou muito. Verifique sua conexão!';
      } else if (error.message) {
        mensagem = error.message;
      }

      this.errorMessage = mensagem;
    } finally {
      this.isLoading = false;
    }
  }

  private validarDados(): boolean {
    if (!this.formData.nomeProprietario || !this.formData.sobrenome || !this.formData.cpf ||
        !this.formData.cnpjEmpresa || !this.formData.emailCorporativo || !this.formData.telefoneComercial ||
        !this.formData.senha) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios!';
      return false;
    }

    if (!this.validators.validarCPF(this.formData.cpf)) {
      this.errorMessage = 'CPF inválido!';
      return false;
    }

    if (!this.validators.validarCNPJ(this.formData.cnpjEmpresa)) {
      this.errorMessage = 'CNPJ inválido!';
      return false;
    }

    if (!this.validators.validarTelefone(this.formData.telefoneComercial)) {
      this.errorMessage = 'Telefone inválido! Deve ter 10 ou 11 dígitos.';
      return false;
    }

    if (!this.validators.validarEmail(this.formData.emailCorporativo)) {
      this.errorMessage = 'Email inválido!';
      return false;
    }

    if (!this.validators.validarSenha(this.formData.senha)) {
      this.errorMessage = 'Senha deve ter no mínimo 6 caracteres!';
      return false;
    }

    return true;
  }
}