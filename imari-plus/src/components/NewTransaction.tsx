import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./NewTransaction.css";

interface TransactionFormData {
  clientName: string;
  physician: string;
  amount: number;
  paymentMethod: string;
  discount: number;
  notes: string;
}

const NewTransaction: React.FC = () => {
  const { t } = useTranslation();

  // 🔹 later this will come from API
  const [physicians] = useState<string[]>([
    "Dr. Habimana Paul",
    "Dr. Uwase Paula",
    "Dr. Niyonzima Hakim",
  ]);

  const [formData, setFormData] = useState<TransactionFormData>({
    clientName: "",
    physician: "",
    amount: 0,
    paymentMethod: "",
    discount: 0,
    notes: "",
  });

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
        <h2>{t("enterTransaction")}</h2>

        <form onSubmit={handleSubmit}>
          {/* Client */}
          <div className="form-group">
            <label>{t("clientName")}</label>
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
            <label>{t("physician")}</label>
            <select
              name="physician"
              value={formData.physician}
              onChange={handleChange}
              required
            >
              <option value="">{t("select")}</option>
              {physicians.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label>{t("amount")}</label>
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
            <label>{t("paymentMethod")}</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="">{t("select")}</option>
              <option value="cash">{t("cash")}</option>
              <option value="mobile">{t("mobileMoney")}</option>
              <option value="bank">{t("bankTransfer")}</option>
            </select>
          </div>

          {/* Discount */}
          <div className="form-group">
            <label>{t("discount")}</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>{t("notes")}</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <button type="submit" className="submit-btn">
            {t("save")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewTransaction;