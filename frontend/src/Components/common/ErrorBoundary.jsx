import { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Application render error", error);
  }

  render() {
    if (this.state.hasError) {
      return <div className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="text-2xl font-semibold text-slate-900">Something went wrong</h1><p className="mt-2 text-slate-600">Reload this page and try again.</p></div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
