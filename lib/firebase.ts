import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA0wTI-V94tFuNTqbcF386cgZvukxxw7wY",
  authDomain: "mediledger-nexus-294e8.firebaseapp.com",
  projectId: "mediledger-nexus-294e8",
  storageBucket: "mediledger-nexus-294e8.firebasestorage.app",
  messagingSenderId: "172736921156",
  appId: "1:172736921156:web:45fdd732f9687d191c4611"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
