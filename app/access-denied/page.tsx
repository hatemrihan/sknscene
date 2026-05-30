"use client";

import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-lg border-0">
                    <CardHeader className="text-center pb-8">
                        <CardTitle className="text-3xl font-bold text-red-600 mb-2">
                            ACCESS DENIED
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-sm leading-relaxed">
                            You do not have permission to access the admin dashboard.
                            Only authorized personnel with approved email addresses can proceed.
                        </CardDescription>
                        <CardDescription className="text-gray-500 text-xs mt-2">
                            If you believe this is an error, please contact the system administrator.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pb-6">
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    Your email address is not authorized for admin access.
                                </p>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="text-center pt-0 pb-8">
                        <div className="w-full space-y-3">
                            <Button
                                onClick={() => router.push("/")}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                            >
                                Return to Main Site
                            </Button>
                            <Button
                                onClick={() => router.push("/admin/login")}
                                variant="outline"
                                className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                            >
                                Try Different Account
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

