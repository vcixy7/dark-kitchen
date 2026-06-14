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

export interface Cupom {
  id?: string;
  restauranteId: string;
  codigo: string;
  desconto: number; // percentual ou valor fixo
  tipo: 'percentual' | 'fixo'; // percentual = %, fixo = R$
  descricao: string;
  dataExpiracao: Date;
  ativo: boolean;
  minimo?: number; // valor mínimo para usar cupom
}

@Injectable({
  providedIn: 'root',
})
export class CuponsService {
  private firestore = getFirestore(app);

  // TODO: este método cria um cupom associado ao restaurante e já registra a data de criação.
  async criarCupom(restauranteId: string, cupom: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.firestore, 'cupons'), {
        ...cupom,
        restauranteId,
        dataCriacao: new Date(),
      });
      console.log('✅ Cupom criado:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar cupom:', error);
      throw error;
    }
  }

  // TODO: esta leitura busca os cupons de um restaurante para exibir no painel de gestão.
  async obterCuponsRestaurante(restauranteId: string): Promise<Cupom[]> {
    try {
      const q = query(
        collection(this.firestore, 'cupons'),
        where('restauranteId', '==', restauranteId),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Cupom);
    } catch (error) {
      console.error('❌ Erro ao obter cupons:', error);
      return [];
    }
  }

  // TODO: este listener mantém a lista de cupons atualizada em tempo real sem recarregar a tela.
  escutarCuponsRestaurante(restauranteId: string, callback: (cupons: Cupom[]) => void) {
    const q = query(
      collection(this.firestore, 'cupons'),
      where('restauranteId', '==', restauranteId),
    );
    return onSnapshot(q, (snapshot) => {
      const cupons = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Cupom);
      callback(cupons);
    });
  }

  // Validar cupom
  async validarCupom(
    codigo: string,
    restauranteId: string,
    valorPedido: number,
  ): Promise<{ valido: boolean; desconto: number; mensagem: string }> {
    try {
      const q = query(
        collection(this.firestore, 'cupons'),
        where('restauranteId', '==', restauranteId),
        where('codigo', '==', codigo.toUpperCase()),
        where('ativo', '==', true),
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { valido: false, desconto: 0, mensagem: 'Cupom inválido' };
      }

      const cupom = snapshot.docs[0].data() as Cupom;

      // Verificar data expiração
      if (new Date(cupom.dataExpiracao) < new Date()) {
        return { valido: false, desconto: 0, mensagem: 'Cupom expirado' };
      }

      // Verificar valor mínimo
      if (cupom.minimo && valorPedido < cupom.minimo) {
        return {
          valido: false,
          desconto: 0,
          mensagem: `Valor mínimo de R$ ${cupom.minimo.toFixed(2)}`,
        };
      }

      let desconto = 0;
      if (cupom.tipo === 'percentual') {
        desconto = (valorPedido * cupom.desconto) / 100;
      } else {
        desconto = cupom.desconto;
      }

      return { valido: true, desconto, mensagem: 'Cupom aplicado com sucesso!' };
    } catch (error) {
      console.error('❌ Erro ao validar cupom:', error);
      return { valido: false, desconto: 0, mensagem: 'Erro ao validar cupom' };
    }
  }

  // Atualizar cupom
  async atualizarCupom(cupomId: string, dados: any): Promise<void> {
    try {
      const cupomRef = doc(this.firestore, 'cupons', cupomId);
      await updateDoc(cupomRef, dados);
      console.log('✅ Cupom atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar cupom:', error);
      throw error;
    }
  }

  // Deletar cupom
  async deletarCupom(cupomId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, 'cupons', cupomId));
      console.log('✅ Cupom deletado');
    } catch (error) {
      console.error('❌ Erro ao deletar cupom:', error);
      throw error;
    }
  }
}
