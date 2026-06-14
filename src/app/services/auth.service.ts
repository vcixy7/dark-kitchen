import { Injectable } from '@angular/core';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateEmail,
  verifyBeforeUpdateEmail,
  User,
} from 'firebase/auth';
import { app } from '../firebase.config';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth(app);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Cada ABA precisa de uma sessão independente, para permitir testar vários
  // perfis ao mesmo tempo (cliente, restaurante, dono, motoboy) no mesmo
  // navegador. browserSessionPersistence guarda a sessão no sessionStorage,
  // que NÃO é compartilhado entre abas (ao contrário do padrão local/IndexedDB,
  // que fazia uma aba nova herdar o login da outra).
  private persistenciaPronta: Promise<void>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.persistenciaPronta = setPersistence(this.auth, browserSessionPersistence).catch(
        (e) => console.error('Falha ao definir persistência por aba:', e),
      );
    } else {
      this.persistenciaPronta = Promise.resolve();
    }

    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
      if (isPlatformBrowser(this.platformId)) {
        // Cache por aba (sessionStorage), espelhando a persistência da sessão.
        if (user) {
          sessionStorage.setItem('user', JSON.stringify(user));
        } else {
          sessionStorage.removeItem('user');
        }
      }
    });
  }

  async signup(email: string, password: string): Promise<void> {
    await this.persistenciaPronta;
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then((result) => {
        console.log('Usuário criado:', result.user.uid);
      })
      .catch((error) => {
        console.error('Erro ao criar usuário:', error.code, error.message);
        throw error;
      });
  }

  async login(email: string, password: string): Promise<User> {
    await this.persistenciaPronta;
    return signInWithEmailAndPassword(this.auth, email, password)
      .then((result) => {
        console.log('Login bem-sucedido:', result.user.uid);
        return result.user;
      })
      .catch((error) => {
        console.error('Erro ao fazer login:', error.code, error.message);
        throw error;
      });
  }

  /**
   * TODO: documentar melhor a regra de contas por seção.
   * Cada SEÇÃO (cliente, motoboy, dono e restaurante) usa uma conta Firebase
   * independente, mesmo quando o usuário digita o mesmo email visível.
   * O email real ganha um sufixo +<secao> para evitar conflitos entre áreas.
   */
  aliasEmail(email: string, secao: string): string {
    const e = (email || '').trim().toLowerCase();
    const at = e.indexOf('@');
    if (at < 0) return e;
    const local = e.slice(0, at);
    const dominio = e.slice(at + 1);
    const base = local.split('+')[0]; // remove +sufixo anterior pra não acumular
    return `${base}+${secao}@${dominio}`;
  }

  // TODO: este método faz o login usando o email adaptado para a seção escolhida.
  loginSecao(email: string, password: string, secao: string): Promise<User> {
    return this.login(this.aliasEmail(email, secao), password);
  }

  // TODO: este método cria uma conta separada para a seção informada, sem misturar com outras áreas.
  signupSecao(email: string, password: string, secao: string): Promise<void> {
    return this.signup(this.aliasEmail(email, secao), password);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  /**
   * Altera o email da conta no Firebase Auth.
   * Retorna 'imediato' quando o email já foi trocado, ou 'verificacao'
   * quando o Firebase exige confirmar por um link enviado ao novo email.
   * Em ambos os casos, o login passará a usar o novo email.
   */
  async atualizarEmail(novoEmail: string): Promise<'imediato' | 'verificacao'> {
    const user = this.auth.currentUser;
    if (!user) {
      throw { code: 'auth/no-current-user', message: 'Nenhum usuário autenticado.' };
    }
    try {
      await updateEmail(user, novoEmail);
      return 'imediato';
    } catch (error: any) {
      // Projetos com "proteção de email" exigem verificação antes da troca
      if (error?.code === 'auth/operation-not-allowed') {
        await verifyBeforeUpdateEmail(user, novoEmail);
        return 'verificacao';
      }
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserSync(): User | null {
    return this.auth.currentUser;
  }

  async waitForCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const user = this.auth.currentUser;
      if (user) {
        resolve(user);
        return;
      }

      let resolved = false;
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        if (user && !resolved) {
          resolved = true;
          unsubscribe();
          resolve(user);
        }
      });

      // TODO: revisar se este timeout pode ser ajustado conforme a experiência de login.
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          unsubscribe();
          resolve(null);
        }
      }, 500);
    });
  }
}
