const History = ({ isOpen, onClose, learner }) => {
  if (!isOpen || !learner) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4 sm:p-6">
      <div className="bg-white w-full max-w-md sm:max-w-lg p-4 sm:p-6 rounded-lg shadow-lg">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {learner.name} History
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ✖
          </button>
        </div>

        {/* Table Section */}
        <div className="p-3 sm:p-4 space-y-4">
          <table className="w-full text-sm sm:text-base text-left text-gray-600 dark:text-gray-400">
            <tbody>
              {[
                { label: "Name", value: learner.name },
                { label: "Mobile", value: learner.mobile },
                { label: "Test Type", value: learner.test },
                { label: "Result", value: learner.result },
                { label: "Date", value: learner.date },
              ].map(({ label, value }) => (
                <tr key={label} className="align-top">
                  <td className="px-2 sm:px-4 py-2 text-gray-700 font-medium">
                    {label} :
                  </td>
                  <td className="px-2 sm:px-4 py-2 text-gray-900">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Close Button */}
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default History;
