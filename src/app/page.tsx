"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Disc, User, Lock, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Ensure this path matches your file structure

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // --- SIGN UP LOGIC ---
        // 1. Check if username already exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("username")
          .eq("username", username)
          .single();

        if (existingUser) {
          alert("That username is already taken! Try another one.");
          setLoading(false);
          return;
        }

        // 2. Insert new user into your 'users' table
        const { error: signUpError } = await supabase
          .from("users")
          .insert([{ username, password }]);

        if (signUpError) throw signUpError;
        
        alert("Account created successfully!");
      } else {
        // --- SIGN IN LOGIC ---
        const { data: user, error: signInError } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single();

        if (signInError || !user || user.password !== password) {
          alert("Invalid username or password.");
          setLoading(false);
          return;
        }
      }

      // SUCCESS: Set a cookie (readable by middleware) and redirect
      document.cookie = `discovery_user=${username}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      router.push("/main");
      
    } catch (error: any) {
      console.error("Auth Error:", error.message);
      alert("Database error: Make sure RLS is disabled or configured correctly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <Disc className="w-16 h-16 text-primary animate-spin-slow" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white mt-4">
            Disc-Overy
          </h1>
          <p className="text-zinc-500 text-[10px] font-black tracking-[0.5em] uppercase mt-2">
            {isSignUp ? "Join the Vault" : "Access the Vault"}
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
            <input
              required
              type="text"
              placeholder="Username"
              value={username}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
            <input
              required
              type="password"
              placeholder="Password"
              value={password}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <Button 
            disabled={loading}
            type="submit"
            className="w-full bg-primary text-black font-black py-8 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all text-lg flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                {isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="text-center">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest hover:text-primary transition-colors"
          >
            {isSignUp ? "Already a member? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}