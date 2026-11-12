import { useState } from 'react';
import './JokeGenerator.css';

type Joke =
  | { type: 'single'; joke: string; category: string }
  | { type: 'twopart'; setup: string; delivery: string; category: string };

const JOKE_API = 'https://v2.jokeapi.dev/joke/Any?safe-mode';

export default function JokeGenerator() {
  const [joke, setJoke] = useState<Joke | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function getJoke() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(JOKE_API, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Joke service returned ${response.status}`);
      const data: unknown = await response.json();
      if (!data || typeof data !== 'object' || ('error' in data && data.error)) {
        throw new Error('The joke service returned an invalid response.');
      }

      const result = data as Record<string, unknown>;
      if (result.type === 'single' && typeof result.joke === 'string') {
        setJoke({ type: 'single', joke: result.joke, category: String(result.category ?? 'Random') });
      } else if (result.type === 'twopart' && typeof result.setup === 'string' && typeof result.delivery === 'string') {
        setJoke({ type: 'twopart', setup: result.setup, delivery: result.delivery, category: String(result.category ?? 'Random') });
      } else {
        throw new Error('The joke service returned an unexpected joke format.');
      }
    } catch {
      setError('Could not load a joke. Check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="joke-app">
      <section className="joke-card" aria-labelledby="joke-title">
        <div className="joke-icon" aria-hidden="true">😄</div>
        <p className="joke-eyebrow">A little laugh, on demand</p>
        <h1 id="joke-title">Random Joke Generator</h1>
        <p className="joke-intro">Get a fresh joke from the internet whenever you need a smile.</p>

        <div className="joke-content" aria-live="polite" aria-atomic="true">
          {loading ? (
            <p className="joke-placeholder">Finding a good one…</p>
          ) : error ? (
            <p className="joke-error" role="alert">{error}</p>
          ) : joke ? (
            <>
              <span className="joke-category">{joke.category}</span>
              {joke.type === 'single' ? (
                <p className="joke-text">{joke.joke}</p>
              ) : (
                <div className="joke-two-part">
                  <p className="joke-text">{joke.setup}</p>
                  <p className="joke-delivery">{joke.delivery}</p>
                </div>
              )}
            </>
          ) : (
            <p className="joke-placeholder">Tap the button to get your first joke.</p>
          )}
        </div>

        <button className="joke-button" type="button" onClick={getJoke} disabled={loading}>
          {loading ? 'Loading…' : joke ? '😄 Get another joke' : '✨ Get a joke'}
        </button>
        <p className="joke-credit">Powered by <a href="https://jokeapi.dev/" target="_blank" rel="noreferrer">JokeAPI</a></p>
      </section>
    </main>
  );
}
