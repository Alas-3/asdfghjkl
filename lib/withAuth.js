import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from './supabase';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true); // Track loading state

    useEffect(() => {
      const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/login');
        }
        setLoading(false); // Set loading to false after check
      };
      checkAuth();
    }, [router]);

    // Show a loading indicator while checking authentication
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
