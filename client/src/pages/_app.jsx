import React from 'react';
import '../styles/globals.css';
import '@xyflow/react/dist/style.css';
import ProtectedRoute from '../components/layout/ProtectedRoute';

export default function App({ Component, pageProps }) {
  return (
    <ProtectedRoute>
      <Component {...pageProps} />
    </ProtectedRoute>
  );
}
