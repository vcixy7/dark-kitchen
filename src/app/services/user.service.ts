import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { app } from '../firebase.config';

export interface ClienteData {
  userId: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  dataNascimento: string;
  fotoUrl?: string;
  email: string;
  telefone: string;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento?: string;
  tipo: 'cliente';
  dataCriacao: Date;
}

export interface MotoboyData {
  userId: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  cnh: string;
  placaMoto: string;
  modeloMoto: string;
  email: string;
  telefone: string;
  fotoUrl?: string;
  tipo: 'motoboy';
  dataCriacao: Date;
}

export interface DonoData {
  userId: string;
  nomeProprietario: string;
  sobrenome: string;
  cpf: string;
  cnpjEmpresa: string;
  emailCorporativo: string;
  telefoneComercia: string;
  tipo: 'dono';
  dataCriacao: Date;
}

export interface RestauranteData {
  userId: string;
  nomeResponsavel: string;
  sobrenomeResponsavel: string;
  cpfResponsavel: string;
  emailResponsavel: string;
  telefoneResponsavel: string;
  nomeRestaurante: string;
  cnpj: string;
  categoria: string;
  descricao: string;
  fotoRestauranteUrl?: string;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento?: string;
  tipo: 'restaurante';
  dataCriacao: Date;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = getFirestore(app);

  async salvarCliente(userId: string, dados: any): Promise<void> {
    const clienteRef = doc(this.firestore, 'users', userId);
    const clienteData: ClienteData = {
      userId,
      nome: dados.nome,
      sobrenome: dados.sobrenome,
      cpf: dados.cpf,
      dataNascimento: dados.dataNascimento,
      fotoUrl: dados.fotoUrl,
      email: dados.email,
      telefone: dados.telefone,
      cep: dados.cep,
      estado: dados.estado,
      cidade: dados.cidade,
      bairro: dados.bairro,
      rua: dados.rua,
      numero: dados.numero,
      complemento: dados.complemento,
      tipo: 'cliente',
      dataCriacao: new Date(),
    };
    await setDoc(clienteRef, clienteData);
  }

  async salvarMotoboy(userId: string, dados: any): Promise<void> {
    const motoboyRef = doc(this.firestore, 'users', userId);
    const motoboyData: MotoboyData = {
      userId,
      nome: dados.nome,
      sobrenome: dados.sobrenome,
      cpf: dados.cpf,
      cnh: dados.cnh,
      placaMoto: dados.placaMoto,
      modeloMoto: dados.modeloMoto,
      email: dados.email,
      telefone: dados.telefone,
      fotoUrl: dados.fotoUrl,
      tipo: 'motoboy',
      dataCriacao: new Date(),
    };
    await setDoc(motoboyRef, motoboyData);
  }

  async salvarDono(userId: string, dados: any): Promise<void> {
    const donoRef = doc(this.firestore, 'users', userId);
    const donoData: DonoData = {
      userId,
      nomeProprietario: dados.nomeProprietario,
      sobrenome: dados.sobrenome,
      cpf: dados.cpf,
      cnpjEmpresa: dados.cnpjEmpresa,
      emailCorporativo: dados.emailCorporativo,
      telefoneComercia: dados.telefoneComercial,
      tipo: 'dono',
      dataCriacao: new Date(),
    };
    await setDoc(donoRef, donoData);
  }

  async salvarRestaurante(userId: string, dados: any): Promise<void> {
    const restauranteRef = doc(this.firestore, 'users', userId);
    const restauranteData: RestauranteData = {
      userId,
      nomeResponsavel: dados.nomeResponsavel,
      sobrenomeResponsavel: dados.sobrenomeResponsavel,
      cpfResponsavel: dados.cpfResponsavel,
      emailResponsavel: dados.emailResponsavel,
      telefoneResponsavel: dados.telefoneResponsavel,
      nomeRestaurante: dados.nomeRestaurante,
      cnpj: dados.cnpj,
      categoria: dados.categoria,
      descricao: dados.descricao,
      fotoRestauranteUrl: dados.fotoRestauranteUrl,
      cep: dados.cep,
      estado: dados.estado,
      cidade: dados.cidade,
      bairro: dados.bairro,
      rua: dados.rua,
      numero: dados.numero,
      complemento: dados.complemento,
      tipo: 'restaurante',
      dataCriacao: new Date(),
    };
    await setDoc(restauranteRef, restauranteData);
  }

  async obterUser(userId: string): Promise<any> {
    const userRef = doc(this.firestore, 'users', userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
  }

  // TODO: este método faz um update parcial do documento do usuário, preservando os campos não informados.
  async atualizarUser(userId: string, dados: any): Promise<void> {
    const userRef = doc(this.firestore, 'users', userId);
    await updateDoc(userRef, dados);
  }

  // TODO: futuramente este método pode virar uma consulta paginada para não carregar todos os restaurantes de uma vez.
  async obterRestaurantes(): Promise<any[]> {
    try {
      const q = query(collection(this.firestore, 'users'), where('tipo', '==', 'restaurante'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao obter restaurantes:', error);
      return [];
    }
  }
}
