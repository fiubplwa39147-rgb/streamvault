import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { User } from "../types";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserPlan: (plan: "free" | "pro") => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setCurrentUser(userDoc.data() as User);
        } else {
          // If profile doesn't exist yet, create it
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
            role: "user",
            plan: "free",
            watchHistory: [],
            createdAt: Date.now(),
          };
          await setDoc(doc(db, "users", firebaseUser.uid), newUser);
          setCurrentUser(newUser);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: User = {
        uid: res.user.uid,
        email,
        displayName: name,
        role: email === "admin@streamvault.com" ? "admin" : "user", // First admin email
        plan: "free",
        watchHistory: [],
        createdAt: Date.now(),
      };
      await setDoc(doc(db, "users", res.user.uid), newUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserPlan = async (plan: "free" | "pro") => {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, { plan });
    setCurrentUser({ ...currentUser, plan });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAdmin: currentUser?.role === "admin",
        login,
        register,
        logout,
        updateUserPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
