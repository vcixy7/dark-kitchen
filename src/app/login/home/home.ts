import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CadastroClienteComponent } from '../cadastro/cadastro';
import { CadastroMotoboyComponent } from '../cadastro-motoboy/cadastro-motoboy';
import { CadastroDonoComponent } from '../cadastro-dono/cadastro-dono';
import { CadastroRestauranteComponent } from '../cadastro-restaurante/cadastro-restaurante';
import { TelaInicialComponent } from '../../telas/cliente/tela-inicial/tela-inicial';
import { TelaMotoboyComponent } from '../../telas/motoboy/tela-inicial/tela-inicial';
import { TelaDonoComponent } from '../../telas/dono/tela-inicial/tela-inicial';
import { TelaRestauranteComponent } from '../../telas/restaurante/tela-inicial/tela-inicial';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CadastroClienteComponent, CadastroMotoboyComponent, CadastroDonoComponent, CadastroRestauranteComponent, TelaInicialComponent, TelaMotoboyComponent, TelaDonoComponent, TelaRestauranteComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  telaAtual: 'login' | 'cliente-home' | 'motoboy-home' | 'dono-home' | 'restaurante-home' | 'cadastro-cliente' | 'cadastro-motoboy' | 'cadastro-dono' | 'cadastro-restaurante' = 'login';

  perfilAtivo: 'cliente' | 'motoboy' | 'dono' | 'restaurante' = 'cliente';

  mudarPerfil(role: 'cliente' | 'motoboy' | 'dono' | 'restaurante') {
    this.perfilAtivo = role;
  }

  irParaCadastro() {
    if (this.perfilAtivo === 'cliente') {
      this.telaAtual = 'cadastro-cliente';
    } else if (this.perfilAtivo === 'motoboy') {
      this.telaAtual = 'cadastro-motoboy';
    } else if (this.perfilAtivo === 'dono') {
      this.telaAtual = 'cadastro-dono';
    } else if (this.perfilAtivo === 'restaurante') {
      this.telaAtual = 'cadastro-restaurante';
    }
  }

  irParaLogin() {
    this.telaAtual = 'login';
  }

  abrirTelaInicialCliente() {
    this.telaAtual = 'cliente-home';
  }

  abrirTelaMotoboy() {
    this.telaAtual = 'motoboy-home';
  }

  abrirTelaDono() {
    this.telaAtual = 'dono-home';
  }

  abrirTelaRestaurante() {
    this.telaAtual = 'restaurante-home';
  }

  entrarNoApp() {
    if (this.perfilAtivo === 'cliente') {
      this.abrirTelaInicialCliente();
    } else if (this.perfilAtivo === 'motoboy') {
      this.abrirTelaMotoboy();
    } else if (this.perfilAtivo === 'dono') {
      this.abrirTelaDono();
    } else if (this.perfilAtivo === 'restaurante') {
      this.abrirTelaRestaurante();
    }
  }
}