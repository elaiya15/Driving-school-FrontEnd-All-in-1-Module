import { useNavigate } from "react-router-dom";

function SmsAdd() {
  const navigate = useNavigate ();
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <div className="max-w-4xl p-6">
      <h3 className="text-2xl md:text-xl font-bold mb-6 text-center md:text-left">
      Add SMS
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <input
              type="text"
              id="title"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Title"
            />
          </div>
          <div className="mb-5">
            <input
              type="text"
              id="subject"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Subject"
            />
          </div>
          <div className="mb5">
            <textarea
              id="message"
              rows="4"
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Body..."
            ></textarea>
          </div>
          {/* Buttons */}
          <div className="flex justify-center lg:justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={()=> navigate(-1)}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition w-full sm:w-auto"
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition w-full sm:w-auto"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default SmsAdd;
