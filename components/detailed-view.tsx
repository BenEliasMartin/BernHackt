"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

// Register GSAP plugins
gsap.registerPlugin(SplitText);

interface DetailedViewProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserSummary {
  [key: string]: any; // Flexible structure for Firebase data
}

export default function DetailedView({ isOpen, onClose }: DetailedViewProps) {
  const [userSummary, setUserSummary] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Fetch user summary when component opens
  useEffect(() => {
    if (isOpen && !userSummary) {
      fetchUserSummary();
    }
  }, [isOpen]);

  // Animate text when userSummary changes
  useEffect(() => {
    if (userSummary?.currentMonthlySummary?.insights && textRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (textRef.current) {
          const splitText = new SplitText(textRef.current, {
            type: "words,chars",
            wordsClass: "word",
            charsClass: "char",
          });

          // Set initial state
          gsap.set(splitText.chars, {
            opacity: 0,
            y: 20,
            rotationX: -90,
          });

          // Animate in
          gsap.to(splitText.chars, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.02,
            ease: "back.out(1.7)",
            delay: 0.5,
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [userSummary]);

  const fetchUserSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/user-summary");
      const result = await response.json();

      if (result.success) {
        setUserSummary(result.data);
      } else {
        setError(result.error || "Failed to fetch user summary");
      }
    } catch (err) {
      setError("Network error while fetching user summary");
      console.error("Error fetching user summary:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-white"
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 200,
            duration: 0.6,
          }}
        >
          <div className="h-screen bg-white flex flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-100">
              <div className="max-w-md mx-auto px-6">
                <motion.div
                  className="pt-8 pb-4 flex items-center gap-4"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <motion.button
                    onClick={onClose}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-700" />
                  </motion.button>
                  <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900">
                    Financial Details
                  </h1>
                </motion.div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto flex items-center justify-center px-2">
              <div className="w-full max-w-full mx-auto">
                <motion.div
                  className="space-y-6 pb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {/* User Summary Content */}
                  {loading && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-4">
                        Loading your financial summary...
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="text-center py-12">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <p className="text-red-600 font-medium">
                          Error loading data
                        </p>
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                        <button
                          onClick={fetchUserSummary}
                          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}

                  {userSummary && !loading && !error && (
                    <div className="py-12">
                      {/* Display only currentMonthlySummary.insights as plain text */}
                      {userSummary.currentMonthlySummary?.insights ? (
                        <div className="text-center px-1">
                          <p
                            ref={textRef}
                            className="text-gray-900 font-black tracking-tighter leading-none"
                            style={{
                              fontSize: "clamp(3rem, 8vw, 6rem)",
                              perspective: "1000px",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              hyphens: "auto",
                              lineHeight: "0.9",
                              maxWidth: "100%",
                              textAlign: "center",
                              wordSpacing: "0.05em",
                              letterSpacing: "-0.05em",
                              fontWeight: "900",
                              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                          >
                            {userSummary.currentMonthlySummary.insights}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <p className="text-lg font-medium">
                            No insights available
                          </p>
                          <p className="text-sm mt-2">
                            currentMonthlySummary.insights not found in the
                            data.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {!userSummary && !loading && !error && (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg font-medium">No data available</p>
                      <p className="text-sm mt-2">
                        Unable to load user summary.
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
