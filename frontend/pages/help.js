import { useState } from "react";
import { useRouter } from "next/router";
import { successToast } from '../utils/toast-utils';
export default function Help() {
    const [activeCategory, setActiveCategory] = useState("orders");
    const [expandedFaq, setExpandedFaq] = useState(null);
    const router = useRouter();

    const faqCategories = {
        orders: [
            {
                question: "How can I track my order?",
                answer: "You can track your order by going to the 'Orders' section in your account. Click on the specific order to see its current status and tracking information."
            },
            {
                question: "Can I change or cancel my order?",
                answer: "You can cancel or modify your order only if it hasn't been shipped yet. Go to 'Orders' in your account and look for the cancel or modify option for eligible orders."
            },
            {
                question: "I haven't received my order yet. What should I do?",
                answer: "If your order is delayed beyond the estimated delivery date, please check the tracking information first. If there's no update for more than 48 hours, contact our customer support team."
            }
        ],
        returns: [
            {
                question: "What is your return policy?",
                answer: "We offer a 30-day return policy for most items. Products must be in their original condition with tags attached and original packaging."
            },
            {
                question: "How do I return an item?",
                answer: "To return an item, go to the 'Returns' section in your account, select the order containing the item you wish to return, and follow the instructions to generate a return label."
            },
            {
                question: "When will I receive my refund?",
                answer: "Refunds are typically processed within 5-7 business days after we receive your return. The time it takes for the refund to appear in your account depends on your payment method and financial institution."
            }
        ],
        payment: [
            {
                question: "What payment methods do you accept?",
                answer: "We accept major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay."
            },
            {
                question: "Is it safe to use my credit card on your website?",
                answer: "Yes, our website uses industry-standard SSL encryption to protect your personal and payment information. We do not store your full credit card details on our servers."
            },
            {
                question: "Can I use multiple payment methods for a single order?",
                answer: "Currently, we only support one payment method per order. If you wish to use multiple payment methods, you'll need to place separate orders."
            }
        ],
        account: [
            {
                question: "How do I reset my password?",
                answer: "On the login page, click on 'Forgot password?' and follow the instructions sent to your email to reset your password."
            },
            {
                question: "How can I update my account information?",
                answer: "You can update your account information by going to 'Your Account' and selecting the information you wish to edit."
            },
            {
                question: "Can I have multiple shipping addresses?",
                answer: "Yes, you can save multiple shipping addresses in your account for convenient checkout in the future."
            }
        ]
    };

    const toggleFaq = (index) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    const contactSupport = () => {
        successToast("Support request submitted. Our team will contact you shortly.");
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Help & FAQ</h1>
                    
                    <div className="flex flex-wrap border-b mb-6">
                        {Object.keys(faqCategories).map(category => (
                            <button
                                key={category}
                                className={`px-4 py-2 font-medium ${
                                    activeCategory === category 
                                        ? "border-b-2 border-blue-600 text-blue-600" 
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                                onClick={() => setActiveCategory(category)}
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                        ))}
                    </div>
                    
                    <div className="space-y-4">
                        {faqCategories[activeCategory].map((faq, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden">
                                <button
                                    className="w-full px-4 py-3 text-left font-medium flex justify-between items-center hover:bg-gray-50"
                                    onClick={() => toggleFaq(index)}
                                >
                                    {faq.question}
                                    <svg
                                        className={`w-5 h-5 transition-transform ${expandedFaq === index ? "transform rotate-180" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {expandedFaq === index && (
                                    <div className="px-4 py-3 bg-gray-50 border-t">
                                        <p className="text-gray-700">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Still need help?</h2>
                        <p className="text-gray-600 mb-4">
                            If you couldn't find the answer to your question, our customer support team is here to help.
                        </p>
                        <button
                            onClick={contactSupport}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
                        >
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
