import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastro-dono',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cadastro-dono.html',
  styleUrls: ['./cadastro-dono.css']
})
export class CadastroDonoComponent {
  @Output() voltar = new EventEmitter<void>();
  @Output() finalizar = new EventEmitter<void>();

  voltarParaTelaAnterior() {
    this.voltar.emit();
  }

  finalizarCadastro() {
    this.finalizar.emit();
  }
}