import React, { useState, useEffect } from "react";
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

  const [physicians, setPhysicians]= useState<string[]>([]);
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
              disabled={loadingPhysicians}
              required
            >
              <option value="">{loadingPhysicians ? t("loading") : t("select")}</option>
              {physicians.map((physician) => (
                <option key={physician} value={physician}>
                  {physician}
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