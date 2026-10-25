"use client";

import {
createContext,
useContext,
useEffect,
useState,
} from "react";

import {
getCurrentUser,
logout as apiLogout,
User,
} from "@/lib/api";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
    children,
    }: {
    children: React.ReactNode;}) {
        const [user, setUser] = useState<User | null>(null);
        const [loading, setLoading] = useState(true);
        
        async function refreshUser() {
            try {
                setLoading(true);
                
                const currentUser = await getCurrentUser();
                
                setUser(currentUser);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        
        }
        
        async function logout() {
            try {
                await apiLogout();
            } finally {
                setUser(null);
            }
        }
        
        useEffect(() => {
            refreshUser();
        }, []);
        
        return (
        <AuthContext.Provider
        value={{
            user,
            loading,
            refreshUser,
            logout,
        }}
        >
            
            {children}
        </AuthContext.Provider>
        
    );

}

export function useAuth() {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
