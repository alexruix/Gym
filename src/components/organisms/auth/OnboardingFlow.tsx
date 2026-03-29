import { useState } from 'react';
import { actions } from 'astro:actions';
import { authCopy } from '../../../data/es/auth';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Loader2, ArrowRight, Building2, User } from 'lucide-react';

type Step = 1 | 2;

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>(1);
  const [nombre, setNombre] = useState('');
  const [gymName, setGymName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const copy = authCopy.onboarding;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (nombre.trim().length < 2) {
        setError("El nombre es muy corto.");
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gymName.trim().length < 2) {
      setError("Ingresá un nombre de gimnasio válido.");
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const result = await actions.auth.completeOnboarding({ nombre, gymName });
      
      if (result && !result.error) {
        // Redirigimos al dashboard porque ya guardó exitosamente en DB
        window.location.href = '/profesor/dashboard';
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
      
      {/* Barra de progreso superior */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-100">
        <div 
          className="h-full bg-lime-400 transition-all duration-500 ease-out" 
          style={{ width: step === 1 ? '50%' : '100%' }}
        />
      </div>

      <div className="text-center mb-10 mt-2">
        <h1 className="text-3xl font-black tracking-tighter text-zinc-950 mb-2">{copy.title}</h1>
        <p className="text-zinc-500 font-medium">{copy.subtitle}</p>
      </div>

      <div className="relative">
        <div className={`transition-all duration-500 ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full absolute top-0 w-full pointer-events-none'}`}>
          <form onSubmit={handleNext} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="nombre" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500">
                <User className="w-4 h-4 text-lime-500" />
                {copy.step1.label}
              </label>
              <Input
                id="nombre"
                type="text"
                autoFocus
                placeholder={copy.step1.placeholder}
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (error) setError('');
                }}
                className="h-16 rounded-2xl bg-zinc-50 border-zinc-200 focus-visible:ring-lime-400 text-lg px-5"
                disabled={loading}
              />
            </div>
            
            {error && <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}

            <Button 
              type="submit" 
              className="w-full h-16 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl font-black text-lg uppercase tracking-wider transition-all active:scale-95 group"
            >
              {copy.step1.btn}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </div>

        <div className={`transition-all duration-500 ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute top-0 w-full pointer-events-none'}`}>
          <form onSubmit={handleFinish} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="gymName" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500">
                <Building2 className="w-4 h-4 text-lime-500" />
                {copy.step2.label}
              </label>
              <Input
                id="gymName"
                type="text"
                autoFocus={step === 2}
                placeholder={copy.step2.placeholder}
                value={gymName}
                onChange={(e) => {
                  setGymName(e.target.value);
                  if (error) setError('');
                }}
                className="h-16 rounded-2xl bg-zinc-50 border-zinc-200 focus-visible:ring-lime-400 text-lg px-5"
                disabled={loading}
              />
            </div>

            {error && <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}

            <div className="flex gap-3">
              <Button 
                type="button"
                onClick={() => setStep(1)}
                variant="outline"
                className="h-16 px-6 bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 rounded-2xl font-black transition-all active:scale-95"
                disabled={loading}
              >
                Atrás
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 h-16 bg-lime-400 hover:bg-lime-300 text-zinc-950 rounded-2xl font-black text-sm md:text-base uppercase tracking-wider transition-all hover:shadow-xl hover:shadow-lime-400/20 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {copy.states.loading}
                  </>
                ) : (
                  copy.step2.btn
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
