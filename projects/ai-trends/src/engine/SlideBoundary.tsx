import { Component, type ReactNode } from 'react';

/** Keeps one broken slide from taking down the deck: shows a quiet error card instead, and logs the error. */
export class SlideBoundary extends Component<{ id: string; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error(`[slide ${this.props.id}]`, error); }
  componentDidUpdate(prev: { id: string }) { if (prev.id !== this.props.id && this.state.error) this.setState({ error: null }); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="slide-error">
        <div className="label">Slide “{this.props.id}” hit an error</div>
        <pre>{String(this.state.error.message || this.state.error)}</pre>
      </div>
    );
  }
}
