import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useRole } from "./AuthContext/AuthContext";

export default function Page() {
  const navigate = useNavigate();
  const { role, isLoading, clearAuthState } = useRole();

 
  return (
    <>
      <main className="grid min-h-full px-6 py-24 bg-white place-items-center sm:py-32 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600">404</h1>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-gray-900 text-balance sm:text-7xl">
            Page not found
          </h1>
          <p className="mt-6 text-lg font-medium text-gray-500 text-pretty sm:text-xl/8">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="flex items-center justify-center mt-10 gap-x-6">
            <button
              onClick={() => {
                if (role) {
                 
                  if (role === "learner") {
                    navigate("/learner/learnerDash");
                  } else if (role === "admin") {
                    navigate("/admin/dashboard");
                  } else if (role === "instructor") {
                    navigate("/instructor/instructorDash");
                  }
                } else {
                  navigate("/");
                }
              }}
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Go back {role ? "dashboard" : "login"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
