import { useEffect, useState } from 'react';
import { Plus, Trash2, TrendingUp, Clock, Scale, Smile, Star, Trophy, Medal, Award } from 'lucide-react';

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

const OPTION_NAME_MAX_LENGTH = 24;
const OPTIONS_STORAGE_KEY = 'decision-maker-options';

const clampScore = (value: number) => {
  if (!Number.isFinite(value)) {
    return 3;
  }

  return Math.min(5, Math.max(1, value));
};

function App() {
  const [options, setOptions] = useState<Option[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(OPTIONS_STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as Option[];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((item) => item && typeof item === 'object')
        .map((item, index) => ({
          id: typeof item.id === 'string' && item.id.length > 0 ? item.id : `${Date.now()}-${index}`,
          name: typeof item.name === 'string' ? item.name.slice(0, OPTION_NAME_MAX_LENGTH) : '',
          criteria: {
            importance: clampScore(Number(item.criteria?.importance ?? 3)),
            urgency: clampScore(Number(item.criteria?.urgency ?? 3)),
            longTerm: clampScore(Number(item.criteria?.longTerm ?? 3)),
            enjoyment: clampScore(Number(item.criteria?.enjoyment ?? 3)),
          },
        }))
        .slice(0, 4);
    } catch {
      return [];
    }
  });
  const [results, setResults] = useState<Result[] | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(options));
  }, [options]);

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
    if (options.length > 0) {
      setOptions(options.filter((opt) => opt.id !== id));
      setResults(null);
    }
  };

  const updateOptionName = (id: string, name: string) => {
    const limitedName = name.slice(0, OPTION_NAME_MAX_LENGTH);
    setOptions(
      options.map((opt) => (opt.id === id ? { ...opt, name: limitedName } : opt))
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

    const normalizedNames = validOptions.map((opt) => opt.name.trim().toLowerCase());
    if (new Set(normalizedNames).size !== normalizedNames.length) {
      setResults(null);
      alert('Two or more of your options have the same option name');
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
  const topRecommended = results
    ? results.filter((result) => Math.abs(result.score - maxScore) < 1e-9)
    : [];
  const hasTopScoreTie = topRecommended.length > 1;
  const optionCount = options.length;
  const namedOptionCount = options.filter((opt) => opt.name.trim() !== '').length;
  const canAddOption = options.length < 4;
  const canRunDecision = namedOptionCount >= 2;
  const showHero = options.length === 0;

  const getOptionPlacementClass = (count: number, index: number) => {
    if (count === 1) {
      return 'option-card-pos-1';
    }

    if (count === 2) {
      return index === 0 ? 'option-card-pos-2-left' : 'option-card-pos-2-right';
    }

    if (count === 3) {
      if (index === 0) return 'option-card-pos-3-left';
      if (index === 1) return 'option-card-pos-3-center';
      return 'option-card-pos-3-right';
    }

    return `option-card-pos-4-${index + 1}`;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return {
        label: '#1',
        className: 'rank-badge rank-badge-gold',
        icon: <Trophy className="w-3.5 h-3.5" aria-hidden="true" />,
      };
    }

    if (index === 1) {
      return {
        label: '#2',
        className: 'rank-badge rank-badge-silver',
        icon: <Medal className="w-3.5 h-3.5" aria-hidden="true" />,
      };
    }

    if (index === 2) {
      return {
        label: '#3',
        className: 'rank-badge rank-badge-bronze',
        icon: <Award className="w-3.5 h-3.5" aria-hidden="true" />,
      };
    }

    return {
      label: `#${index + 1}`,
      className: 'rank-badge rank-badge-neutral',
      icon: null,
    };
  };

  const resetToHome = () => {
    setOptions([]);
    setResults(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(OPTIONS_STORAGE_KEY);
    }
  };

  return (
    <div className="app-shell">
      <div className="ambient-orb orb-blue" />
      <div className="ambient-orb orb-violet" />
      <div className="ambient-orb orb-cyan" />

      <div className="app-layout">
        <header className="top-header fade-up" aria-label="Primary navigation">
          <a
            href="/"
            className="brand-link"
            aria-label="Go to Decision Maker home"
            onClick={(e) => {
              e.preventDefault();
              resetToHome();
            }}
          >
          <div className="header-left-cluster">
            <div className="brand-mark-tile" aria-hidden="true">
              <Scale className="brand-mark-icon" />
            </div>
            <div className="brand-text-stack">
              <p className="brand-title">Decision Maker</p>
            </div>
          </div>
          </a>

          <div className="header-right-cluster">
            <p className="header-metadata">{optionCount} / 4 options</p>
            <button
              onClick={addOption}
              className="btn-secondary"
              type="button"
              disabled={!canAddOption}
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          </div>
        </header>

        {showHero && (
          <section className="hero-panel fade-up delay-1" aria-label="Empty state">
            <div className="hero-atmosphere hero-atmosphere-a" aria-hidden="true" />
            <div className="hero-atmosphere hero-atmosphere-b" aria-hidden="true" />

            <span className="hero-chip">Live Decision Dashboard</span>
            <h1 className="hero-headline">
              <span className="hero-headline-base">Every option counts.</span>
              <span className="hero-headline-accent">Rank them all.</span>
            </h1>
            <p className="hero-subtitle hero-centered-copy">
              Add your most important options and let Decision Maker score
              them instantly using weighted criteria according to the formula below.
            </p>
            <p className="hero-formula hero-centered-copy">
              Score = (Importance x 2) + (Long-term x 2) + (Urgency x 1.5) + (Enjoyment x 1)
            </p>
            <button
              onClick={addOption}
              className="btn-primary hero-cta"
              type="button"
              disabled={!canAddOption}
            >
              <Plus className="w-4 h-4" />
              Add Your First Option
            </button>
            <p className="hero-empty-title">No options added yet</p>
            <p className="hero-empty-copy">
              Add your first option to start evaluating decisions.
            </p>
          </section>
        )}

        <main className={`main-region ${showHero ? '' : 'main-region-centered'}`} aria-label="Decision workspace">
          <section className="glass-panel fade-up delay-2" aria-label="Options input">
          <div className="section-header section-header-centered">
            <div>
              <p className="section-kicker">Evaluate your options below</p>
              <h2 className="section-title">Quick Compare Board</h2>
            </div>
            {!showHero && (
              <button onClick={addOption} className="btn-secondary" type="button" disabled={!canAddOption}>
                <Plus className="w-4 h-4" />
                Add Option
              </button>
            )}
          </div>

          <div className={`option-stack option-stack-count-${options.length}`}>
            {options.map((option, index) => (
              <article
                key={option.id}
                className={`option-card ${getOptionPlacementClass(options.length, index)}`}
              >
                <div className="option-top-row">
                  <span className="option-index">{index + 1}</span>
                  <input
                    type="text"
                    value={option.name}
                    onChange={(e) => updateOptionName(option.id, e.target.value)}
                    placeholder={`Option ${index + 1} name`}
                    className="option-input"
                    maxLength={OPTION_NAME_MAX_LENGTH}
                  />
                  {options.length > 0 && (
                    <button
                      onClick={() => removeOption(option.id)}
                      className="remove-btn"
                      type="button"
                      aria-label={`Remove option ${index + 1}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="criteria-grid">
                  <div className="criterion-block">
                    <div className="criterion-meta">
                      <span className="criterion-title">
                        <Star className="w-4 h-4 criterion-icon importance" />
                        Importance
                      </span>
                      <span className="criterion-score">{option.criteria.importance}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={option.criteria.importance}
                      onChange={(e) =>
                        updateCriteria(option.id, 'importance', parseInt(e.target.value, 10))
                      }
                      className="neon-slider slider-importance"
                    />
                  </div>

                  <div className="criterion-block">
                    <div className="criterion-meta">
                      <span className="criterion-title">
                        <TrendingUp className="w-4 h-4 criterion-icon long-term" />
                        Long-term Value
                      </span>
                      <span className="criterion-score">{option.criteria.longTerm}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={option.criteria.longTerm}
                      onChange={(e) =>
                        updateCriteria(option.id, 'longTerm', parseInt(e.target.value, 10))
                      }
                      className="neon-slider slider-long-term"
                    />
                  </div>

                  <div className="criterion-block">
                    <div className="criterion-meta">
                      <span className="criterion-title">
                        <Clock className="w-4 h-4 criterion-icon urgency" />
                        Urgency
                      </span>
                      <span className="criterion-score">{option.criteria.urgency}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={option.criteria.urgency}
                      onChange={(e) =>
                        updateCriteria(option.id, 'urgency', parseInt(e.target.value, 10))
                      }
                      className="neon-slider slider-urgency"
                    />
                  </div>

                  <div className="criterion-block">
                    <div className="criterion-meta">
                      <span className="criterion-title">
                        <Smile className="w-4 h-4 criterion-icon enjoyment" />
                        Enjoyment
                      </span>
                      <span className="criterion-score">{option.criteria.enjoyment}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={option.criteria.enjoyment}
                      onChange={(e) =>
                        updateCriteria(option.id, 'enjoyment', parseInt(e.target.value, 10))
                      }
                      className="neon-slider slider-enjoyment"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {optionCount === 0 ? (
            <button onClick={addOption} className="btn-primary" type="button" disabled={!canAddOption}>
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          ) : (
            <button onClick={calculateScores} className="btn-primary" type="button" disabled={!canRunDecision}>
              Run Decision Maker
            </button>
          )}
          </section>

          {results && (
            <section className="glass-panel fade-up delay-2" aria-label="Results">
              <div className="section-header section-header-tight section-header-output">
                <div>
                  <p className="section-kicker">Decision Maker Output</p>
                  <h2 className="section-title">Recommended Option Order</h2>
                </div>
              </div>

              <div className={`results-stack results-stack-count-${results.length}`}>
                {results.map((result, index) => {
                  const rankBadge = getRankBadge(index);

                  return (
                  <article
                    key={result.id}
                    className={`result-card ${getOptionPlacementClass(results.length, index)} ${(hasTopScoreTie ? topRecommended.some((top) => top.id === result.id) : index === 0) ? 'result-card-winner' : ''}`}
                  >
                    <div className="result-header">
                      <div>
                        <div className="result-title-row">
                          <span className={rankBadge.className}>
                            {rankBadge.icon}
                            <span>{rankBadge.label}</span>
                          </span>
                          {((hasTopScoreTie ? topRecommended.some((top) => top.id === result.id) : index === 0)) && (
                            <span className="winner-badge">Recommended</span>
                          )}
                          <h3 className="result-name">{result.name}</h3>
                        </div>
                      </div>
                      <div className="score-wrap">
                        <div className="score-value">{result.score.toFixed(1)}</div>
                        <span className="score-label">total score</span>
                      </div>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${(result.score / maxScore) * 100}%` }}
                      />
                    </div>

                    <div className="breakdown-grid">
                      <div className="breakdown-item">
                        <span>Importance (x2)</span>
                        <strong>{result.breakdown.importance.toFixed(1)}</strong>
                      </div>
                      <div className="breakdown-item">
                        <span>Long-term (x2)</span>
                        <strong>{result.breakdown.longTerm.toFixed(1)}</strong>
                      </div>
                      <div className="breakdown-item">
                        <span>Urgency (x1.5)</span>
                        <strong>{result.breakdown.urgency.toFixed(1)}</strong>
                      </div>
                      <div className="breakdown-item">
                        <span>Enjoyment (x1)</span>
                        <strong>{result.breakdown.enjoyment.toFixed(1)}</strong>
                      </div>
                    </div>
                  </article>
                  );
                })}
              </div>

              {hasTopScoreTie && (
                <p className="tie-message">
                  These options are equally recommended: {topRecommended.map((option) => option.name).join(', ')}.
                </p>
              )}
            </section>
          )}
        </main>
      </div>

      <footer className="app-footer">
        <p className="footer-zone footer-left">v2.0</p>
        <div className="footer-zone footer-center">
          <p>Built with <span className="footer-heart">♥</span> by Jagrat Ahuja</p>
          <p>© 2026 All rights reserved.</p>
        </div>
        <p className="footer-zone footer-right" aria-hidden="true">&nbsp;</p>
      </footer>
    </div>
  );
}

export default App;
