import { useState } from 'react';
import { Plus, Trash2, TrendingUp, Clock, Target, Smile } from 'lucide-react';

interface Criteria {
  importance: number;
  urgency: number;
  longTerm: number;
  enjoyment: number;
}

interface Option {
  id: string;
  name: string;
  criteria: Criteria;
}

interface Result {
  id: string;
  name: string;
  score: number;
  breakdown: {
    importance: number;
    urgency: number;
    longTerm: number;
    enjoyment: number;
  };
}

function App() {
  const [options, setOptions] = useState<Option[]>([
    {
      id: '1',
      name: '',
      criteria: { importance: 3, urgency: 3, longTerm: 3, enjoyment: 3 },
    },
    {
      id: '2',
      name: '',
      criteria: { importance: 3, urgency: 3, longTerm: 3, enjoyment: 3 },
    },
  ]);
  const [results, setResults] = useState<Result[] | null>(null);

  const addOption = () => {
    if (options.length < 4) {
      setOptions([
        ...options,
        {
          id: Date.now().toString(),
          name: '',
          criteria: { importance: 3, urgency: 3, longTerm: 3, enjoyment: 3 },
        },
      ]);
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== id));
      setResults(null);
    }
  };

  const updateOptionName = (id: string, name: string) => {
    setOptions(
      options.map((opt) => (opt.id === id ? { ...opt, name } : opt))
    );
    setResults(null);
  };

  const updateCriteria = (
    id: string,
    criterion: keyof Criteria,
    value: number
  ) => {
    setOptions(
      options.map((opt) =>
        opt.id === id
          ? { ...opt, criteria: { ...opt.criteria, [criterion]: value } }
          : opt
      )
    );
    setResults(null);
  };

  const calculateScores = () => {
    const validOptions = options.filter((opt) => opt.name.trim() !== '');

    if (validOptions.length < 2) {
      alert('Please enter at least 2 options with names');
      return;
    }

    const calculated: Result[] = validOptions.map((opt) => {
      const breakdown = {
        importance: opt.criteria.importance * 2,
        urgency: opt.criteria.urgency * 1.5,
        longTerm: opt.criteria.longTerm * 2,
        enjoyment: opt.criteria.enjoyment * 1,
      };

      const score =
        breakdown.importance +
        breakdown.urgency +
        breakdown.longTerm +
        breakdown.enjoyment;

      return {
        id: opt.id,
        name: opt.name,
        score,
        breakdown,
      };
    });

    calculated.sort((a, b) => b.score - a.score);
    setResults(calculated);
  };

  const maxScore = results ? Math.max(...results.map((r) => r.score)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/10 hover:border-white/20 transition-colors">
            <Target className="w-7 h-7 text-white/90" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Decision Helper
          </h1>
          <p className="text-base text-white/60 max-w-2xl mx-auto leading-relaxed">
            Make logical decisions by evaluating your options based on importance,
            urgency, long-term value, and enjoyment
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8 hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              Your Options
            </h2>
            {options.length < 4 && (
              <button
                onClick={addOption}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/90 rounded-lg transition-all duration-300 font-medium border border-white/10 hover:border-white/20"
              >
                <Plus className="w-4 h-4" />
                Add Option
              </button>
            )}
          </div>

          <div className="space-y-8">
            {options.map((option, index) => (
              <div key={option.id} className="border-b border-white/10 pb-8 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex-shrink-0 w-8 h-8 bg-white/10 text-white/90 rounded-lg flex items-center justify-center font-semibold border border-white/10">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={option.name}
                    onChange={(e) => updateOptionName(option.id, e.target.value)}
                    placeholder={`Option ${index + 1} name`}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent text-white placeholder-white/40 transition-all duration-300 hover:border-white/20"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(option.id)}
                      className="flex-shrink-0 p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300 border border-transparent hover:border-red-400/20"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pl-11">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-emerald-400/80" />
                      <label className="text-sm font-medium text-white/80">
                        Importance
                      </label>
                      <span className="ml-auto text-sm font-semibold text-white/90">
                        {option.criteria.importance}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={option.criteria.importance}
                      onChange={(e) =>
                        updateCriteria(
                          option.id,
                          'importance',
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-emerald hover:bg-white/20 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-orange-400/80" />
                      <label className="text-sm font-medium text-white/80">
                        Urgency
                      </label>
                      <span className="ml-auto text-sm font-semibold text-white/90">
                        {option.criteria.urgency}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={option.criteria.urgency}
                      onChange={(e) =>
                        updateCriteria(
                          option.id,
                          'urgency',
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-orange hover:bg-white/20 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-blue-400/80" />
                      <label className="text-sm font-medium text-white/80">
                        Long-term Value
                      </label>
                      <span className="ml-auto text-sm font-semibold text-white/90">
                        {option.criteria.longTerm}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={option.criteria.longTerm}
                      onChange={(e) =>
                        updateCriteria(
                          option.id,
                          'longTerm',
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-blue hover:bg-white/20 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Smile className="w-4 h-4 text-amber-400/80" />
                      <label className="text-sm font-medium text-white/80">
                        Enjoyment
                      </label>
                      <span className="ml-auto text-sm font-semibold text-white/90">
                        {option.criteria.enjoyment}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={option.criteria.enjoyment}
                      onChange={(e) =>
                        updateCriteria(
                          option.id,
                          'enjoyment',
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-amber hover:bg-white/20 transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={calculateScores}
            className="w-full mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg shadow-black/20 backdrop-blur-sm"
          >
            Evaluate Decision
          </button>
        </div>

        {results && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-colors">
            <h2 className="text-2xl font-bold text-white mb-2">
              Recommendation
            </h2>
            <p className="text-white/60 mb-8 text-sm">
              Based on your evaluation criteria, here are your options ranked by score
            </p>

            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`p-6 rounded-xl border transition-all duration-300 ${
                    index === 0
                      ? 'bg-white/10 border-white/30 shadow-lg shadow-white/10'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        {index === 0 && (
                          <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full border border-white/30">
                            RECOMMENDED
                          </span>
                        )}
                        <h3 className="text-lg font-semibold text-white">
                          {result.name}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">
                        {result.score.toFixed(1)}
                      </div>
                      <div className="text-xs text-white/50">total score</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-white/60' : 'bg-white/30'
                        }`}
                        style={{ width: `${(result.score / maxScore) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-white/60">Importance (×2)</span>
                      <span className="font-semibold text-white/90">
                        {result.breakdown.importance.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-white/60">Urgency (×1.5)</span>
                      <span className="font-semibold text-white/90">
                        {result.breakdown.urgency.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-white/60">Long-term (×2)</span>
                      <span className="font-semibold text-white/90">
                        {result.breakdown.longTerm.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-white/60">Enjoyment (×1)</span>
                      <span className="font-semibold text-white/90">
                        {result.breakdown.enjoyment.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="text-center py-8 text-white/50 text-sm border-t border-white/10">
        <p className="text-base">Built with ♥ by Jagrat Ahuja</p>
        <p className="text-base">© 2026 All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
