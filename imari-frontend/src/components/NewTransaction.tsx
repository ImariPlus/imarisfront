import React, { useState, useEffect } from "react";

interface TransactionFormData {
  clientName: string;
  physician: string;
  amount: number;
  paymentMethod: string;
  discount: number;
  notes: string;
}

const NewTransaction: React.FC = () => {
  const [physicians, setPhysicians] = useState<string[]>([]);
  const [loadingPhysicians, setLoadingPhysicians] = useState(true);

  const [formData, setFormData] = useState<TransactionFormData>({
    clientName: "",
    physician: "",
    amount: 0,
    paymentMethod: "",
    discount: 0,
    notes: "",
  });

  // fetch physicians from backend
  useEffect(() => {
    const fetchPhysicians = async () => {
      try {
        const response = await fetch("");
        const data = await response.json();
        setPhysicians(data.data);
      } catch (error) {
        console.error("Error fetching physicians:", error);
      } finally {
        setLoadingPhysicians(false);
      }
    };
    fetchPhysicians();
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting transaction:", formData);
  };

  return (
    <div className="transaction-container">
      <div className="transaction-form">
        <h2>Enter Transaction</h2>

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
              name="physician"
              value={formData.physician}
              onChange={handleChange}
              disabled={loadingPhysicians}
              required
            >
              <option value="">
                {loadingPhysicians ? "Loading..." : "Select"}
              </option>
              {physicians.map((physician) => (
                <option key={physician} value={physician}>
                  {physician}
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

          {/* Payment */}
          <div className="form-group">
            <label>Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="cash">Cash</option>
              <option value="mobile">Mobile Money</option>
              <option value="bank">Bank Transfer</option>
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

          <button type="submit" className="submit-btn">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewTransaction;
