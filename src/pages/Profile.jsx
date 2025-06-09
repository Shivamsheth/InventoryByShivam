import { useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';

export default function Profile() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    business: '',
    profilePic: '',
  });
  const [newPic, setNewPic] = useState(null);
  const [error, setError] = useState('');

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
      alert('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  const handlePicUpload = async () => {
    if (!newPic) return;
    const picRef = ref(storage, `profilePictures/${user.uid}`);
    try {
      await uploadBytes(picRef, newPic);
      const url = await getDownloadURL(picRef);
      setForm({ ...form, profilePic: url });
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { profilePic: url });
      alert('Profile picture updated');
    } catch (err) {
      setError('Failed to upload picture.');
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

  return (
    <div className="page-container">
      <h1 className="display-4 fw-bold mb-3 gradient-text">Your <span className="text-primary">Profile</span></h1>

      <div className="auth-card">
        {error && <div className="alert alert-danger">{error}</div>}

        <input
          type="text"
          className="form-control"
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        />

        <input
          type="text"
          className="form-control"
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        />

        <input
          type="tel"
          className="form-control"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          type="email"
          className="form-control"
          placeholder="Email"
          value={form.email}
          readOnly
        />

        <input
          type="text"
          className="form-control"
          placeholder="Business"
          value={form.business}
          onChange={(e) => setForm({ ...form, business: e.target.value })}
        />

        <div className="mt-3 mb-2">
          <input type="file" onChange={(e) => setNewPic(e.target.files[0])} />
          <button className="btn btn-sm btn-outline-primary mt-2" onClick={handlePicUpload}>
            Upload Profile Picture
          </button>
        </div>

        {form.profilePic && (
          <div className="text-center my-2">
            <img
              src={form.profilePic}
              alt="Profile"
              className="rounded-circle"
              width={100}
              height={100}
            />
          </div>
        )}

        <button className="btn btn-gradient w-100 mt-3" onClick={handleUpdate}>
          Update Profile
        </button>

        <button className="btn btn-danger w-100 mt-2" onClick={handleDelete}>
          Delete Account
        </button>
      </div>
    </div>
  );
}
