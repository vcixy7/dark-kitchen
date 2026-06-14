import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { app } from '../firebase.config';

export interface ItemPedido {
  nome: string;
  preco: number;
  quantidade: number;
  acompanhamentos?: string[];
}

export type StatusPedido =
  | 'Novo Pedido'
  | 'Em Preparo'
  | 'Pronto'
  | 'Aguardando Motoboy'
  | 'Retirado'
  | 'Em Entrega'
  | 'Entregue'
  | 'Cancelado';

export interface Pedido {
  id?: string;
  restauranteId: string;
  clienteId: string;
  motoboyId?: string;
  codigo: string;
  cliente: {
    nome: string;
    telefone: string;
    endereco: string;
  };
  restaurante: {
    nome: string;
    endereco: string;
  };
  itens: ItemPedido[];
  valor: number;
  status: StatusPedido;
  dataPedido: Date;
  dataEntrega?: Date;
  observacoes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  private firestore = getFirestore(app);

  // TODO: este método cria o pedido no Firestore e já define a data inicial do fluxo.
  async criarPedido(pedido: Pedido): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.firestore, 'pedidos'), {
        ...pedido,
        dataPedido: new Date(),
      });
      console.log('✅ Pedido criado:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar pedido:', error);
      throw error;
    }
  }

  // TODO: este método carrega os pedidos de um restaurante em uma única leitura para o painel administrativo.
  async obterPedidosRestaurante(restauranteId: string): Promise<Pedido[]> {
    try {
      const q = query(
        collection(this.firestore, 'pedidos'),
        where('restauranteId', '==', restauranteId),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Pedido[];
    } catch (error) {
      console.error('❌ Erro ao obter pedidos:', error);
      return [];
    }
  }

  // Obter pedidos do cliente
  async obterPedidosCliente(clienteId: string): Promise<Pedido[]> {
    try {
      const q = query(collection(this.firestore, 'pedidos'), where('clienteId', '==', clienteId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Pedido[];
    } catch (error) {
      console.error('❌ Erro ao obter pedidos:', error);
      return [];
    }
  }

  // Obter pedidos do motoboy
  async obterPedidosMotoboy(motoboyId: string): Promise<Pedido[]> {
    try {
      const q = query(collection(this.firestore, 'pedidos'), where('motoboyId', '==', motoboyId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Pedido[];
    } catch (error) {
      console.error('❌ Erro ao obter pedidos:', error);
      return [];
    }
  }

  // Obter pedidos prontos para o motoboy (status 'Pronto')
  async obterPedidosProntos(): Promise<Pedido[]> {
    try {
      const q = query(collection(this.firestore, 'pedidos'), where('status', '==', 'Pronto'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Pedido[];
    } catch (error) {
      console.error('❌ Erro ao obter pedidos prontos:', error);
      return [];
    }
  }

  // TODO: este método altera o status do pedido para avançar o fluxo entre cozinha, entrega e conclusão.
  async atualizarStatusPedido(pedidoId: string, novoStatus: StatusPedido): Promise<void> {
    try {
      const pedidoRef = doc(this.firestore, 'pedidos', pedidoId);
      await updateDoc(pedidoRef, { status: novoStatus });
      console.log('✅ Pedido atualizado para:', novoStatus);
    } catch (error) {
      console.error('❌ Erro ao atualizar pedido:', error);
      throw error;
    }
  }

  // Atualizar motoboy responsável
  async atribuirMotoboy(pedidoId: string, motoboyId: string): Promise<void> {
    try {
      const pedidoRef = doc(this.firestore, 'pedidos', pedidoId);
      await updateDoc(pedidoRef, { motoboyId });
      console.log('✅ Motoboy atribuído ao pedido');
    } catch (error) {
      console.error('❌ Erro ao atribuir motoboy:', error);
      throw error;
    }
  }

  // TODO: este listener mantém a tela do restaurante sincronizada em tempo real com as mudanças do pedido.
  escutarPedidosRestaurante(restauranteId: string, callback: (pedidos: Pedido[]) => void) {
    const q = query(
      collection(this.firestore, 'pedidos'),
      where('restauranteId', '==', restauranteId),
    );
    return onSnapshot(q, (snapshot) => {
      const pedidos = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Pedido[];
      callback(pedidos);
    });
  }

  // Listen em tempo real para pedidos prontos (disponíveis para qualquer motoboy aceitar)
  escutarPedidosProntos(callback: (pedidos: Pedido[]) => void) {
    const q = query(collection(this.firestore, 'pedidos'), where('status', '==', 'Pronto'));
    return onSnapshot(q, (snapshot) => {
      const pedidos = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Pedido[];
      callback(pedidos);
    });
  }

  // Listen em tempo real para os pedidos atribuídos a UM motoboy (em rota + histórico)
  escutarPedidosDoMotoboy(motoboyId: string, callback: (pedidos: Pedido[]) => void) {
    const q = query(collection(this.firestore, 'pedidos'), where('motoboyId', '==', motoboyId));
    return onSnapshot(q, (snapshot) => {
      const pedidos = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Pedido[];
      callback(pedidos);
    });
  }

  // Escuta em tempo real TODOS os pedidos da plataforma. Usado no painel do
  // dono para agregar faturamento, gráficos e indicadores de todos os
  // restaurantes conforme os pedidos vão sendo concluídos.
  escutarTodosPedidos(callback: (pedidos: Pedido[]) => void) {
    return onSnapshot(collection(this.firestore, 'pedidos'), (snapshot) => {
      const pedidos = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Pedido[];
      callback(pedidos);
    });
  }

  // Escutar um pedido específico em tempo real
  escutarPedido(pedidoId: string, callback: (pedido: Pedido | null) => void) {
    const pedidoRef = doc(this.firestore, 'pedidos', pedidoId);
    return onSnapshot(pedidoRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ ...snapshot.data(), id: snapshot.id } as Pedido);
      } else {
        callback(null);
      }
    });
  }
}
