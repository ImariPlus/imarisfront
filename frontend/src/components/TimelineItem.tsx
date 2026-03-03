import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

type TimelineEntry = {
  type: "TRANSACTION";
  createdAt: string;
  metadata: {
    clientName: string;
    amount: number;
    physicianId: string;
    discount?: number;
    paymentMethod?: string;
  };
};

type Props = {
  entry: TimelineEntry;
};

export default function TimelineItem({ entry }: Props) {
  const [expanded, setExpanded] = useState(false);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const renderContent = () => {
    if (entry.type === "TRANSACTION") {
      const data = entry.metadata;

      return (
        <>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-md">
                Transaction
              </span>

              <span className="font-medium">
                {data.clientName}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-semibold">
                {formatMoney(data.amount)}
              </span>

              <span className="text-gray-400 text-sm">
                {new Date(entry.createdAt).toLocaleTimeString()}
              </span>

              <button
                onClick={() => setExpanded(!expanded)}
                className="text-gray-400 hover:text-gray-700"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          {expanded && (
            <div className="mt-3 pl-2 border-l-2 border-gray-200 text-sm text-gray-600 space-y-1">
              <div>Physician: {data.physicianId}</div>
              <div>Discount: {data.discount ?? 0}</div>
              <div>Payment Method: {data.paymentMethod ?? "N/A"}</div>
            </div>
          )}
        </>
      );
    }

    return <div>Unknown entry type</div>;
  };

  return (
    <div className="py-4 border-b border-gray-100">
      {renderContent()}
    </div>
  );
}