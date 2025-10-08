import React, { useState } from "react";
import axios from "axios";
import { URL } from "../../App";

// Subscription plans data
const plans = [
  {
    id: "plan_monthly",
    name: "Monthly",
    description: "Best for beginners joining short-term driving lessons.",
    price: "₹999",
    type: "monthly",
  },
  {
    id: "plan_quarterly",
    name: "Quarterly",
    description: "Perfect for learners needing more practice and theory sessions.",
    price: "₹2499",
    type: "quarterly",
  },
  {
    id: "plan_yearly",
    name: "Yearly",
    description: "Ideal for long-term driving school membership with full benefits.",
    price: "₹7999",
    type: "yearly",
  },
];

const SubscriptionPlans = ({ organizationId="68a5a0c997ce160ec0ca69c6" }) => {
  const [loading, setLoading] = useState(false);


  const handleSubscribe = async (plan) => {
    console.log('plan:', plan)
    try {
      setLoading(true);

      // 1️⃣ Call backend to create subscription
      const { data } = await axios.post(`${URL}/api/subscription/create`, {
        organizationId,
        planType: plan.type,
        planId: plan.id,
      });

      if (!data.subscriptionId) {
        alert("Failed to create subscription");
        return;
      }

      // 2️⃣ Open Razorpay checkout
      const options = {
        key:(import.meta.env.REACT_APP_RAZORPAY_KEY_ID), // from .env
        subscription_id: data.subscriptionId,
        name: "Driving School",
        description: `${plan.name} Driving Lessons`,
        handler: async function (response) {
          // 3️⃣ Verify payment on backend
          await axios.post(`${URL}/api/subscription/verify `, response);
          alert("Subscription successful!");
        },
        theme: { color: "#1b61ea" }, // Driving school yellow
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl p-8 mx-auto">
      <h1 className="mb-10 text-3xl font-bold text-center text-gray-800">
        Driving School Subscription Plans
      </h1>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col justify-between p-6 bg-white border shadow-md rounded-xl"
          >
            <div>
              <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                {plan.name}
              </h2>
              <p className="mb-4 text-gray-600">{plan.description}</p>
              <p className="text-xl font-bold text-gray-800">{plan.price}</p>
            </div>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading}
              className="px-4 py-2 mt-6 font-semibold text-gray-900 transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
