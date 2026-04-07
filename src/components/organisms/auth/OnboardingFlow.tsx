import { useState } from 'react';
import { actions } from 'astro:actions';
import { authCopy } from '../../../data/es/auth';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Loader2, ArrowRight, Building2, User } from 'lucide-react';

type Step = 1 | 2;

export function OnboardingFlow() {
  const [publicName, setPublicName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const copy = authCopy.onboarding;

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (publicName.trim().length < 2) {
      setError("El nombre es muy corto.");
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await actions.auth.completeOnboarding({ publicName });

      if (result && !result.error) {
        window.location.href = '/profesor/';
      } else {
        setError(result?.error?.message || copy.states.error);
        setLoading(false);
      }
    } catch (err) {
      setError(copy.states.error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-zinc-950/10 border border-zinc-100 animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">

      {/* Barra de progreso decorativa */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-lime-500" />

      <div className="text-center mb-10 mt-2">
        <h1 className="text-3xl font-bold tracking-tighter text-zinc-950 mb-2">{copy.title}</h1>
        <p className="text-zinc-500 font-medium">{copy.subtitle}</p>
      </div>

      <div className="relative">
        <form onSubmit={handleFinish} className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="publicName" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
              <User className="w-4 h-4 text-lime-500" />
              {copy.step1.label}
            </label>
            <Input
              id="publicName"
              type="text"
              autoFocus
              placeholder={copy.step1.placeholder}
              value={publicName}
              onChange={(e) => {
                setPublicName(e.target.value);
                if (error) setError('');
              }}
              className="h-16 rounded-2xl bg-zinc-50 border-zinc-200 focus-visible:ring-lime-400 text-lg px-5"
              disabled={loading}
            />
            <p className="text-xs text-zinc-400 font-medium ml-1">
              {copy.step1.description}
            </p>
          </div>

          {error && <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl font-bold text-lg uppercase tracking-wider transition-all active:scale-95 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {copy.states.loading}
              </>
            ) : (
              <>
                {copy.step1.btn}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
