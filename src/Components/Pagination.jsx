const Pagination = ({ CurrentPage, TotalPages, onPageChange }) => {

  const generatePageNumbers = () => {
    
    const pages = [];
    const maxDisplayedPages = 3;
    const sidePages = Math.floor(maxDisplayedPages / 2);

    let startPage = Math.max(1, CurrentPage - sidePages);
    let endPage = Math.min(TotalPages, CurrentPage + sidePages);

    if (startPage === 1) {
      endPage = Math.min(TotalPages, maxDisplayedPages);
    } else if (endPage === TotalPages) {
      startPage = Math.max(1, TotalPages - maxDisplayedPages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < TotalPages) {
      if (endPage < TotalPages - 1) pages.push("...");
      pages.push(TotalPages);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <nav
      className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
      aria-label="Table navigation"
    >
      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
        Showing{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {CurrentPage}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {TotalPages}
        </span>
      </span>
      <ul className="inline-flex items-stretch -space-x-px">
        {/* Previous Button */}
        <li>
          <button
            onClick={() => onPageChange(CurrentPage - 1)}
            disabled={CurrentPage === 1}
            className="flex items-center disabled:opacity-50 justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <span className="sr-only">Previous</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => (
          <li key={index}>
            {page === "..." ? (
              <span className="flex items-center justify-center text-sm py-2 px-3 leading-tight bg-transparent border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                {page}
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`flex items-center justify-center text-sm py-2 px-3 leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white 
                  ${
                    CurrentPage === page
                      ? "z-10 bg-blue-500 text-white font-semibold"
                      : "bg-white text-gray-700"
                  }`}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Next Button */}
        <li>
          <button
            onClick={() => onPageChange(CurrentPage + 1)}
            disabled={CurrentPage === TotalPages}
            className="flex items-center disabled:opacity-50 justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <span className="sr-only">Next</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
