import React from 'react';

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return (
      <main role="alert" className="max-w-xl mx-auto p-8 space-y-4">
        <h1 className="text-xl font-semibold">Não foi possível abrir esta parte do aplicativo.</h1>
        <p>Verifique a conexão e atualize a página para obter a versão atual.</p>
        <button className="underline" onClick={() => window.location.reload()}>Atualizar página</button>
      </main>
    );
    return this.props.children;
  }
}
