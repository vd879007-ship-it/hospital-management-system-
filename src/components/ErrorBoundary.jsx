import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[HSMS ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.removeItem('hsms_selectedPatientId');
    } catch (e) {}
    window.location.reload();
  };

  handleHardReset = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900">
                ஏதோ தவறு நடந்துவிட்டது / Something Went Wrong
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                பக்கத்தை ஏற்றுவதில் எதிர்பாராத பிழை ஏற்பட்டுள்ளது. கீழே உள்ள பொத்தானைக் கிளிக் செய்து பக்கத்தை மீண்டும் ஏற்றவும்.
              </p>
              {this.state.error && (
                <div className="mt-2 p-2.5 bg-rose-50/70 border border-rose-200 rounded-xl text-[11px] font-mono text-rose-800 text-left overflow-x-auto max-h-28">
                  {String(this.state.error?.message || this.state.error)}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>பக்கத்தை மீண்டும் ஏற்று (Reload)</span>
              </button>

              <button
                type="button"
                onClick={this.handleHardReset}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200 cursor-pointer"
              >
                <span>கேச் அழிக்க (Clear Cache)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
