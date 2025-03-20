import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Mail,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function Support() {
  const { theme } = useSelector((state) => state.auth);
  const [openFaq, setOpenFaq] = useState(null);

  const containerClass = theme === "dark" ? "bg-darkbg" : "bg-white";
  const textClass = theme === "dark" ? "text-white" : "text-gray-900";
  const subTextClass = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const cardClass = theme === "dark" ? "bg-fadetext/25" : "bg-white";
  const borderClass = theme === "dark" ? "border-gray-700" : "border-gray-200";

  const faqs = [
    {
      question: "How do I upload a video?",
      answer:
        "To upload a video, click on the 'Upload' button in the navigation bar. Select your video file, add a title, description, and thumbnail. Make sure your video meets our format and size requirements.",
    },
    {
      question: "What video formats are supported?",
      answer:
        "We support MP4, WebM, and MOV formats. Maximum file size is 500MB. Recommended resolution is 720p or higher.",
    },
    {
      question: "How do I edit my profile?",
      answer:
        "Go to your profile page by clicking on your avatar in the top right corner. Click the 'Edit Profile' button to update your information, avatar, and other settings.",
    },
    {
      question: "How do I report inappropriate content?",
      answer:
        "Click the three dots menu on any video or comment and select 'Report'. Fill out the report form with details about the issue. Our team will review your report and take appropriate action.",
    },
    {
      question: "How do I change my password?",
      answer:
        "Go to your profile settings and click on 'Security'. You'll find the option to change your password there. Make sure to enter your current password for verification.",
    },
  ];

  const handleFaqToggle = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className={`min-h-screen ${containerClass} pr-[15%]`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-3xl font-bold mb-4 ${textClass}`}>
            Support Center
          </h1>
          <p className={`${subTextClass} max-w-2xl mx-auto`}>
            Need help? We're here to assist you. Find answers to common
            questions or contact our support team.
          </p>
        </div>

        {/* Contact Information */}
        <div
          className={`${cardClass} rounded-lg p-6 mb-8 shadow-lg ${borderClass} border`}
        >
          <h2 className={`text-xl font-semibold mb-4 ${textClass}`}>
            Contact Us
          </h2>
          <div className="flex items-center gap-3">
            <Mail className={subTextClass} size={24} />
            <div>
              <p className={`font-medium ${textClass}`}>Email</p>
              <p className={subTextClass}>support@clipnex.com</p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div
          className={`${cardClass} rounded-lg p-6 shadow-lg ${borderClass} border`}
        >
          <h2 className={`text-xl font-semibold mb-4 ${textClass}`}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`border-b ${borderClass} pb-4 last:border-b-0`}
              >
                <button
                  onClick={() => handleFaqToggle(index)}
                  className={`w-full flex items-center justify-between ${textClass}`}
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className={subTextClass} size={20} />
                    <span className="font-medium">{faq.question}</span>
                  </div>
                  {openFaq === index ? (
                    <ChevronUp className={subTextClass} size={20} />
                  ) : (
                    <ChevronDown className={subTextClass} size={20} />
                  )}
                </button>
                {openFaq === index && (
                  <p className={`mt-2 ml-8 ${subTextClass}`}>{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;
