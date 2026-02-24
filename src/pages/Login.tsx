import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import civicHero from '@/assets/civic-hero.png';

const Login = () => {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isSignup) {
      const ok = signup(username, email, password);
      if (ok) {
        toast.success('Account created successfully!');
      } else {
        toast.error('Email already exists');
      }
    } else {
      const ok = login(username, email, password);
      if (!ok) {
        toast.error('Invalid credentials');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, hsl(var(--primary-foreground)) 1px, transparent 1px), radial-gradient(circle at 80% 20%, hsl(var(--primary-foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        <div className="relative text-center text-primary-foreground z-10">
          <img src={civicHero} alt="Civic360" className="w-48 h-48 mx-auto mb-8 drop-shadow-2xl" />
          <h1 className="text-4xl font-bold tracking-tight mb-4">Civic360</h1>
          <p className="text-lg opacity-90 max-w-sm mx-auto leading-relaxed">
            Empowering citizens and governments with intelligent civic reporting and real-time governance analytics.
          </p>
          <div className="flex gap-6 mt-10 justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-sm opacity-75">Monitoring</p>
            </div>
            <div className="w-px bg-primary-foreground/20" />
            <div className="text-center">
              <p className="text-3xl font-bold">AI</p>
              <p className="text-sm opacity-75">Powered</p>
            </div>
            <div className="w-px bg-primary-foreground/20" />
            <div className="text-center">
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm opacity-75">Transparent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md fade-in">
          <div className="text-center mb-8 lg:hidden">
            <img src={civicHero} alt="Civic360" className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold tracking-tight">Civic360</h1>
            <p className="text-muted-foreground mt-1">Integrated Civic Intelligence Platform</p>
          </div>

          <div className="lg:block hidden mb-8">
            <h2 className="text-2xl font-bold">{isSignup ? 'Create your account' : 'Welcome back'}</h2>
            <p className="text-muted-foreground mt-1">{isSignup ? 'Join Civic360 to start reporting issues.' : 'Sign in to access your dashboard.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-base"
            >
              {isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-primary hover:underline"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {!isSignup && (
            <div className="mt-6 p-4 bg-muted rounded-xl text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Demo Admin Credentials:</p>
              <p>Username: Admin · Email: admin@gmail.com · Password: 123123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
