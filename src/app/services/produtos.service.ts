import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { app } from '../firebase.config';

export interface Produto {
  id?: string;
  restauranteId: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  disponivel: boolean;
  emAlta: boolean;
  acompanhamentosPossiveis?: Array<{ nome: string; preco: number }>;
}

@Injectable({
  providedIn: 'root',
})
export class ProdutosService {
  private firestore = getFirestore(app);

  // TODO: este método salva um novo produto vinculado ao restaurante dono do cardápio.
  async criarProduto(restauranteId: string, produto: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.firestore, 'produtos'), {
        ...produto,
        restauranteId,
        dataCriacao: new Date(),
      });
      console.log('✅ Produto criado:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar produto:', error);
      throw error;
    }
  }

  // TODO: esta leitura carrega o cardápio do restaurante uma vez para montar a tela de produtos.
  async obterProdutosRestaurante(restauranteId: string): Promise<Produto[]> {
    try {
      const q = query(
        collection(this.firestore, 'produtos'),
        where('restauranteId', '==', restauranteId),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Produto[];
    } catch (error) {
      console.error('❌ Erro ao obter produtos:', error);
      return [];
    }
  }

  // TODO: este listener atualiza a lista de produtos automaticamente quando houver alteração no banco.
  escutarProdutosRestaurante(restauranteId: string, callback: (produtos: Produto[]) => void) {
    const q = query(
      collection(this.firestore, 'produtos'),
      where('restauranteId', '==', restauranteId),
    );
    return onSnapshot(q, (snapshot) => {
      const produtos = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Produto[];
      callback(produtos);
    });
  }

  // Atualizar produto
  async atualizarProduto(produtoId: string, dados: any): Promise<void> {
    try {
      const produtoRef = doc(this.firestore, 'produtos', produtoId);
      await updateDoc(produtoRef, dados);
      console.log('✅ Produto atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error);
      throw error;
    }
  }

  // Deletar produto
  async deletarProduto(produtoId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, 'produtos', produtoId));
      console.log('✅ Produto deletado');
    } catch (error) {
      console.error('❌ Erro ao deletar produto:', error);
      throw error;
    }
  }
}
