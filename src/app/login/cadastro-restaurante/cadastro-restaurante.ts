import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastro-restaurante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cadastro-restaurante.html',
  styleUrls: ['./cadastro-restaurante.css']
})
export class CadastroRestauranteComponent {
  @Output() voltar = new EventEmitter<void>();
  @Output() finalizar = new EventEmitter<void>();
  
  currentStep: number = 1;

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

  finalizarCadastro() {
    this.finalizar.emit();
  }
}