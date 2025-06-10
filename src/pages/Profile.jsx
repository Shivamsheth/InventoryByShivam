import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/styles.css';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    business: '',
  });
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, []);

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setForm(docSnap.data());
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, form);
      setEditMode(false);
      alert('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This cannot be undone.');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await user.delete();
      navigate('/register');
    } catch (err) {
      setError('Failed to delete account.');
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!user) return <div className="text-center mt-5">Redirecting...</div>;

  return (
    <div className="page-container">
      <h1 className="display-4 fw-bold mb-4 gradient-text text-center">Your <span className="text-primary">Profile</span></h1>

      <div className="profile-card p-4 shadow-lg rounded-4 bg-dark text-white mx-auto" style={{ maxWidth: '600px' }}>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label className="form-label">First Name</label>
          {editMode ? (
            <input
              type="text"
              className="form-control"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          ) : (
            <div className="form-control-plaintext text-light">{form.firstName}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Last Name</label>
          {editMode ? (
            <input
              type="text"
              className="form-control"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          ) : (
            <div className="form-control-plaintext text-light">{form.lastName}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Phone</label>
          {editMode ? (
            <input
              type="tel"
              className="form-control"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          ) : (
            <div className="form-control-plaintext text-light">{form.phone}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <div className="form-control-plaintext text-light">{form.email}</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Business</label>
          {editMode ? (
            <input
              type="text"
              className="form-control"
              value={form.business}
              onChange={(e) => setForm({ ...form, business: e.target.value })}
            />
          ) : (
            <div className="form-control-plaintext text-light">{form.business}</div>
          )}
        </div>

        <div className="d-flex justify-content-between mt-4">
          {editMode ? (
            <>
              <button className="btn btn-success w-50 me-2" onClick={handleUpdate}>Save Changes</button>
              <button className="btn btn-secondary w-50" onClick={() => setEditMode(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary w-50 me-2" onClick={() => setEditMode(true)}>Edit Profile</button>
              <button className="btn btn-danger w-50" onClick={handleDelete}>Delete Account</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
