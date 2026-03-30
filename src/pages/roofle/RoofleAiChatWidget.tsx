import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ChevronRight } from "lucide-react";

interface Message {
  id: string;
  text: string;
  from: "ai" | "user";
  timestamp: Date;
}

interface Props {
  prices: { good: number; better: number; best: number };
}

function getAiResponse(input: string, prices: Props["prices"]): string {
  const lower = input.toLowerCase();

  if (/price|cost|estimat|how much|afford/.test(lower)) {
    return `Based on your roof analysis, our packages range from $${prices.good.toLocaleString()} to $${prices.best.toLocaleString()}. The Better package at $${prices.better.toLocaleString()} is our most popular choice. Would you like me to explain the differences?`;
  }
  if (/warranty|guarant/.test(lower)) {
    return "All our packages include a manufacturer warranty. Our Standard package has a 25-year warranty, the Premium package has a Lifetime warranty, and our Elite package includes Lifetime + hail warranty and a 10-year workmanship guarantee. Would you like more details on any specific package?";
  }
  if (/insurance|claim|adjuster/.test(lower)) {
    return "We work with all major insurance companies in Minnesota. If you have a claim, select 'Yes' on the insurance question in Step 4 and we'll coordinate directly with your adjuster. We've handled thousands of insurance roofing projects!";
  }
  if (/schedule|inspect|appointment|visit|come out/.test(lower)) {
    return "I can help you book a free drone inspection! Click 'Book Free Inspection' at the end of the estimate process, or call us at (612) 555-0100 to schedule one right away. We usually have availability within 24-48 hours.";
  }
  if (/material|shingle|owens|duration|storm/.test(lower)) {
    return "We use Owens Corning shingles exclusively -- they're the #1 rated roofing manufacturer. Our Standard uses 3-Tab shingles, Premium uses Duration architectural shingles, and our Elite package uses their Duration STORM impact-resistant shingles for maximum protection.";
  }
  if (/financ|payment|month|pay|loan|credit/.test(lower)) {
    return `We offer financing through multiple partners. With approved credit, monthly payments start around $${Math.round(prices.good / 100)}/mo for Standard, $${Math.round(prices.better / 100)}/mo for Premium, and $${Math.round(prices.best / 100)}/mo for Elite. Would you like to apply?`;
  }
  if (/time|long|duration|days|week|when/.test(lower)) {
    return "Most residential roof replacements take 1-3 days depending on the size and complexity. After signing, we typically begin work within 1-2 weeks, weather permitting. We'll coordinate the exact schedule with you.";
  }
  if (/hi|hello|hey|good morning|good afternoon/.test(lower)) {
    return "Hello! Welcome to Smart Construction. I can help you with roof estimates, material questions, scheduling inspections, insurance claims, or financing options. What would you like to know?";
  }

  return "That's a great question! Let me connect you with one of our specialists. In the meantime, you can get an instant estimate by entering your address above, or call us at (612) 555-0100.";
}

const QUICK_REPLIES = [
  { label: "Get Estimate", text: "I'd like to get a roof estimate" },
  { label: "Book Inspection", text: "Can I schedule an inspection?" },
  { label: "Call Us", text: "What's your phone number?" },
  { label: "Insurance Claim", text: "I have an insurance claim" },
];

export default function RoofleAiChatWidget({ prices }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greeting",
      text: "Hi! I'm the Smart Construction AI assistant. I can help with roof estimates, scheduling inspections, answering questions about materials, or connecting you with our team. What can I help you with?",
      from: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      text: text.trim(),
      from: "user",
      timestamp: new Date(),
    };

    const aiText = getAiResponse(text, prices);
    const aiMsg: Message = {
      id: `a-${Date.now()}`,
      text: aiText,
      from: "ai",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-110 transition-transform"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex items-center justify-between text-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-xs font-black">SC</div>
              <div>
                <div className="text-sm font-bold">SC Assistant</div>
                <div className="text-xs text-blue-200">Ask Anything 24/7</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.from === "user"
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white text-gray-700 border border-gray-200 rounded-bl-md shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div className="px-3 py-2 flex gap-1.5 flex-wrap bg-white border-t border-gray-100 flex-shrink-0">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr.label}
                onClick={() => sendMessage(qr.text)}
                className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition"
              >
                {qr.label} <ChevronRight className="w-3 h-3" />
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => { if (e.key === "Enter") sendMessage(input); }}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white hover:bg-blue-600 transition disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
