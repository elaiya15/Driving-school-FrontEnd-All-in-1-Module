import { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom"
import Pagination from "../../Components/Pagination";

const SmsTable = () => {
  const navigate = useNavigate ();
  const [learners, setLearners] = useState([
    { id: 1, title: "DDDDDD", body: "This is the body for DDDDDD" },
    { id: 2, title: "FFFFFF", body: "This is the body for FFFFFF" },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  const totalPages = Math.ceil(learners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLearners = learners.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  return (
    <>
      <div className="p-4">
        <div className="flex flex-row justify-between items-center gap-4 mb-4">
          <h3 className="text-2xl md:text-xl font-bold mb-6 text-center md:text-left">
            SMS Settings List
          </h3>
          <button
            onClick={() => navigate("/admin/dashboard/sms-settings/add")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Add
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 mb-4">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 mr-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>

            <input
              type="search"
              id="simple-search"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 pl-10 py-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Search"
            />
          </div>

          <div className="flex flex-col md:flex-row md:space-x-2 w-full md:w-auto">
            {/* <div className="w-full md:w-auto">
        <input
          type="search"
          id="mobile-search"
          className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 pl-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          placeholder="Mobile No"
        />
      </div> */}
          </div>
        </div>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-sm text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr className="bg-gray-100">
                <th className="border-b border-gray-300 px-4 py-2">S.No</th>
                {/* <th className="border-b border-gray-300 px-4 py-2">Name</th> */}
                {/* <th className="border-b border-gray-300 px-4 py-2">Mobile</th> */}
                <th className="border-b border-gray-300 px-4 py-2">Title</th>
                <th className="border-b border-gray-300 px-4 py-2">Body</th>
                <th className="border-b border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {learners.map((learner, index) => (
                <tr
                  key={learner.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {startIndex + index + 1}
                  </th>

                  {/* <td className="px-6 py-4">{learner.name}</td>
              <td className="px-6 py-4">{learner.mobile}</td> */}
                  <td className="px-6 py-4">{learner.title}</td>
                  <td className="px-6 py-4">{learner.body}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate (`admin/sms-settings/edit/${sms._id}`)}
                        className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                      >
                        <i className="fa-solid fa-pen-to-square text-blue-600"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          CurrentPage={currentPage}
          TotalPages={totalPages}
          onPageChange={handlePageChange}
        />
        <Outlet />
      </div>
    </>
  );
};

export default SmsTable;
