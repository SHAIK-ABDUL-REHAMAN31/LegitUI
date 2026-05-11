import React from 'react';
import FloatingInput from './FloatingInput';
export default function FloatingInputUsage() {
    return (<div className="flex items-center justify-center w-full h-full min-h-[400px] p-8">
      <div className="w-full max-w-sm space-y-6 bg-zinc-950/50 p-8 rounded-2xl border border-zinc-800/50">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">Sign In</h3>
          <p className="text-zinc-400 text-sm">Enter your details to access your account</p>
        </div>
        <FloatingInput label="Email Address" type="email"/>
        <FloatingInput label="Password" type="password"/>
        <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors mt-4">
          Continue
        </button>
      </div>
    </div>);
}
