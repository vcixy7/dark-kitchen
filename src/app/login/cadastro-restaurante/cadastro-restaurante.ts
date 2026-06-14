import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ValidatorsService } from '../../services/validators.service';

@Component({
  selector: 'app-cadastro-restaurante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-restaurante.html',
  styleUrls: ['./cadastro-restaurante.css']
})
export class CadastroRestauranteComponent {
  @Output() voltar = new EventEmitter<void>();
  @Output() finalizar = new EventEmitter<void>();

  currentStep: number = 1;
  isLoading = false;
  errorMessage = '';

  formData = {
    nomeResponsavel: '',
    sobrenomeResponsavel: '',
    cpfResponsavel: '',
    emailResponsavel: '',
    telefoneResponsavel: '',
    senha: '',
    confirmaSenha: '',
    nomeRestaurante: '',
    cnpj: '',
    categoria: '',
    descricao: '',
    fotoRestauranteUrl: '',
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
    this.formData.cpfResponsavel = event.target.value;
  }

  onCNPJInput(event: any) {
    const value = event.target.value;
    event.target.value = this.validators.formatarCNPJ(value);
    this.formData.cnpj = event.target.value;
  }

  onTelefoneInput(event: any) {
    const value = event.target.value;
    event.target.value = this.validators.formatarTelefone(value);
    this.formData.telefoneResponsavel = event.target.value;
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
      console.log('1️⃣ Iniciando cadastro restaurante para:', this.formData.emailResponsavel);
      let user: any;

      try {
        await Promise.race([this.authService.signupSecao(this.formData.emailResponsavel, this.formData.senha, 'restaurante'), timeoutPromise]);
        console.log('2️⃣ Signup concluído, aguardando sincronização do usuário...');
        user = await Promise.race([this.authService.waitForCurrentUser(), timeoutPromise]) as any;
      } catch (signupError: any) {
        if (signupError.code === 'auth/email-already-in-use') {
          console.log('📧 Email já existe nesta seção, tentando fazer login...');
          await Promise.race([this.authService.loginSecao(this.formData.emailResponsavel, this.formData.senha, 'restaurante'), timeoutPromise]);
          user = await Promise.race([this.authService.waitForCurrentUser(), timeoutPromise]) as any;
        } else {
          throw signupError;
        }
      }

      console.log('3️⃣ Usuário sincronizado:', user?.uid);

      if (user) {
        console.log('4️⃣ Salvando dados do restaurante para UID:', user.uid);
        await Promise.race([this.userService.salvarRestaurante(user.uid, this.formData), timeoutPromise]);
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
    if (!this.formData.nomeResponsavel || !this.formData.sobrenomeResponsavel ||
        !this.formData.cpfResponsavel || !this.formData.emailResponsavel ||
        !this.formData.telefoneResponsavel || !this.formData.nomeRestaurante ||
        !this.formData.cnpj || !this.formData.categoria || !this.formData.descricao ||
        !this.formData.cep || !this.formData.estado || !this.formData.cidade ||
        !this.formData.bairro || !this.formData.rua || !this.formData.numero) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios!';
      return false;
    }

    if (!this.validators.validarCPF(this.formData.cpfResponsavel)) {
      this.errorMessage = 'CPF do responsável inválido!';
      return false;
    }

    if (!this.validators.validarEmail(this.formData.emailResponsavel)) {
      this.errorMessage = 'Email inválido!';
      return false;
    }

    if (!this.validators.validarTelefone(this.formData.telefoneResponsavel)) {
      this.errorMessage = 'Telefone inválido! Deve ter 10 ou 11 dígitos.';
      return false;
    }

    if (!this.validators.validarCNPJ(this.formData.cnpj)) {
      this.errorMessage = 'CNPJ do restaurante inválido!';
      return false;
    }

    if (!this.validators.validarCEP(this.formData.cep)) {
      this.errorMessage = 'CEP inválido! Deve ter 8 dígitos.';
      return false;
    }

    if (!this.validators.validarSenha(this.formData.senha)) {
      this.errorMessage = 'Senha deve ter no mínimo 6 caracteres!';
      return false;
    }

    return true;
  }
}