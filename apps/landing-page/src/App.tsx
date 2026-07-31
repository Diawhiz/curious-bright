import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { LiveSandbox } from './components/LiveSandbox';
import { InstitutionalBanner } from './components/InstitutionalBanner';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col relative selection:bg-[rgba(255,90,54,0.15)] selection:text-[var(--color-ink)]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <LiveSandbox />
        <InstitutionalBanner />
      </main>
      <Footer />
    </div>
  );
}

export default App;
