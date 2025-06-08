import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import '../styles/styles.css';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ name: '', quantity: '', category: '', price: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const itemsPerPage = 25;

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const stored = localStorage.getItem('transactions');
    if (stored) setTransactions(JSON.parse(stored));
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/inventory', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const processed = res.data.map((item) => ({
      ...item,
      quantity: parseInt(item.quantity || 0),
      price: parseFloat(item.price || 0),
      saved: true,
    }));
    setItems(processed);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    const { name, quantity, category, price } = form;
    const qty = parseInt(quantity);
    const prc = parseFloat(price);
    if (!name || !category || isNaN(qty) || isNaN(prc)) return;

    const token = localStorage.getItem('token');
    await axios.post('http://localhost:5000/api/inventory', { name, quantity: qty, category, price: prc }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setForm({ name: '', quantity: '', category: '', price: '' });
    fetchData();
  };

  const handleChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, [field]: value, saved: false } : item))
    );
  };

  const handleSave = async (item) => {
    const { _id, name, quantity, price, category } = item;
    const token = localStorage.getItem('token');
    await axios.put(`http://localhost:5000/api/inventory/${_id}`, { name, quantity, price, category }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems((prev) => prev.map((i) => (i._id === _id ? { ...i, saved: true } : i)));

    const newTransaction = {
      timestamp: new Date().toLocaleString(),
      name,
      quantity,
      price,
      total: quantity * price,
      action: 'Save'
    };
    const updated = [...transactions, newTransaction];
    setTransactions(updated);
    localStorage.setItem('transactions', JSON.stringify(updated));
  };

  const handleDelete = async (id, item) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/inventory/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
    const newTransaction = {
      timestamp: new Date().toLocaleString(),
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: 0,
      action: 'Delete'
    };
    const updated = [...transactions, newTransaction];
    setTransactions(updated);
    localStorage.setItem('transactions', JSON.stringify(updated));
  };

  const exportCSV = () => {
    const csv = Papa.unparse(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${Date.now()}.csv`;
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Transaction Report", 14, 10);
    autoTable(doc, {
      head: [['Timestamp', 'Name', 'Quantity', 'Price', 'Total', 'Action']],
      body: transactions.map(t => [t.timestamp, t.name, t.quantity, t.price, t.total, t.action]),
      startY: 20
    });
    doc.save(`transactions_${Date.now()}.pdf`);
  };

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const recentTransactions = transactions.filter((t) => new Date(t.timestamp) >= oneYearAgo);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginatedTransactions = recentTransactions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(recentTransactions.length / itemsPerPage);

  const totalValue = items.reduce((sum, item) => (item.saved ? sum + item.quantity * item.price : sum), 0);

  return (
    <div className="page-container">
      <div className="glass-card">
        <h2 className="mb-4 text-center">Inventory Management</h2>

        <div className="row g-3 mb-4">
          <input type="text" className="form-control" placeholder="Item Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="number" className="form-control" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <input type="text" className="form-control" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input type="number" className="form-control" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <button className="btn btn-primary" onClick={handleAdd}>Add</button>
        </div>

        <table className="table table-dark table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>
                  <input type="number" className="form-control" value={item.price} onChange={(e) => handleChange(item._id, 'price', parseFloat(e.target.value))} />
                </td>
                <td>
                  <button onClick={() => handleChange(item._id, 'quantity', item.quantity - 1)}>-</button>
                  <span className="mx-2">{item.quantity}</span>
                  <button onClick={() => handleChange(item._id, 'quantity', item.quantity + 1)}>+</button>
                </td>
                <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                <td>
                  {!item.saved && item.quantity > 0 && (
                    <button onClick={() => handleSave(item)} className="btn btn-sm btn-primary">Save</button>
                  )}
                  <button onClick={() => handleDelete(item._id, item)} className="btn btn-sm btn-danger ms-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h5>Total Inventory Value: ₹{totalValue.toFixed(2)}</h5>

        <div className="mt-5">
          <h4>Transaction History</h4>
          <table className="table table-dark table-bordered">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((t, idx) => (
                <tr key={idx}>
                  <td>{t.timestamp}</td>
                  <td>{t.name}</td>
                  <td>{t.quantity}</td>
                  <td>{t.price}</td>
                  <td>{t.total}</td>
                  <td>{t.action}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination mt-3">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={`btn btn-sm ${currentPage === i + 1 ? 'btn-primary' : 'btn-secondary'} mx-1`} onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <button onClick={exportCSV} className="btn btn-outline-light me-2">Export CSV</button>
            <button onClick={exportPDF} className="btn btn-outline-light">Export PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
