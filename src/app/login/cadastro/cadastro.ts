import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ValidatorsService } from '../../services/validators.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro.html',
  styleUrls: ['./cadastro.css']
})
export class CadastroClienteComponent {
  @Output() voltar = new EventEmitter<void>();
  @Output() finalizar = new EventEmitter<void>();

  currentStep: number = 1;
  isLoading = false;
  errorMessage = '';

  formData = {
    nome: '',
    sobrenome: '',
    cpf: '',
    dataNascimento: '',
    fotoUrl: '',
    email: '',
    telefone: '',
    senha: '',
    confirmaSenha: '',
    cep: '',
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    numero: '',
    complemento: ''
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

  onDataInput(event: any) {
    const value = event.target.value;
    event.target.value = this.validators.formatarData(value);
    this.formData.dataNascimento = event.target.value;
  }

  onTelefoneInput(event: any) {
    const value = event.target.value;
    event.target.value = this.validators.formatarTelefone(value);
    this.formData.telefone = event.target.value;
  }

  onCEPInput(event: any) {
    const value = event.target.value;
    event.target.value = this.validators.formatarCEP(value);
    this.formData.cep = event.target.value;
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
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
      console.log('1️⃣ Iniciando cadastro para:', this.formData.email);
      let user: any;

      try {
        await Promise.race([this.authService.signupSecao(this.formData.email, this.formData.senha, 'cliente'), timeoutPromise]);
        console.log('2️⃣ Signup concluído, aguardando sincronização do usuário...');
        user = await Promise.race([this.authService.waitForCurrentUser(), timeoutPromise]) as any;
      } catch (signupError: any) {
        if (signupError.code === 'auth/email-already-in-use') {
          console.log('📧 Email já existe nesta seção, tentando fazer login...');
          await Promise.race([this.authService.loginSecao(this.formData.email, this.formData.senha, 'cliente'), timeoutPromise]);
          user = await Promise.race([this.authService.waitForCurrentUser(), timeoutPromise]) as any;
        } else {
          throw signupError;
        }
      }

      console.log('3️⃣ Usuário sincronizado:', user?.uid);

      if (user) {
        console.log('4️⃣ Salvando dados do cliente para UID:', user.uid);
        await Promise.race([this.userService.salvarCliente(user.uid, this.formData), timeoutPromise]);
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

      if (error.code === 'auth/weak-password') {
        mensagem = 'Senha muito fraca (mínimo 6 caracteres)!';
      } else if (error.code === 'auth/invalid-email') {
        mensagem = 'Email inválido!';
      } else if (error.code === 'auth/wrong-password') {
        mensagem = 'Senha incorreta para esse email!';
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
    if (!this.formData.nome || !this.formData.sobrenome || !this.formData.cpf ||
        !this.formData.dataNascimento || !this.formData.email || !this.formData.telefone ||
        !this.formData.cep || !this.formData.estado || !this.formData.cidade ||
        !this.formData.bairro || !this.formData.rua || !this.formData.numero) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios!';
      return false;
    }

    if (!this.validators.validarCPF(this.formData.cpf)) {
      this.errorMessage = 'CPF inválido!';
      return false;
    }

    if (!this.validators.validarData(this.formData.dataNascimento)) {
      this.errorMessage = 'Data de nascimento inválida! Deve estar no formato dd/mm/aaaa e ter 18+ anos.';
      return false;
    }

    if (!this.validators.validarTelefone(this.formData.telefone)) {
      this.errorMessage = 'Telefone inválido! Deve ter 10 ou 11 dígitos.';
      return false;
    }

    if (!this.validators.validarCEP(this.formData.cep)) {
      this.errorMessage = 'CEP inválido! Deve ter 8 dígitos.';
      return false;
    }

    if (!this.validators.validarEmail(this.formData.email)) {
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