import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {

  // Valida CPF (apenas formato, aceita dados fictícios)
  validarCPF(cpf: string): boolean {
    const apenas_numeros = cpf.replace(/\D/g, '');
    return apenas_numeros.length === 11;
  }

  // Valida CNPJ (apenas formato, aceita dados fictícios)
  validarCNPJ(cnpj: string): boolean {
    const apenas_numeros = cnpj.replace(/\D/g, '');
    return apenas_numeros.length === 14;
  }

  // Formata CPF
  formatarCPF(valor: string): string {
    valor = valor.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.substring(0, 11);
    if (valor.length <= 3) return valor;
    if (valor.length <= 6) return valor.substring(0, 3) + '.' + valor.substring(3);
    if (valor.length <= 9) return valor.substring(0, 3) + '.' + valor.substring(3, 6) + '.' + valor.substring(6);
    return valor.substring(0, 3) + '.' + valor.substring(3, 6) + '.' + valor.substring(6, 9) + '-' + valor.substring(9);
  }

  // Formata CNPJ
  formatarCNPJ(valor: string): string {
    valor = valor.replace(/\D/g, '');
    if (valor.length > 14) valor = valor.substring(0, 14);
    if (valor.length <= 2) return valor;
    if (valor.length <= 5) return valor.substring(0, 2) + '.' + valor.substring(2);
    if (valor.length <= 8) return valor.substring(0, 2) + '.' + valor.substring(2, 5) + '.' + valor.substring(5);
    if (valor.length <= 12) return valor.substring(0, 2) + '.' + valor.substring(2, 5) + '.' + valor.substring(5, 8) + '/' + valor.substring(8);
    return valor.substring(0, 2) + '.' + valor.substring(2, 5) + '.' + valor.substring(5, 8) + '/' + valor.substring(8, 12) + '-' + valor.substring(12);
  }

  // Formata Telefone
  formatarTelefone(valor: string): string {
    valor = valor.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.substring(0, 11);
    if (valor.length <= 2) return valor;
    if (valor.length <= 7) return '(' + valor.substring(0, 2) + ') ' + valor.substring(2);
    return '(' + valor.substring(0, 2) + ') ' + valor.substring(2, 7) + '-' + valor.substring(7);
  }

  // Valida Telefone
  validarTelefone(telefone: string): boolean {
    const apenas_numeros = telefone.replace(/\D/g, '');
    return apenas_numeros.length === 10 || apenas_numeros.length === 11;
  }

  // Formata CEP
  formatarCEP(valor: string): string {
    valor = valor.replace(/\D/g, '');
    if (valor.length > 8) valor = valor.substring(0, 8);
    if (valor.length <= 5) return valor;
    return valor.substring(0, 5) + '-' + valor.substring(5);
  }

  // Valida CEP
  validarCEP(cep: string): boolean {
    const apenas_numeros = cep.replace(/\D/g, '');
    return apenas_numeros.length === 8;
  }

  // Valida Data (dd/mm/aaaa)
  validarData(data: string): boolean {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/;
    if (!regex.test(data)) return false;

    const partes = data.split('/');
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const ano = parseInt(partes[2], 10);

    const data_obj = new Date(ano, mes - 1, dia);
    const idade = new Date().getFullYear() - ano;

    if (idade < 18) return false;
    if (data_obj.getMonth() + 1 !== mes) return false;

    return true;
  }

  // Formata Data
  formatarData(valor: string): string {
    valor = valor.replace(/\D/g, '');
    if (valor.length > 8) valor = valor.substring(0, 8);
    if (valor.length <= 2) return valor;
    if (valor.length <= 4) return valor.substring(0, 2) + '/' + valor.substring(2);
    return valor.substring(0, 2) + '/' + valor.substring(2, 4) + '/' + valor.substring(4);
  }

  // Valida Email
  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Valida Senha (mínimo 6 caracteres)
  validarSenha(senha: string): boolean {
    return !!(senha && senha.length >= 6);
  }

  // Formata Placa de Moto (ABC-1234)
  formatarPlacaMoto(valor: string): string {
    valor = valor.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (valor.length > 7) valor = valor.substring(0, 7);
    if (valor.length <= 3) return valor;
    return valor.substring(0, 3) + '-' + valor.substring(3);
  }

  // Valida Placa de Moto
  validarPlacaMoto(placa: string): boolean {
    const regex = /^[A-Z]{3}-?\d{4}$/;
    return regex.test(placa.toUpperCase());
  }

  // Valida CNH (números apenas)
  validarCNH(cnh: string): boolean {
    const apenas_numeros = cnh.replace(/\D/g, '');
    return apenas_numeros.length === 11;
  }
}
