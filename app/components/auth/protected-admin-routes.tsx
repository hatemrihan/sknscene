"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProtectedAdminRouteProps {
    children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        let mounted = true;

        const checkAuth = async () => {
            try {
                console.log('🔍 Checking admin authentication...');

                // Get token from sessionStorage
                const token = sessionStorage.getItem('adminToken');

                if (!token) {
                    console.log('❌ No token found, redirecting to login...');
                    if (mounted) {
                        setIsChecking(false);
                        router.push('/admin/login');
                    }
                    return;
                }

                console.log('✅ Token found, verifying with server...');

                // Verify token with server
                const response = await fetch('/api/admin/check-auth', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Cache-Control': 'no-cache'
                    },
                });

                console.log('📨 Auth check response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('📨 Auth check response data:', data);

                    if (mounted && data.authenticated) {
                        console.log('✅ Admin authenticated successfully');
                        setIsAuthenticated(true);
                        setIsChecking(false);
                    } else {
                        console.log('❌ Token invalid, redirecting to login...');
                        if (mounted) {
                            sessionStorage.removeItem('adminToken');
                            setIsChecking(false);
                            router.push('/admin/login');
                        }
                    }
                } else {
                    console.log('❌ Auth check failed, redirecting to login...');
                    if (mounted) {
                        sessionStorage.removeItem('adminToken');
                        setIsChecking(false);
                        router.push('/admin/login');
                    }
                }
            } catch (error) {
                console.error('❌ Auth check error:', error);
                if (mounted) {
                    sessionStorage.removeItem('adminToken');
                    setIsChecking(false);
                    router.push('/admin/login');
                }
            }
        };

        checkAuth();

        return () => {
            mounted = false;
        };
    }, [router]);

    if (isChecking) {
        return (
            <div className= "min-h-screen bg-black flex items-center justify-center" >
            <div className="text-center" >
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" > </div>
                    < p className = "text-white mt-4" > Verifying authentication...</p>
                        </div>
                        </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{ children } </>;
}