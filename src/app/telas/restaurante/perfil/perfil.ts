import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PerfilRestauranteData {
  fotoRestaurante: string | null;
  nomeRestaurante: string;
  email: string;
  telefone: string;
  descricao: string;
  rua: string;
  cidade: string;
  estado: string;
  cep: string;
}

const STORAGE_KEY = 'dark-kitchen-restaurante-perfil';

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
  nomeRestaurante = 'Flash Burger';
  email = 'contato@flashburger.com';
  telefone = '(11) 98765-4321';
  descricao = 'Os melhores hambúrgueres artesanais da cidade, feitos com ingredientes selecionados e muito amor.';
  rua = 'Rua das Flores, 123';
  cidade = 'São Paulo';
  estado = 'SP';
  cep = '01234-567';

  statusMensagem = 'Atualize os dados do restaurante e a foto local.';
  statusTipo: 'info' | 'sucesso' | 'erro' = 'info';

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
      this.statusMensagem = 'Foto atualizada com sucesso.';
      this.statusTipo = 'sucesso';
    };
    reader.readAsDataURL(file);
  }

  salvarAlteracoes(): void {
    if (!this.nomeRestaurante.trim() || !this.email.trim()) {
      this.statusMensagem = 'Preencha o nome do restaurante e o email.';
      this.statusTipo = 'erro';
      return;
    }

    const dados: PerfilRestauranteData = {
      fotoRestaurante: this.fotoRestaurante,
      nomeRestaurante: this.nomeRestaurante.trim(),
      email: this.email.trim(),
      telefone: this.telefone.trim(),
      descricao: this.descricao.trim(),
      rua: this.rua.trim(),
      cidade: this.cidade.trim(),
      estado: this.estado.trim(),
      cep: this.cep.trim()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    this.statusMensagem = 'Alterações salvas com sucesso.';
    this.statusTipo = 'sucesso';
    this.salvar.emit();
  }

  private carregarPerfil(): void {
    const salvo = localStorage.getItem(STORAGE_KEY);

    if (!salvo) {
      return;
    }

    try {
      const dados = JSON.parse(salvo) as Partial<PerfilRestauranteData>;

      this.fotoRestaurante = dados.fotoRestaurante ?? null;
      this.nomeRestaurante = dados.nomeRestaurante ?? this.nomeRestaurante;
      this.email = dados.email ?? this.email;
      this.telefone = dados.telefone ?? this.telefone;
      this.descricao = dados.descricao ?? this.descricao;
      this.rua = dados.rua ?? this.rua;
      this.cidade = dados.cidade ?? this.cidade;
      this.estado = dados.estado ?? this.estado;
      this.cep = dados.cep ?? this.cep;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
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
