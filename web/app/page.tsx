"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

export default function Home() {
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const featuresRef = useRef(null);
  const faqRef = useRef(null);
  const footerRef = useRef(null);

  const featuresInView = useInView(featuresRef, {
    once: true,
    margin: "-100px",
  });
  const faqInView = useInView(faqRef, { once: true, margin: "-100px" });
  const footerInView = useInView(footerRef, { once: true, margin: "-100px" });

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full px-6 lg:px-8 py-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <motion.div
              className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg mr-3 flex items-center justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </motion.div>
            <div className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-gray-900">
              Whoosh
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="font-[family-name:var(--font-inter)] text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#faq"
              className="font-[family-name:var(--font-inter)] text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              FAQ
            </a>
            <a
              href="#support"
              className="font-[family-name:var(--font-inter)] text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Support
            </a>
            <motion.button
              className="font-[family-name:var(--font-inter)] bg-gray-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Download
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-8 py-20 sm:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-[family-name:var(--font-outfit)] text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight tracking-tight"
          >
            File Sharing
            <span className="block text-orange-500">Reimagined</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-[family-name:var(--font-inter)] text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
          >
            The fastest way to share files across devices. Available for macOS,
            Windows, iOS, and Android.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
          >
            <motion.button
              className="group font-[family-name:var(--font-inter)] bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 px-8 rounded-full transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <span className="flex items-center">
                Download Now
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
              </span>
            </motion.button>
          </motion.div>

          {/* Platform badges */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {[
              {
                name: "macOS",
                path: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z",
              },
              {
                name: "Windows",
                path: "M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.351",
              },
              {
                name: "iOS",
                path: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z",
              },
              {
                name: "Android",
                path: "M3.609 1.814L13.792 12 3.61 22.186c-.085-.085-.16-.186-.24-.287-.372-.491-.372-1.113 0-1.603l9.797-9.296L3.37 2.704c.08-.101.155-.202.24-.286.185-.186.388-.372.575-.531l.016-.016c.203-.187.419-.287.623-.37l.016-.016zm.193-.406c.036-.019.072-.019.108-.036l.016-.016c.136-.068.287-.136.436-.186l.016-.016c.219-.068.436-.102.624-.119.151-.016.287-.016.421 0 .203.016.387.068.539.136.019.016.036.016.036.032l6.624 3.937-6.995 6.995L.812 1.407zm16.97 5.437c.859.491 1.384 1.384 1.384 2.351 0 .967-.525 1.859-1.384 2.351l-3.937 2.285-1.859-1.859 1.859-1.859-1.859-1.859 3.937-2.285-.016.016z",
              },
            ].map((platform) => (
              <div
                key={platform.name}
                className="flex items-center bg-white rounded-lg px-4 py-2 border border-gray-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d={platform.path} />
                </svg>
                <span className="font-[family-name:var(--font-inter)] text-sm font-medium text-gray-700">
                  {platform.name}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Video Placeholder */}
          <motion.div
            className="relative max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div
              className="relative bg-gray-900 rounded-3xl overflow-hidden aspect-video"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              onHoverStart={() => setIsVideoHovered(true)}
              onHoverEnd={() => setIsVideoHovered(false)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-6 mx-auto hover:bg-orange-600 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-8 h-8 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </motion.div>
                  <h3 className="font-[family-name:var(--font-outfit)] text-white text-xl font-semibold mb-2">
                    See Whoosh in Action
                  </h3>
                  <p className="font-[family-name:var(--font-inter)] text-gray-300">
                    Watch how easy it is to share files across devices
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={featuresRef}
        className="relative px-6 lg:px-8 py-24 bg-white"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={
              featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
            }
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-[family-name:var(--font-outfit)] text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Whoosh?
            </h2>
            <p className="font-[family-name:var(--font-inter)] text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Experience file sharing like never before with our cutting-edge
              peer-to-peer technology.
            </p>
          </motion.div>

          {/* Core Features */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={
              featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
            }
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {[
              {
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                title: "Lightning Fast",
                desc: "Direct peer-to-peer transfers at maximum speed",
              },
              {
                icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
                title: "Cross-Platform",
                desc: "Works seamlessly across all your devices",
              },
              {
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                title: "Secure",
                desc: "End-to-end encryption keeps your files private",
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                className="text-center"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={feature.icon}
                    />
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-outfit)] text-gray-900 font-semibold text-lg mb-3">
                  {feature.title}
                </h3>
                <p className="font-[family-name:var(--font-inter)] text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Detailed Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={
                featuresInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
              }
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-gray-900 mb-6">
                Advanced Features
              </h3>
              <div className="space-y-6">
                {[
                  {
                    title: "No File Size Limits",
                    desc: "Share files of any size without restrictions or compression.",
                  },
                  {
                    title: "Offline Capability",
                    desc: "Queue transfers and sync when devices come back online.",
                  },
                  {
                    title: "Smart Discovery",
                    desc: "Automatically find nearby devices for instant sharing.",
                  },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-[family-name:var(--font-outfit)] font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h4>
                      <p className="font-[family-name:var(--font-inter)] text-gray-600">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="bg-gray-50 rounded-3xl p-8 lg:p-12"
              initial={{ opacity: 0, x: 30 }}
              animate={
                featuresInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }
              }
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-[family-name:var(--font-outfit)] font-semibold text-gray-900">
                    Transfer Progress
                  </h4>
                  <span className="font-[family-name:var(--font-inter)] text-sm text-orange-600">
                    87%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <motion.div
                    className="bg-orange-500 h-2 rounded-full"
                    initial={{ width: "0%" }}
                    animate={
                      featuresInView ? { width: "87%" } : { width: "0%" }
                    }
                    transition={{ duration: 2, delay: 1 }}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-[family-name:var(--font-inter)] text-gray-600">
                      Speed
                    </span>
                    <span className="font-[family-name:var(--font-inter)] text-gray-900">
                      45.2 MB/s
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-[family-name:var(--font-inter)] text-gray-600">
                      Time remaining
                    </span>
                    <span className="font-[family-name:var(--font-inter)] text-gray-900">
                      2 minutes
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        ref={faqRef}
        className="relative px-6 lg:px-8 py-24 bg-gray-50"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={faqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-[family-name:var(--font-outfit)] text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="font-[family-name:var(--font-inter)] text-xl text-gray-600 leading-relaxed">
              Everything you need to know about Whoosh
            </p>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={faqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {[
              {
                q: "How does peer-to-peer file sharing work?",
                a: "Whoosh connects your devices directly, bypassing traditional servers. Files are transferred directly between devices, ensuring maximum speed and privacy. Your data never touches our servers.",
              },
              {
                q: "Is there a file size limit?",
                a: "No, there are no file size limits with Whoosh. Share everything from documents to 4K videos without compression or restrictions.",
              },
              {
                q: "How secure are my files?",
                a: "All transfers are protected with end-to-end encryption. Only you and the recipient can access the files. We use industry-standard AES-256 encryption to ensure your data remains private.",
              },
              {
                q: "Do both devices need to be online simultaneously?",
                a: "For direct transfers, yes. However, Whoosh can queue transfers and complete them when both devices come online. You'll receive notifications when transfers are complete.",
              },
              {
                q: "Can I share files with someone who doesn't have Whoosh?",
                a: "Currently, both sender and recipient need Whoosh installed. However, we're working on web-based sharing for recipients without the app.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-[family-name:var(--font-outfit)] font-semibold text-gray-900 mb-3">
                  {faq.q}
                </h3>
                <p className="font-[family-name:var(--font-inter)] text-gray-600 leading-relaxed">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        ref={footerRef}
        className="bg-gray-900 text-white"
        initial={{ opacity: 0 }}
        animate={footerInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <motion.div
                  className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg mr-4 flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </motion.div>
                <div className="font-[family-name:var(--font-outfit)] text-2xl font-bold">
                  Whoosh
                </div>
              </div>
              <p className="font-[family-name:var(--font-inter)] text-gray-400 leading-relaxed mb-6 max-w-md">
                The fastest, most secure way to share files across all your
                devices. Experience file sharing reimagined.
              </p>
              <div className="flex space-x-4">
                {[0, 1, 2].map((_, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-[family-name:var(--font-outfit)] font-semibold mb-4">
                Product
              </h4>
              <ul className="space-y-3">
                {["Features", "Download", "Changelog", "Roadmap"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="font-[family-name:var(--font-inter)] text-gray-400 hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-[family-name:var(--font-outfit)] font-semibold mb-4">
                Support
              </h4>
              <ul className="space-y-3">
                {[
                  "Help Center",
                  "Contact Us",
                  "Privacy Policy",
                  "Terms of Service",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="font-[family-name:var(--font-inter)] text-gray-400 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="font-[family-name:var(--font-inter)] text-gray-400 text-sm">
              © 2024 Whoosh. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="font-[family-name:var(--font-inter)] text-gray-400 text-sm">
                Made with ❤️ for file sharing
              </span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
