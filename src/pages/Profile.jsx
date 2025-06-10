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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      setError('');
      showToast('Profile updated successfully!');
    } catch {
      setError('Failed to update profile.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await user.delete();
      navigate('/register');
    } catch {
      setError('Failed to delete account.');
    }
  };

  const showToast = (msg) => {
    const toast = document.createElement('div');
    toast.className = 'toast-success';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  if (loading) return <div className="text-center mt-5 text-info">Loading...</div>;
  if (!user) return <div className="text-center mt-5 text-info">Redirecting...</div>;

  return (
    <div className="profile-container">
      <div className="profile-glass-card">
        <div className="profile-header">
          <div className="avatar-circle">
            <span>{form.firstName.charAt(0)}{form.lastName.charAt(0)}</span>
          </div>
          <h2 className="gradient-text">Welcome, {form.firstName}</h2>
        </div>

        <div className="profile-body">
          <div className="info-section">
            {['firstName', 'lastName', 'phone', 'email', 'business'].map((field) => (
              <div className="info-field" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                {editMode && field !== 'email' ? (
                  <input
                    type="text"
                    className="form-control"
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  />
                ) : (
                  <p className="field-value">{form[field]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="action-section">
            {editMode ? (
              <>
                <button className="btn btn-success" onClick={handleUpdate}>Save</button>
                <button className="btn btn-outline-light" onClick={() => setEditMode(false)}>Cancel</button>
              </>
            ) : (
              <>
                <button className="btn btn-gradient" onClick={() => setEditMode(true)}>Edit</button>
                <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>Delete</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h4>Are you sure you want to delete your account?</h4>
            <p>This action is permanent and cannot be undone.</p>
            <div className="d-flex justify-content-between mt-3">
              <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
