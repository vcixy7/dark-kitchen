import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastro-motoboy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cadastro-motoboy.html',
  styleUrls: ['./cadastro-motoboy.css'],
})
export class CadastroMotoboyComponent {
  @Output() voltar = new EventEmitter<void>();
  @Output() finalizar = new EventEmitter<void>();

  voltarParaTelaAnterior() {
    this.voltar.emit();
  }

  finalizarCadastro() {
    this.finalizar.emit();
  }
}
