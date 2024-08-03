// components/Hamburger.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase'; // Import supabase

const HamburgerMenu = ({ setMenuOpen, menuOpen }) => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleProfile = () => {
    router.push('/profile'); // Navigate to the profile page
  };

  return (
    <div className="absolute top-4 left-4 z-20">
      <button onClick={() => setMenuOpen(!menuOpen)} className="btn btn-primary">
        &#9776; {/* Hamburger icon */}
      </button>
      {menuOpen && (
        <>
          {/* Background overlay for closing the menu */}
          <div
            className="fixed inset-0 bg-black opacity-50 z-20 md:hidden" // Only show on mobile
            onClick={() => setMenuOpen(false)} // Close on background click
          ></div>

          {/* Menu panel */}
          <div className={`fixed inset-0 bg-gray-800 bg-opacity-70 backdrop-blur-lg border border-gray-600 rounded-lg z-30 transition-transform transform md:left-0 md:top-0 md:h-full md:w-64 ${menuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="flex flex-col items-center justify-center h-full">
              <button onClick={handleProfile} className="btn btn-primary w-3/4 mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                Profile
              </button>
              <button onClick={handleLogout} className="btn btn-secondary w-3/4 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                  />
                </svg>
                Logout
              </button>
              {/* Close button moved below the logout button */}
              <button
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-3/4 mt-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-8 h-8 text-white" // Made the icon bigger
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HamburgerMenu;
