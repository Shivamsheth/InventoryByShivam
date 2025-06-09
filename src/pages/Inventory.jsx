import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import '../styles/styles.css';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, price: 0 });
  const [transactions, setTransactions] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const invRef = collection(db, 'inventory');
    const q = query(invRef, where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const invData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        amount: doc.data().quantity * doc.data().price,
      }));
      setItems(invData);
    });

    const txRef = collection(db, 'transactions');
    const txQuery = query(
      txRef,
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    const unsubTx = onSnapshot(txQuery, (snapshot) => {
      setTransactions(snapshot.docs.map((doc) => doc.data()));
    });

    return () => {
      unsub();
      unsubTx();
    };
  }, [user]);

  const handleAdd = async () => {
    if (!newItem.name || newItem.quantity <= 0 || newItem.price <= 0) return;
    try {
      const docRef = await addDoc(collection(db, 'inventory'), {
        ...newItem,
        userId: user.uid,
        timestamp: serverTimestamp(),
      });

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'Added',
        item: newItem.name,
        quantity: newItem.quantity,
        price: newItem.price,
        amount: newItem.quantity * newItem.price,
        timestamp: serverTimestamp(),
      });

      setNewItem({ name: '', quantity: 0, price: 0 });
    } catch (err) {
      console.error('Add failed:', err);
    }
  };

  const handleSave = async (item) => {
    try {
      const ref = doc(db, 'inventory', item.id);
      await updateDoc(ref, {
        quantity: item.quantity,
        price: item.price,
      });

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'Updated',
        item: item.name,
        quantity: item.quantity,
        price: item.price,
        amount: item.quantity * item.price,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleDelete = async (item) => {
    try {
      await deleteDoc(doc(db, 'inventory', item.id));

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'Deleted',
        item: item.name,
        quantity: item.quantity,
        price: item.price,
        amount: item.quantity * item.price,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const totalAmount = items.reduce((acc, item) => acc + item.quantity * item.price, 0);

  return (
    <div className="page-container">
      <h1 className="display-4 fw-bold mb-3 gradient-text">
        <span className="text-primary">Inventory</span> Management
      </h1>

      <div className="auth-card">
        <h3>Add New Product</h3>
        <input
          type="text"
          placeholder="Product Name"
          className="form-control"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Quantity"
          className="form-control"
          value={newItem.quantity}
          onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Price"
          className="form-control"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
        />
        <button className="btn btn-gradient mt-2 w-100" onClick={handleAdd}>
          Add Product
        </button>
      </div>

      <h3 className="mt-4">Your Products</h3>
      {items.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        <table className="table table-dark table-hover mt-3">
          <thead>
            <tr>
              <th>Name</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((itm, idx) =>
                          idx === i ? { ...itm, quantity: Number(e.target.value) } : itm
                        )
                      )
                    }
                    className="form-control"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((itm, idx) =>
                          idx === i ? { ...itm, price: Number(e.target.value) } : itm
                        )
                      )
                    }
                    className="form-control"
                  />
                </td>
                <td>₹{item.quantity * item.price}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-success me-2"
                    onClick={() => handleSave(item)}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(item)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h4 className="mt-4">Total Inventory Value: ₹{totalAmount}</h4>

      <h3 className="mt-5">Transaction History</h3>
      <table className="table table-striped table-bordered mt-2">
        <thead>
          <tr>
            <th>Type</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Amount</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, i) => (
            <tr key={i}>
              <td>{tx.type}</td>
              <td>{tx.item}</td>
              <td>{tx.quantity}</td>
              <td>{tx.price}</td>
              <td>₹{tx.amount}</td>
              <td>{tx.timestamp?.toDate().toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
