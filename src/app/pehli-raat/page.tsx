'use client'

import DashboardHeader from '@/components/DashboardHeader';
import Footer from '@/components/Footer';
import PehliRaatContent from '@/components/PehliRaatContent'
import { Button } from '@/components/ui/button';
import useCurrentUser from '@/lib/hooks/useCurrentUser';

export default function PehliRaat() {

    const { user: currentUser, isLoading: loading, error, showAccessDenied, countdown, refetch: refetchUser } = useCurrentUser();
    if (showAccessDenied) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-8">
                    <div className="text-red-600 text-xl font-semibold mb-4">
                        Access Unavailable
                    </div>
                    <div className="text-red-700 mb-6">
                        Only mumineen with raza to Colombo Relay Center can access this page.
                    </div>
                    <div className="text-red-600 font-medium">
                        Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                    </div>
                </div>
                <div className="mt-8">
                    <Button onClick={() => refetchUser()}>
                        Refresh
                    </Button>
                </div>
            </div>
        );
    }
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">Loading your dashboard...</p>
                    <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your information</p>
                </div>
            </div>
        );
    }
    if (error) {
        return <div className="text-center py-10 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="flex flex-col min-h-screen text-foreground">
            {currentUser && <DashboardHeader user={currentUser} />}
            <main className="flex-1 container mx-auto px-4 py-8">
                {/* <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} /> */}
                <div className="mt-8">
                    <PehliRaatContent currentUser={currentUser} />
                </div>
            </main>
            <Footer />
        </div>
    )
}
