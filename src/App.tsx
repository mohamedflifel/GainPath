import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Dumbbell, 
  ChevronRight, 
  Loader2, 
  Calendar, 
  Target, 
  User, 
  Zap, 
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface WorkoutDay {
  day: string;
  title: string;
  exercises: {
    name: string;
    sets: string;
    reps: string;
    rest: string;
    notes: string;
  }[];
}

interface FitnessProgram {
  programTitle: string;
  summary: string;
  days: WorkoutDay[];
}

export default function App() {
  const [step, setStep] = useState<'home' | 'form' | 'result'>('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [program, setProgram] = useState<FitnessProgram | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    level: 'Débutant',
    goal: 'Remise en forme',
    availability: '3',
    equipment: 'aucun'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateProgram = async () => {
    setLoading(true);
    setError(null);
    try {
      const prompt = `
        Génère un programme d'entraînement de fitness personnalisé pour ${formData.firstName}.
        Détails de l'utilisateur :
        - Niveau : ${formData.level}
        - Objectif : ${formData.goal}
        - Disponibilité : ${formData.availability} jours par semaine
        - Équipement disponible : ${formData.equipment}

        Le programme doit être complet, sécurisé et adapté au niveau spécifié.
        Inclus des exercices précis, le nombre de séries (sets), de répétitions (reps), le temps de repos et des conseils spécifiques.
        Réponds en français.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              programTitle: { type: Type.STRING },
              summary: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING },
                    title: { type: Type.STRING },
                    exercises: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          sets: { type: Type.STRING },
                          reps: { type: Type.STRING },
                          rest: { type: Type.STRING },
                          notes: { type: Type.STRING },
                        },
                        required: ["name", "sets", "reps"]
                      }
                    }
                  },
                  required: ["day", "title", "exercises"]
                }
              }
            },
            required: ["programTitle", "summary", "days"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setProgram(result);
      setStep('result');
    } catch (err) {
      console.error("Erreur:", err);
      setError("Désolé, une erreur est survenue lors de la génération de votre programme. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setStep('home')}>
            <div className="bg-red-600 p-2 rounded-lg transform group-hover:rotate-12 transition-transform">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">
              Gain<span className="text-red-600">Path</span>
            </h1>
          </div>
          {step !== 'home' && (
            <button 
              onClick={() => setStep('home')}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Accueil
            </button>
          )}
        </header>

        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight uppercase italic">
                Dépasse tes <br />
                <span className="text-red-600">Limites</span>
              </h2>
              <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
                Obtenez un programme d'entraînement sur mesure généré par l'IA, adapté à votre niveau, vos objectifs et votre équipement.
              </p>
              <button
                onClick={() => setStep('form')}
                className="group relative inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              >
                Commencer mon voyage
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Profil Fitness</h2>
                <p className="text-zinc-400">Dites-nous en plus sur vous pour personnaliser votre plan.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                    <User className="w-4 h-4" /> Prénom
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Ex: Marc"
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Niveau
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all appearance-none"
                  >
                    <option>Débutant</option>
                    <option>Intermédiaire</option>
                    <option>Avancé</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Objectif
                  </label>
                  <select
                    name="goal"
                    value={formData.goal}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all appearance-none"
                  >
                    <option>Perte de poids</option>
                    <option>Prise de masse</option>
                    <option>Cardio</option>
                    <option>Flexibilité</option>
                    <option>Remise en forme</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Disponibilité (jours/sem)
                  </label>
                  <input
                    type="number"
                    name="availability"
                    min="1"
                    max="7"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" /> Équipement
                  </label>
                  <select
                    name="equipment"
                    value={formData.equipment}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all appearance-none"
                  >
                    <option value="aucun">Aucun (Poids du corps)</option>
                    <option value="haltères">Haltères uniquement</option>
                    <option value="salle de sport complète">Salle de sport complète</option>
                  </select>
                </div>
              </div>

              <button
                onClick={generateProgram}
                disabled={loading || !formData.firstName}
                className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  "Générer mon programme"
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {step === 'result' && program && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-10"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-red-600/10 text-red-600 px-4 py-1 rounded-full text-sm font-bold mb-4">
                  <CheckCircle2 className="w-4 h-4" /> Programme Prêt
                </div>
                <h2 className="text-4xl font-black uppercase italic mb-4">{program.programTitle}</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">{program.summary}</p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {program.days.map((day, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden"
                  >
                    <div className="bg-zinc-800/50 px-8 py-4 border-bottom border-zinc-800 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-red-600 uppercase italic">{day.day}</h3>
                      <span className="text-sm font-medium text-zinc-400">{day.title}</span>
                    </div>
                    <div className="p-8">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                              <th className="pb-4 font-semibold">Exercice</th>
                              <th className="pb-4 font-semibold">Séries</th>
                              <th className="pb-4 font-semibold">Reps</th>
                              <th className="pb-4 font-semibold">Repos</th>
                              <th className="pb-4 font-semibold">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800/50">
                            {day.exercises.map((ex, eIdx) => (
                              <tr key={eIdx} className="group hover:bg-white/5 transition-colors">
                                <td className="py-4 font-bold text-white pr-4">{ex.name}</td>
                                <td className="py-4 text-zinc-400">{ex.sets}</td>
                                <td className="py-4 text-zinc-400">{ex.reps}</td>
                                <td className="py-4 text-zinc-400">{ex.rest}</td>
                                <td className="py-4 text-zinc-500 text-sm italic">{ex.notes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-4 pt-10">
                <button
                  onClick={() => setStep('form')}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Générer un autre programme
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 py-10 text-center border-t border-zinc-900 mt-20">
        <p className="text-zinc-600 text-sm">
          &copy; {new Date().getFullYear()} GainPath.
        </p>
      </footer>
    </div>
  );
}
