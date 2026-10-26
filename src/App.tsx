function App() {
  return (
    <main className="page">
      <section className="welcome-card" aria-labelledby="welcome-heading">
        <p className="eyebrow">COFFE SHOP · STARTER</p>
        <h1 id="welcome-heading">Your next cup starts here.</h1>
        <p className="intro">
          The React app is ready. Connect your Supabase project to start building
          the shop.
        </p>
        <div className="status">
          <span className="status-dot" aria-hidden="true" />
          React is running
        </div>
      </section>
    </main>
  );
}

export default App;
