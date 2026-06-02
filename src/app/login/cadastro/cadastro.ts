import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cadastro.html',
  styleUrls: ['./cadastro.css']
})
export class CadastroClienteComponent {
  @Output() voltar = new EventEmitter<void>();
  @Output() finalizar = new EventEmitter<void>();
  //  (Dados Pessoais)
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
    alert('Cadastro de cliente finalizado com sucesso!');
    this.finalizar.emit();
  }
}