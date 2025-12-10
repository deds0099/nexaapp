import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// CONFIGURAÇÃO DO FIREBASE
// Copie estas informações do seu Console do Firebase:
// Configurações do Projeto -> Geral -> Seus aplicativos -> SDK setup
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAYDSnTCZ_20Tvzv3azvNsjM5FAy5z8uBg",
  authDomain: "nexaapp-85ec0.firebaseapp.com",
  projectId: "nexaapp-85ec0",
  storageBucket: "nexaapp-85ec0.firebasestorage.app",
  messagingSenderId: "932729319472",
  appId: "1:932729319472:web:4c57846b7b57784210fdf5"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços de Autenticação e Banco de Dados
export const auth = getAuth(app);
export const db = getFirestore(app);