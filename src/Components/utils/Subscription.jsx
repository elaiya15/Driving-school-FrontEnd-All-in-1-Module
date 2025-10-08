import React, { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../../App";
import { useRole } from '../AuthContext/AuthContext';
import { useNavigate } from "react-router-dom";
const SubscriptionPlans = () => {
    const navigate =useNavigate();
      const { user,clearAuthState} = useRole();
    const organizationId = user?.organizationId;
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);


 console.log('user:', user)

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await axios.get(`${URL}/api/plans`);
      setPlans(data);
    };
    fetchPlans();
  }, []);

  //   const handleSubscribe = async (plan) => {
  //     try {
  //       setLoading(true);

  //       // 1️⃣ Call backend to create order
  //       const { data } = await axios.post(`${URL}/api/subscription/create`, {
  //         organizationId,
  //         planId: plan.planId,
  //       });

  //       if (!data.orderId) {
  //         alert("Failed to create order");
  //         return;
  //       }

  //       // 2️⃣ Open Razorpay checkout
  //       const options = {
  //         key: import.meta.env.VITE_REACT_APP_RAZORPAY_KEY_ID, // from .env
  //         amount: data.amount * 100, // amount in paise
  //         currency: data.currency,
  //         name: "Driving School",
  //         description: `${plan.name} Driving Lessons`,
  //         order_id: data.orderId, // ✅ correct key for orders
  //         handler: async function (response) {
  //           // 3️⃣ Verify payment on backend
  //           await axios.post(`${URL}/api/subscription/verify`, response);
  //           alert("Payment successful!");
  //         },
  //         // prefill: {
  //         //   name: "Test User",
  //         //   email: "test@example.com",
  //         //   contact: "9876543210",
  //         // },
  //         theme: { color: "#1b61ea" },
  //       };

  //       const razor = new window.Razorpay(options);
  //       razor.open();
  //     } catch (err) {
  //       console.error(err);
  //       alert("Something went wrong!");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  // const handleSubscribe = async (plan) => {
  //   try {
  //     setLoading(true);

  //     // 1️⃣ Call backend to create order
  //     const { data } = await axios.post(`${URL}/api/subscription/create`, {
  //       organizationId,
  //       planId: plan._id,
  //     });

  //     if (!data.orderId) {
  //       alert("Failed to create order");
  //       return;
  //     }

  //     // 2️⃣ Open Razorpay checkout
  //     const options = {
  //       key: import.meta.env.VITE_REACT_APP_RAZORPAY_KEY_ID, // from .env
  //       amount: data.amount * 100, // Razorpay requires amount in paise
  //       currency: data.currency,
  //       name: "Driving School",
  //       description: `${plan.name} Driving Lessons`,
  //       order_id: data.orderId, // ✅ correct key for orders

  //       handler: async function (response) {
  //         // 3️⃣ Verify payment on backend
  //       response.organizationId = organizationId;
  //       response.planId = data.planId;
  //         await axios.post(`${URL}/api/subscription/verify`, response);
  //          window.location.href = `/payment-success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}`;
  //         // alert("Payment successful!");
  //       },

  //        // 🔴 If user closes/cancels Razorpay window
  //      modal: {
  //         ondismiss: async function () {
  //           // ❌ User closed checkout → mark as failed
  //           await axios.post(`${URL}/api/subscription/failed`, {
  //             orderId: data.orderId,
  //             reason: "Payment cancelled by user",
  //           });
  //           window.location.href = `/payment-failed?reason=Payment cancelled by user`;
  //         },
  //       },
  //       theme: { color: "#1b61ea" },
  //     };

  //     const razor = new window.Razorpay(options);

  //     // 🔴 Capture payment failure from Razorpay
  //     razor.on("payment.failed", async function (response) {
  //       await axios.post(`${URL}/api/subscription/failed`, {
  //         orderId: response.error.metadata.order_id,
  //         reason: response.error.description,
  //       });
  //       window.location.href = `/payment-failed?reason=${response.error.description}`;
  //     });

  //     razor.open();
  //   } catch (err) {
  //     console.error(err);

  //   } finally {
  //     setLoading(false);
  //   }
  // };
 const handleSubscribe = async (plan) => {
  try {
    setLoading(true);

    // 1️⃣ Create order on backend
    const { data } = await axios.post(`${URL}/api/subscription/create`, {
      organizationId,
      planId: plan._id,
    });

    if (!data.orderId) {
      alert("Failed to create order");
      return;
    }

    // 2️⃣ Razorpay checkout options
    const options = {
      key: import.meta.env.VITE_REACT_APP_RAZORPAY_KEY_ID,
      amount: data.amount * 100, // in paise
      currency: data.currency,
      name: "Driving School",
      description: `${plan.name} Driving Lessons`,
      order_id: data.orderId,

      // ✅ Success handler
      handler: async function (response) {
        response.organizationId = organizationId;
        response.planId = data.planId;

        try {
          await axios.post(`${URL}/api/subscription/verify`, response);
          window.location.href = `/payment-success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}`;
        } catch (err) {
          console.error("Verification failed:", err);
          alert("Payment verification failed. Please contact support.");
        }
      },

      // 🔴 User closes modal
      modal: {

        ondismiss: async function () {
          await axios.post(`${URL}/api/subscription/failed`, {
            orderId: data.orderId,
            reason: "Payment cancelled by user",
          });
          window.location.href = `/payment-failed?reason=Payment cancelled by user`;
        },
      },

      theme: { color: "#1b61ea" },
    };

    const razor = new window.Razorpay(options);

    // 🔴 Razorpay payment failure event
    razor.on("payment.failed", async function (response) {
      await axios.post(`${URL}/api/subscription/failed`, {
        orderId: response.error.metadata.order_id,
        reason: response.error.description,
      });
      window.location.href = `/payment-failed?reason=${response.error.description}`;
    });

    // 3️⃣ Open Razorpay checkout
    razor.open();
  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-5xl p-8 mx-auto">

         <button className=" relative  md:top-11  " onClick={() => clearAuthState()}>
              <i className="text-xl fa-solid fa-arrow-left-long"> </i> 
            </button>
      <h1 className="p-2 mb-10 text-3xl font-bold text-center text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">
        Driving School Subscription Plans
      </h1>
        
       
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className="flex flex-col justify-between p-6 bg-white border-blue-500 border-solid border-[2px] shadow-md rounded-xl"
          >
            <div>
              <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                {plan.name}
              </h2>
              <p className="mb-4 text-gray-600">{plan.description}</p>
              <p className="text-xl font-bold text-gray-800">₹{plan.amount}</p>
            </div>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading}
              className="px-4 py-2 mt-6 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
