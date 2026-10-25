"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;}) {
        
        const { user, loading } = useAuth();
        const router = useRouter();
        
        useEffect(() => {
            if (!loading && !user) {
                router.replace("/login");
            }
        }, [loading, user, router]);
        
        if (loading) {
            return ( <div className="flex min-h-screen items-center justify-center bg-gray-50"> <div className="text-sm text-gray-500">
                Loading AgeShield... </div> </div>
            );
        }
        
        if (!user) {
            return null;
        }
        
        return <>{children}</>;
}
