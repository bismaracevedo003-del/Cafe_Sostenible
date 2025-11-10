import Header from '../components/Header';
import Hero from '../components/Hero';
import Benefits from '../components/Benefits';
import HowItWorks from '../components/HowItWorks';
import Stats from '../components/Stats';
import CTAFinal from '../components/CTAFinal';
import Footer from '../components/Footer';
import '../index.css';
import { useNavigate, Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Benefits />
      <HowItWorks />
      {/* <Stats /> */}
      <CTAFinal />
      <Footer />
    </>
  );
}