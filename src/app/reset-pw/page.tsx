import React, { Suspense } from 'react';
import ResetPasswordClient from './ResetPassword';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ResetPasswordClient />
    </Suspense>
  );
}