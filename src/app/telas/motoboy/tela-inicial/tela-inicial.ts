import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tela-motoboy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="motoboy-page">
      <div class="hero-card">
        <div>
          <p class="eyebrow">Área do motoboy</p>
          <h1>Bem-vindo, {{ nome }}</h1>
          <p class="hero-description">
            Acompanhe suas entregas, o status da rota e prossiga com as ações do dia.
          </p>
        </div>

        <div class="hero-right">
          <div class="hero-status">
            <span class="status-pill">{{ status }}</span>
            <p class="rating">⭐ {{ avaliacao }} de avaliação</p>
          </div>

          <div class="top-actions">
            <button type="button" class="profile-toggle-btn" (click)="alternarPerfil()">
              <span class="profile-toggle-icon">👤</span>
              <span class="profile-toggle-copy">
                <strong>{{ motoboyInfo.nome }}</strong>
                <small>Editar perfil</small>
              </span>
            </button>
            <button type="button" class="logout-btn" (click)="sairDaConta()">
              Logout
            </button>
          </div>
        </div>
      </div>

      <section class="profile-screen" *ngIf="perfilAberto">
        <div class="profile-screen-header">
          <div>
            <p class="eyebrow">Perfil do motoboy</p>
            <h2>Gerencie suas informações, metas e histórico</h2>
            <p class="profile-screen-copy">
              Aqui você atualiza seus dados, acompanha a meta de entregas para ganhar recompensas e revisa o histórico das entregas concluídas.
            </p>
          </div>

          <div class="profile-screen-actions">
            <button type="button" class="secondary-btn" (click)="alternarPerfil()">
              Voltar para entregas
            </button>
            <button type="button" class="primary-btn" (click)="salvarPerfil()">
              Salvar alterações
            </button>
          </div>
        </div>

        <div class="profile-screen-grid">
          <section class="profile-section-card">
            <div class="section-title-row">
              <h3>Alterar informações</h3>
              <span>Dados pessoais</span>
            </div>

            <div class="profile-form-grid">
              <label class="profile-field">
                <span>Nome</span>
                <input type="text" [(ngModel)]="motoboyInfo.nome" />
              </label>

              <label class="profile-field">
                <span>Email</span>
                <input type="email" [(ngModel)]="motoboyInfo.email" />
              </label>

              <label class="profile-field">
                <span>Telefone</span>
                <input type="tel" [(ngModel)]="motoboyInfo.telefone" />
              </label>

              <label class="profile-field">
                <span>Veículo</span>
                <input type="text" [(ngModel)]="motoboyInfo.veiculo" />
              </label>
            </div>
          </section>

          <section class="profile-section-card">
            <div class="section-title-row">
              <h3>Meta de entregas para recompensas</h3>
              <span>{{ metasCompletas }} / {{ metas.length }}</span>
            </div>

            <div class="goals-list">
              <article class="goal-item" *ngFor="let meta of metas">
                <div>
                  <p class="goal-title">{{ meta.titulo }}</p>
                  <p class="goal-caption">{{ meta.descricao }}</p>
                </div>
                <div class="goal-badge" [class.completed]="meta.concluida">
                  {{ meta.concluida ? 'Concluída' : 'Em andamento' }}
                </div>
              </article>
            </div>

            <div class="goal-progress">
              <div class="goal-progress-bar">
                <span [style.width.%]="(metasCompletas / metas.length) * 100"></span>
              </div>
              <p>{{ ((metasCompletas / metas.length) * 100).toFixed(0) }}% da meta diária concluída</p>
            </div>

            <div class="reward-banner">
              <strong>Próxima recompensa</strong>
              <span>R$ 15,00 de bônus ao concluir a meta do dia.</span>
            </div>
          </section>

          <section class="profile-section-card">
            <div class="section-title-row">
              <h3>Histórico de entregas</h3>
              <span>{{ historicoEntregas.length }} concluídas</span>
            </div>

            <div class="history-list">
              <article class="history-item" *ngFor="let entrega of historicoEntregas">
                <div>
                  <p class="history-code">{{ entrega.codigo }}</p>
                  <p class="history-client">{{ entrega.cliente }}</p>
                  <p class="history-address">{{ entrega.endereco }}</p>
                </div>
                <div class="history-meta">
                  <span class="history-status">{{ entrega.status }}</span>
                  <strong>R$ {{ entrega.valor.toFixed(2) }}</strong>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>

      <ng-container *ngIf="!perfilAberto">
        <div class="summary-grid">
        <article class="summary-card">
          <span class="summary-label">Entregas pendentes</span>
          <strong>{{ entregasEmAndamento.length }}</strong>
        </article>

        <article class="summary-card">
          <span class="summary-label">Entregas hoje</span>
          <strong>{{ entregasHoje }}</strong>
        </article>

        <article class="summary-card">
          <span class="summary-label">Ganhos hoje</span>
          <strong>R$ {{ ganhosHoje.toFixed(2) }}</strong>
        </article>
      </div>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Entregas em andamento</h2>
            <span>Atualize conforme sair</span>
          </div>
          <span class="panel-badge">{{ entregasEmAndamento.length }} em rota</span>
        </div>

        <div class="delivery-list">
          <article class="delivery-item" *ngFor="let entrega of entregasEmAndamento">
            <div class="delivery-top-row">
              <div>
                <p class="delivery-code">{{ entrega.codigo }}</p>
                <p class="delivery-client">{{ entrega.cliente }}</p>
              </div>

              <div class="delivery-meta">
                <span class="delivery-status">{{ entrega.status }}</span>
                <strong class="delivery-value">R$ {{ entrega.valor.toFixed(2) }}</strong>
              </div>
            </div>

            <div class="route-card">
              <div class="route-block" [class.disabled]="entrega.etapa > 2">
                <p class="route-label pickup">📍 RETIRAR EM</p>
                <p class="route-point">{{ entrega.restaurante }}</p>
                <p class="route-address">{{ entrega.enderecoRestaurante }}</p>
              </div>

              <div class="route-divider"></div>

              <div class="route-block" [class.disabled]="entrega.etapa < 3">
                <p class="route-label delivery">🚀 ENTREGAR EM</p>
                <p class="route-point">{{ entrega.cliente }}</p>
                <p class="route-address">{{ entrega.endereco }} ({{ entrega.distancia }})</p>
              </div>
            </div>

            <div class="actions-row">
              <button type="button" class="secondary-btn" (click)="navegarPara(entrega)">
                🗺️ Navegar
              </button>

              <button
                type="button"
                class="primary-btn"
                *ngIf="entrega.etapa < 4"
                (click)="proximaEtapa(entrega)"
              >
                <span *ngIf="entrega.etapa === 1">Aceitar Entrega</span>
                <span *ngIf="entrega.etapa === 2">Ir para o Cliente</span>
                <span *ngIf="entrega.etapa === 3">Cheguei ao Cliente</span>
              </button>
            </div>

            <div *ngIf="entrega.etapa === 4" class="confirm-box">
              <p class="confirm-title">Digite o código de confirmação do cliente:</p>
              <div class="confirm-actions">
                <input
                  type="text"
                  #txtCodigo
                  placeholder="Ex: 1234"
                  class="confirm-input"
                >
                <button
                  type="button"
                  class="confirm-btn"
                  (click)="verificarCodigo(entrega, txtCodigo.value)"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
      </ng-container>
    </section>
  `,
  styleUrls: ['./tela-inicial.css']
})
export class TelaMotoboyComponent {
  @Output() logout = new EventEmitter<void>();

  nome = 'Motoboy';
  status = 'Disponível';
  entregasHoje = 8;
  ganhosHoje = 125.50;
  avaliacao = 4.9;
  perfilAberto = false;

  motoboyInfo = {
    nome: 'Motoboy',
    email: 'motoboy@flashfood.com',
    telefone: '(11) 99999-0000',
    veiculo: 'Moto Yamaha MT-03'
  };

  entregasEmAndamento = [
    {
      codigo: 'ORD-1772584623001',
      restaurante: 'Burger Master',
      enderecoRestaurante: 'Rua das Flores, 123',
      cliente: 'João Silva',
      endereco: 'Av. Paulista, 1000 - Apto 501',
      distancia: '2.5 km',
      valor: 64.70,
      etapa: 1,
      status: 'A Caminho do Restaurante',
      pinCorreto: '1234'
    },
    {
      codigo: 'ORD-1772584623002',
      restaurante: 'Pizza Bella',
      enderecoRestaurante: 'Rua do Comércio, 456',
      cliente: 'Maria Santos',
      endereco: 'Rua Augusta, 500 - Casa 2',
      distancia: '3.8 km',
      valor: 89.50,
      etapa: 1,
      status: 'A Caminho do Restaurante',
      pinCorreto: '8854'
    }
  ];

  historicoEntregas = [
    {
      codigo: 'ORD-1772584622990',
      cliente: 'Ana Pereira',
      endereco: 'Rua XV de Novembro, 330',
      valor: 58.90,
      status: 'Concluída'
    },
    {
      codigo: 'ORD-1772584622991',
      cliente: 'Carlos Lima',
      endereco: 'Av. Brasil, 780',
      valor: 72.40,
      status: 'Concluída'
    },
    {
      codigo: 'ORD-1772584622992',
      cliente: 'Juliana Rocha',
      endereco: 'Rua Santo Antônio, 12',
      valor: 44.20,
      status: 'Concluída'
    }
  ];

  metas = [
    {
      titulo: '5 entregas concluídas',
      descricao: 'Foque em fechar pelo menos 5 entregas hoje',
      concluida: true
    },
    {
      titulo: 'R$ 200 em ganhos',
      descricao: 'Acompanhe o valor total do dia',
      concluida: false
    },
    {
      titulo: 'Retirada rápida',
      descricao: 'Aceitar e sair para o restaurante em até 10 minutos',
      concluida: true
    }
  ];

  get metasCompletas(): number {
    return this.metas.filter((meta) => meta.concluida).length;
  }

  proximaEtapa(entrega: any) {
    if (entrega.etapa === 1) {
      entrega.etapa = 2;
      entrega.status = 'Retirando Pedido';
    } else if (entrega.etapa === 2) {
      entrega.etapa = 3;
      entrega.status = 'Em Rota para o Cliente';
    } else if (entrega.etapa === 3) {
      entrega.etapa = 4;
      entrega.status = 'Chegou ao Destino';
    }
  }

  navegarPara(entrega: any) {
    const destino = entrega.etapa === 1 ? entrega.enderecoRestaurante : entrega.endereco;

    const abrirRota = (origem: string) => {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origem)}&destination=${encodeURIComponent(destino)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => abrirRota(`${coords.latitude},${coords.longitude}`),
        () => abrirRota('Minha+Localiza%C3%A7%C3%A3o')
      );
      return;
    }

    abrirRota('Minha+Localiza%C3%A7%C3%A3o');
  }

  alternarPerfil(): void {
    this.perfilAberto = !this.perfilAberto;
  }

  salvarPerfil(): void {
    this.nome = this.motoboyInfo.nome;
    this.perfilAberto = false;
    alert('Perfil atualizado com sucesso!');
  }

  sairDaConta(): void {
    if (window.confirm('Deseja realmente sair?')) {
      this.logout.emit();
    }
  }

  verificarCodigo(entrega: any, codigoDigitado: string) {
    if (codigoDigitado === entrega.pinCorreto) {
      alert('Entrega concluída com sucesso!');
      this.ganhosHoje += 12.50;
      this.entregasHoje++;
      this.entregasEmAndamento = this.entregasEmAndamento.filter((e) => e.codigo !== entrega.codigo);
    } else {
      alert('Código de segurança incorreto. Tente novamente.');
    }
  }
}