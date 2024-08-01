// lib/withAuth.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from './supabase';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        const user = supabase.auth.user();
        if (!user) {
          router.replace('/login');
        }
      };
      checkAuth();
    }, [router]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
