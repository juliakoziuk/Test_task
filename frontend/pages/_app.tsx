import type { AppProps } from 'next/app';
import Link from 'next/link';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="container">
      <nav className="nav">
        <Link href="/quizzes">Quizzes</Link>
        <Link href="/create">Create quiz</Link>
      </nav>
      <Component {...pageProps} />
    </div>
  );
}
