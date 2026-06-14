import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CadastroClienteComponent } from '../cadastro/cadastro';
import { CadastroMotoboyComponent } from '../cadastro-motoboy/cadastro-motoboy';
import { CadastroDonoComponent } from '../cadastro-dono/cadastro-dono';
import { CadastroRestauranteComponent } from '../cadastro-restaurante/cadastro-restaurante';
import { TelaInicialComponent } from '../../telas/cliente/tela-inicial/tela-inicial';
import { TelaMotoboyComponent } from '../../telas/motoboy/tela-inicial/tela-inicial';
import { TelaDonoComponent } from '../../telas/dono/tela-inicial/tela-inicial';
import { TelaRestauranteComponent } from '../../telas/restaurante/tela-inicial/tela-inicial';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, CadastroClienteComponent, CadastroMotoboyComponent, CadastroDonoComponent, CadastroRestauranteComponent, TelaInicialComponent, TelaMotoboyComponent, TelaDonoComponent, TelaRestauranteComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('senhaInput') senhaInput!: ElementRef<HTMLInputElement>;

  telaAtual: 'login' | 'cliente-home' | 'motoboy-home' | 'dono-home' | 'restaurante-home' | 'cadastro-cliente' | 'cadastro-motoboy' | 'cadastro-dono' | 'cadastro-restaurante' = 'login';
  perfilAtivo: 'cliente' | 'motoboy' | 'dono' | 'restaurante' = 'cliente';

  loginEmail = '';
  loginSenha = '';
  loginErro = '';
  loginCarregando = false;
  usuarioAtual: any = null;
  senhaVisivel = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        // O Firebase dispara esse callback FORA da zona do Angular.
        // ngZone.run garante que a mudança de tela atualize a view na hora.
        this.ngZone.run(() => {
          if (user && this.telaAtual === 'login' && !this.loginCarregando) {
            // Sessão persistida (já estava logado): direciona para a ÁREA DA
            // PRÓPRIA CONTA (pelo tipo). Sem aba esperada -> um motoboy sempre
            // cai na tela de motoboy, nunca em outra área. O loginCarregando
            // evita que um login manual rode em paralelo com esse auto-login.
            this.loginCarregando = true;
            this.carregarDadosUsuario(user.uid, null);
          }
        });
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async fazerLogin() {
    // Lê os valores DIRETO do DOM para evitar o bug de autofill
    // (o navegador preenche os campos mas o ngModel pode não capturar)
    const email = (this.emailInput?.nativeElement.value || this.loginEmail).trim();
    const senha = this.senhaInput?.nativeElement.value || this.loginSenha;

    // Sincroniza de volta para o ngModel
    this.loginEmail = email;
    this.loginSenha = senha;

    if (!email || !senha) {
      this.loginErro = 'Por favor, preencha email e senha!';
      return;
    }

    if (this.loginCarregando) {
      return;
    }

    // Trava a aba escolhida NO MOMENTO DO CLIQUE. A validação usa esse valor,
    // então trocar de aba durante o login assíncrono não muda a área esperada.
    const perfilSelecionado = this.perfilAtivo;

    this.loginCarregando = true;
    this.loginErro = '';

    try {
      // Cada seção é uma conta independente (email + seção). Tenta a conta
      // específica desta seção primeiro; se não existir, cai no fallback de
      // contas LEGADAS criadas com o email puro (seeds e contas antigas).
      let user;
      try {
        user = await this.authService.loginSecao(email, senha, perfilSelecionado);
      } catch (erroSecao: any) {
        const semConta = erroSecao?.code === 'auth/invalid-credential'
          || erroSecao?.code === 'auth/user-not-found';
        if (!semConta) { throw erroSecao; }
        // Conta legada com email puro (ex.: restaurantes do seed)
        user = await this.authService.login(email, senha);
      }

      if (!user || !user.uid) {
        this.aplicarEstado(() => {
          this.loginErro = 'Erro ao obter dados da sessão';
          this.loginCarregando = false;
        });
        return;
      }

      await this.carregarDadosUsuario(user.uid, perfilSelecionado);
    } catch (error: any) {
      this.aplicarEstado(() => {
        this.loginCarregando = false;
        this.tratarErroLogin(error);
      });
    }
  }

  // roleSelecionada = aba escolhida no login MANUAL (precisa bater com o tipo
  // da conta). null = sessão persistida/auto-login (vai para a área do tipo da
  // conta, sem exigir aba). Garante que cada área tem acesso individual.
  async carregarDadosUsuario(userId: string, roleSelecionada: string | null = null) {
    try {
      const dados = await this.userService.obterUser(userId);

      this.aplicarEstado(() => {
        if (!dados || !dados.tipo) {
          this.loginErro = 'Erro ao carregar dados do usuário';
          this.loginCarregando = false;
          // Sessão sem perfil válido no Firestore: encerra para não travar
          this.authService.logout();
          return;
        }

        const roleReal = dados.tipo; // o tipo real no Firestore

        // As contas de RESTAURANTE também acessam a área do DONO usando o MESMO
        // email e senha: ao escolher a aba "Dono", o restaurante entra no painel
        // do dono, que mostra os números DAQUELE restaurante. As demais seções
        // continuam independentes.
        const restauranteComoDono = roleSelecionada === 'dono' && roleReal === 'restaurante';

        // Caiu aqui via FALLBACK numa conta legada de OUTRA seção: para a seção
        // escolhida ainda não existe cadastro. Cada seção é independente, então
        // convidamos a se cadastrar nela (sem mandar trocar de aba).
        if (roleSelecionada && roleReal !== roleSelecionada && !restauranteComoDono) {
          const nomeRoles: Record<string, string> = {
            'cliente': 'Cliente',
            'motoboy': 'Motoboy',
            'dono': 'Dono de Negócio',
            'restaurante': 'Restaurante'
          };
          this.loginErro = `Você ainda não tem cadastro de ${nomeRoles[roleSelecionada]} com este email. Toque em "Cadastre-se" para criar.`;
          this.loginCarregando = false;
          // Encerra a sessão da conta de outra seção que o fallback abriu
          this.authService.logout();
          return;
        }

        this.usuarioAtual = dados;
        this.loginCarregando = false;
        this.loginErro = '';

        if (restauranteComoDono) {
          // Restaurante entrando como dono: vai para o painel do dono.
          this.perfilAtivo = 'dono';
          this.telaAtual = 'dono-home';
        } else {
          // OK: direciona SEMPRE para a área do tipo da conta
          this.perfilAtivo = roleReal as 'cliente' | 'motoboy' | 'dono' | 'restaurante';
          this.direcionarParaTela();
        }
      });
    } catch (error) {
      this.aplicarEstado(() => {
        console.error('Erro ao carregar dados:', error);
        this.loginErro = 'Erro ao carregar dados do usuário';
        this.loginCarregando = false;
      });
    }
  }

  // Executa as mudanças de estado DENTRO da zona do Angular e força a
  // detecção de mudanças. Isso resolve o login que ficava preso em
  // "Entrando..." e só destravava ao clicar no olho/senha, pois os
  // callbacks do Firebase rodam fora da zona do Angular.
  private aplicarEstado(fn: () => void) {
    this.ngZone.run(() => {
      fn();
      this.cdr.detectChanges();
    });
  }

  private tratarErroLogin(error: any) {
    const mensagens: Record<string, string> = {
      'auth/invalid-email': 'Email inválido!',
      'auth/user-not-found': 'Usuário não encontrado!',
      'auth/wrong-password': 'Senha incorreta!',
      'auth/invalid-credential': 'Email ou senha incorretos!',
      'auth/too-many-requests': 'Muitas tentativas de login. Tente novamente mais tarde!',
    };

    this.loginErro = mensagens[error.code] || error.message || 'Erro ao fazer login!';
    console.error('Erro no login:', error);
  }

  private direcionarParaTela() {
    switch (this.perfilAtivo) {
      case 'cliente':
        this.telaAtual = 'cliente-home';
        break;
      case 'motoboy':
        this.telaAtual = 'motoboy-home';
        break;
      case 'dono':
        this.telaAtual = 'dono-home';
        break;
      case 'restaurante':
        this.telaAtual = 'restaurante-home';
        break;
    }
  }

  mudarPerfil(role: 'cliente' | 'motoboy' | 'dono' | 'restaurante') {
    this.perfilAtivo = role;
  }

  irParaCadastro() {
    const telasCadastro: Record<string, string> = {
      'cliente': 'cadastro-cliente',
      'motoboy': 'cadastro-motoboy',
      'dono': 'cadastro-dono',
      'restaurante': 'cadastro-restaurante',
    };
    this.telaAtual = telasCadastro[this.perfilAtivo] as any;
  }

  irParaLogin() {
    this.telaAtual = 'login';
    this.loginEmail = '';
    this.loginSenha = '';
    this.loginErro = '';
    this.senhaVisivel = false;
    this.loginCarregando = false;
    this.usuarioAtual = null;
    this.authService.logout();
  }

  toggleSenhaVisivel() {
    this.senhaVisivel = !this.senhaVisivel;
  }

  finalizarCadastroComSucesso(tipo: 'cliente' | 'motoboy' | 'dono' | 'restaurante') {
    const telasMapeadas: Record<string, string> = {
      'cliente': 'cliente-home',
      'motoboy': 'motoboy-home',
      'dono': 'dono-home',
      'restaurante': 'restaurante-home',
    };
    this.telaAtual = telasMapeadas[tipo] as any;
  }
}
