import React from 'react';
import { ShieldAlert } from 'lucide-react';

const UserNotRegisteredError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full p-8 border border-white/10 rounded-3xl shadow-2xl" style={{ background: "hsl(248,20%,15%)" }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-amber-500/15 border border-amber-500/20">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Access Restricted</h1>
          <p className="text-white/50 text-sm mb-8">
            You are not registered to use this application. Please contact the app administrator to request access.
          </p>
          <div className="p-4 rounded-xl bg-white/5 border border-white/8 text-sm text-white/40">
            <p className="text-white/50 font-medium mb-2">If you believe this is an error:</p>
            <ul className="space-y-1.5 text-left">
              <li className="flex items-start gap-2">
                <span className="text-white/25 mt-1">•</span>
                <span>Verify you are logged in with the correct account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/25 mt-1">•</span>
                <span>Contact the app administrator for access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/25 mt-1">•</span>
                <span>Try logging out and back in again</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;