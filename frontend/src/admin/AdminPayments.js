import React, { useEffect, useState } from 'react';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 500) {
          setError('Payments table missing. Please create the payments table in the database.');
          setPayments([]);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch payments');
      }
      const data = await res.json();
      setPayments(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleView = (payment) => {
    setSelectedPayment(payment);
  };

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: '#bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Payments</h2>
      {loading ? <div>Loading payments...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <table style={{ width: '100%', background: 'rgba(255,255,255,0.55)', borderRadius: 12, boxShadow: '0 2px 12px #bfa16c11', borderCollapse: 'collapse', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.35)' }}>
              <th style={{ padding: 10 }}>ID</th>
              <th style={{ padding: 10 }}>User ID</th>
              <th style={{ padding: 10 }}>Amount</th>
              <th style={{ padding: 10 }}>Date</th>
              <th style={{ padding: 10 }}>Status</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td style={{ padding: 10 }}>{payment.id}</td>
                <td style={{ padding: 10 }}>{payment.user_id}</td>
                <td style={{ padding: 10 }}>{payment.amount}</td>
                <td style={{ padding: 10 }}>{payment.date}</td>
                <td style={{ padding: 10 }}>{payment.status}</td>
                <td style={{ padding: 10 }}>
                  <button onClick={() => handleView(payment)} style={{ background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* View Payment Modal */}
      {selectedPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setSelectedPayment(null)}>
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 4px 32px #bfa16c22', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#bfa16c' }}>Payment Details</h3>
            <div><b>ID:</b> {selectedPayment.id}</div>
            <div><b>User ID:</b> {selectedPayment.user_id}</div>
            <div><b>Amount:</b> {selectedPayment.amount}</div>
            <div><b>Date:</b> {selectedPayment.date}</div>
            <div><b>Status:</b> {selectedPayment.status}</div>
            <button onClick={() => setSelectedPayment(null)} style={{ marginTop: 16, background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
} 