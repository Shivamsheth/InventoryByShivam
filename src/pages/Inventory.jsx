// src/pages/Inventory.jsx
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import '../styles/styles.css';

const Inventory = () => {
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        await loadInventory(u.uid);
        await loadTransactions(u.uid);
      } else {
        window.location.href = '/login'; // Redirect to login if not logged in
      }
    });
    return () => unsubscribe();
  }, []);

  const loadInventory = async (uid) => {
    const q = query(collection(db, 'inventories', uid, 'items'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setInventory(data);
  };

  const loadTransactions = async (uid) => {
    const q = query(collection(db, 'inventories', uid, 'transactions'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTransactions(data);
  };

  const addInventoryItem = async () => {
    const qty = parseInt(quantity);
    const prc = parseFloat(price);
    if (!itemName || isNaN(qty) || isNaN(prc) || qty <= 0 || prc <= 0 || !user) return;

    const total = qty * prc;
    const newItem = {
      name: itemName,
      quantity: qty,
      price: prc,
      total
    };

    const itemRef = await addDoc(collection(db, 'inventories', user.uid, 'items'), newItem);
    setInventory(prev => [...prev, { ...newItem, id: itemRef.id }]);
    setItemName('');
    setQuantity('');
    setPrice('');

    await addDoc(collection(db, 'inventories', user.uid, 'transactions'), {
      type: 'Added',
      name: itemName,
      quantity: qty,
      price: prc,
      total,
      timestamp: Timestamp.now()
    });

    await loadTransactions(user.uid);
  };

  const deleteInventoryItem = async (id) => {
    const item = inventory.find(i => i.id === id);
    if (!item || !user) return;

    await deleteDoc(doc(db, 'inventories', user.uid, 'items', id));
    setInventory(prev => prev.filter(i => i.id !== id));

    await addDoc(collection(db, 'inventories', user.uid, 'transactions'), {
      type: 'Deleted',
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      timestamp: Timestamp.now()
    });

    await loadTransactions(user.uid);
  };

  const handleQuantityChange = (id, delta) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(0, item.quantity + delta),
              total: Math.max(0, (item.quantity + delta) * item.price)
            }
          : item
      )
    );
  };

  const handleSave = async (item) => {
    if (!user) return;
    const itemRef = doc(db, 'inventories', user.uid, 'items', item.id);
    await updateDoc(itemRef, {
      quantity: item.quantity,
      total: item.total
    });

    await addDoc(collection(db, 'inventories', user.uid, 'transactions'), {
      type: 'Updated',
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      timestamp: Timestamp.now()
    });

    await loadTransactions(user.uid);
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(transactions.map(({ id, ...rest }) => rest));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString()}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Type', 'Item', 'Qty', 'Price', 'Total', 'Date']],
      body: transactions.map(tx => [
        tx.type,
        tx.name,
        tx.quantity,
        tx.price,
        tx.total,
        tx.timestamp.toDate().toLocaleString()
      ])
    });
    doc.save(`transactions_${new Date().toISOString()}.pdf`);
  };

  const filteredTransactions = transactions.filter(tx =>
    Object.values(tx).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const computedTotal = () => {
    const qty = parseInt(quantity);
    const prc = parseFloat(price);
    if (isNaN(qty) || isNaN(prc)) return 0;
    return qty * prc;
  };

  return (
    <div className="page-container">
      <div className="glass-card mb-4">
        <h2>Inventory</h2>
        <div className="d-flex mb-3">
          <input className="form-control me-2" placeholder="Item name" value={itemName} onChange={e => setItemName(e.target.value)} />
          <input className="form-control me-2" type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} />
          <input className="form-control me-2" type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
          <button className="btn btn-gradient" onClick={addInventoryItem}>Add</button>
        </div>
        {quantity && price && (
          <div className="mb-3 text-info">
            <strong>Total: ₹{computedTotal()}</strong>
          </div>
        )}
        <table className="table text-white table-bordered table-hover table-dark">
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                  <span className="mx-2">{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                </td>
                <td><strong>{item.price}</strong></td>
                <td>{item.total}</td>
                <td>
                  <button className="btn btn-outline-secondary" onClick={() => handleSave(item)}>Save</button>
                  <button className="btn btn-outline-secondary ms-2" onClick={() => deleteInventoryItem(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass-card mb-4">
        <h2>Transaction History</h2>
        <input className="form-control mb-2" placeholder="Search transactions" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <div className="mb-3">
          <button className="btn btn-gradient me-2" onClick={exportToCSV}>Export CSV</button>
          <button className="btn btn-gradient" onClick={exportToPDF}>Export PDF</button>
        </div>
        <table className="table text-white table-bordered table-dark">
          <thead>
            <tr><th>Type</th><th>Item</th><th>Qty</th><th>Price</th><th>Total</th><th>Date</th></tr>
          </thead>
          <tbody>
            {paginatedTransactions.map(tx => (
              <tr key={tx.id}>
                <td>{tx.type}</td>
                <td>{tx.name}</td>
                <td>{tx.quantity}</td>
                <td>{tx.price}</td>
                <td>{tx.total}</td>
                <td>{tx.timestamp.toDate().toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="d-flex justify-content-between mt-3">
          <button className="btn btn-outline-secondary" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
          <span className="text-muted">Page {currentPage} of {totalPages}</span>
          <button className="btn btn-outline-secondary" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
