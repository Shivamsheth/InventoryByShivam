import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import Spinner from './Spinner'; // Spinner must exist in ./Spinner

export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  const [isVerified, setIsVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkVerification = async () => {
      if (user) {
        await user.reload(); // reloads the user to get updated emailVerified
        const refreshedUser = auth.currentUser;
        setIsVerified(refreshedUser.emailVerified);
      }
      setChecking(false);
    };

    if (user) {
      checkVerification();
    } else {
      setChecking(false);
    }
  }, [user]);

  if (loading || checking) return <Spinner />;

  if (!user) return <Navigate to="/login" replace />;

  if (!isVerified) {
    return (
      <div className="container text-center mt-5">
        <h4 className="text-warning">Your email is not verified.</h4>
        <p>Please check your inbox for the verification email and refresh this page after verifying.</p>
      </div>
    );
  }

  return children;
}
