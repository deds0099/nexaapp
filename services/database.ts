import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  orderBy 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, SavedDiet, DietPlan, UserProfile } from '../types';

// Utilitário para converter User do Firebase para User do nosso App
const mapFirebaseUser = (fbUser: FirebaseUser): User => {
  return {
    id: fbUser.uid,
    name: fbUser.displayName || 'Usuário',
    email: fbUser.email || '',
  };
};

// --- AUTHENTICATION (Firebase Auth) ---

export const dbRegister = async (name: string, email: string, password: string): Promise<User> => {
  try {
    // 1. Cria o usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Atualiza o perfil com o Nome
    await updateProfile(user, {
      displayName: name
    });

    return mapFirebaseUser(user);
  } catch (error: any) {
    console.error("Erro no cadastro Firebase:", error);
    let errorMessage = 'Erro ao criar conta.';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Este e-mail já está em uso.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'E-mail inválido.';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'O login por E-mail/Senha não está ativado no Firebase Console.';
    } else {
      // Retorna o código do erro original se for desconhecido, para ajudar no debug
      errorMessage = `Erro ao criar conta: ${error.code || error.message}`;
    }
    
    throw new Error(errorMessage);
  }
};

export const dbLogin = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(userCredential.user);
  } catch (error: any) {
    console.error("Erro no login Firebase:", error);
    let errorMessage = 'Erro ao fazer login.';
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      errorMessage = 'E-mail ou senha incorretos.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Muitas tentativas falhas. Tente novamente mais tarde.';
    } else {
      errorMessage = `Erro ao fazer login: ${error.code || error.message}`;
    }

    throw new Error(errorMessage);
  }
};

export const dbLogout = async (): Promise<void> => {
  await auth.signOut();
};

// --- DATABASE (Firebase Firestore) ---

const DIETS_COLLECTION = 'diets';

export const dbSaveDiet = async (userId: string, plan: DietPlan, profileSnapshot: UserProfile): Promise<SavedDiet> => {
  try {
    const dietData = {
      userId,
      date: new Date().toISOString(),
      plan,
      profileSnapshot
    };

    const docRef = await addDoc(collection(db, DIETS_COLLECTION), dietData);

    return {
      id: docRef.id,
      ...dietData
    };
  } catch (error) {
    console.error("Erro ao salvar dieta:", error);
    throw new Error("Não foi possível salvar sua dieta no servidor.");
  }
};

export const dbGetDiets = async (userId: string): Promise<SavedDiet[]> => {
  try {
    // Busca dietas onde userId == userId logado
    const q = query(
      collection(db, DIETS_COLLECTION), 
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    const diets: SavedDiet[] = [];

    querySnapshot.forEach((doc) => {
      diets.push({
        id: doc.id,
        ...doc.data()
      } as SavedDiet);
    });

    // Ordenação no cliente (mais recente primeiro)
    return diets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    throw new Error("Erro ao carregar histórico de dietas.");
  }
};

export const dbDeleteDiet = async (dietId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, DIETS_COLLECTION, dietId));
  } catch (error) {
    console.error("Erro ao excluir dieta:", error);
    throw new Error("Erro ao excluir o plano.");
  }
};