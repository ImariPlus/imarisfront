import React, { useState, useEffect } from "react";
import "../styles/Transaction.css";

/* =========================
   TYPES
========================= */

type PaymentMethod = "CASH" | "MOBILE" | "BANK";

interface TransactionFormData {
  clientName: string;
  physicianId: string;
  amount: number;
  paymentMethod: PaymentMethod | "";
  discount: number;
  notes: string;
}

interface Physician {
  id: string;
  name: string;
}

const API_BASE = import.meta.env.VITE_API_URL;

const NewTransaction: React.FC = () => {
  const [physicians, setPhysicians] = useState<Physician[]>([]);
  const [loadingPhysicians, setLoadingPhysicians] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TransactionFormData>({
    clientName: "",
    physicianId: "",
    amount: 0,
    paymentMethod: "",
    discount: 0,
    notes: "",
  });

  /* =========================
     FETCH PHYSICIANS
  ========================= */
  useEffect(() => {
    const fetchPhysicians = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No auth token found");

        const response = await fetch(`${API_BASE}/api/physicians`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }

        const data = await response.json();
        setPhysicians(data.data ?? data);
      } catch (err) {
        console.error("Error fetching physicians:", err);
        setError("Failed to load physicians");
      } finally {
        setLoadingPhysicians(false);
      }
    };

    fetchPhysicians();
  }, []);

  /* =========================
     FORM HANDLERS
  ========================= */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "amount" || name === "discount" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const response = await fetch(`${API_BASE}/api/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      setFormData({
        clientName: "",
        physicianId: "",
        amount: 0,
        paymentMethod: "",
        discount: 0,
        notes: "",
      });

      console.log("Transaction saved successfully");
    } catch (err) {
      console.error("Failed to save transaction:", err);
      setError("Failed to save transaction");
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="transaction-container">
      <div className="transaction-form">
        <h2>Enter Transaction</h2>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Client */}
          <div className="form-group">
            <label>Client Name</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Physician */}
          <div className="form-group">
            <label>Physician</label>
            <select
              name="physicianId"
              value={formData.physicianId}
              onChange={handleChange}
              disabled={loadingPhysicians}
              required
            >
              <option value="">
                {loadingPhysicians ? "Loading..." : "Select"}
              </option>
              {physicians.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          {/* Payment Method */}
          <div className="form-group">
            <label>Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="CASH">Cash</option>
              <option value="MOBILE">Mobile Money</option>
              <option value="BANK">Bank Transfer</option>
            </select>
          </div>

          {/* Discount */}
          <div className="form-group">
            <label>Discount</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewTransaction;
