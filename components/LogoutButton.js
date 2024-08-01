// components/LogoutButton.js
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <button className="btn btn-secondary" onClick={handleLogout}>
      Logout
    </button>
  );
}
