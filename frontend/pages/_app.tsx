import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AuthProvider } from '../components/AuthProvider';
import Nav from '../components/Nav';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>Quiz Builder</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="container">
        <Nav />
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
