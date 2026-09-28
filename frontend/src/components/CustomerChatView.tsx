import React, { useState, useEffect, useRef } from 'react';
import type { Customer, Ticket, PurchasedProduct, ConnectedPlatform } from '../types';
import { liveWS, type WSMessage } from '../services/websocket';
import {
  Send,
  Laptop,
  Headphones,
  Smartphone,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Package,
  Wrench,
  Bot,
  User,
  ShoppingBag,
  ChevronRight,
  Store,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Radio
} from 'lucide-react';

interface CustomerChatViewProps {
  customer: Customer;
  activeTicket?: Ticket | null;
  onOpenSupportAgent?: () => void;
  onLogout?: () => void;
}

interface MessageItem {
  id: string;
  sender: 'customer' | 'assistant' | 'agent' | 'technician' | 'system';
  senderName: string;
  content: string;
  timestamp: string;
  deliveryStatus?: 'Sending...' | 'Sent' | 'Delivered' | 'Read';
  isCheckingHistory?: boolean;
  options?: string[];
}

export const CustomerChatView: React.FC<CustomerChatViewProps> = ({
  customer,
  activeTicket: _activeTicket,
  onOpenSupportAgent,
  onLogout: _onLogout
}) => {
  // Navigation sub-view: 'purchases' (My Purchases home) or 'support' (Product Support chat)
  const [currentView, setCurrentView] = useState<'purchases' | 'support'>('purchases');
  const [platformFilter, setPlatformFilter] = useState<'All' | 'Amazon' | 'Flipkart' | 'Meesho' | 'Other'>('All');

  // Purchased Products (Section 5 & 23)
  const purchasedProducts: PurchasedProduct[] = [
    {
      id: 'prod_dell_laptop',
      name: 'Dell Laptop',
      category: 'Computers & Laptops',
      icon: 'laptop',
      platform: 'Amazon',
      orderNumber: '#AMZ-78241',
      purchaseDate: '12 August 2026',
      deliveryStatus: 'Delivered',
      warrantyStatus: 'Active',
      warrantyExpiry: 'August 2027',
      serialNumber: 'DL-99214-XPS',
      previousIssue: 'Battery drain',
      previousSolution: 'Battery settings adjustment (Ticket #4821)',
      commonProblems: [
        'My laptop is not charging.',
        'The battery is draining very quickly.',
        'My laptop screen is flickering.',
        'The laptop is not turning on.',
        'The charger stopped working.',
        'It became very slow.',
        'I already contacted support about this.',
        'I have the same problem again.',
        "My laptop isn't charging again."
      ]
    },
    {
      id: 'prod_headphones',
      name: 'Wireless Headphones',
      category: 'Audio & Accessories',
      icon: 'headphones',
      platform: 'Flipkart',
      orderNumber: '#FK-98213',
      purchaseDate: '03 September 2026',
      deliveryStatus: 'Delivered',
      warrantyStatus: 'Active',
      warrantyExpiry: 'September 2027',
      serialNumber: 'WH-7712-BT',
      previousIssue: 'Left earbud audio low',
      previousSolution: 'Firmware reset',
      commonProblems: [
        'The left earbud of my wireless headphones stopped working.',
        'Audio is disconnecting frequently.',
        'Headphones not charging inside case.',
        'Microphone is muffled.'
      ]
    },
    {
      id: 'prod_smartphone',
      name: 'Smartphone',
      category: 'Mobiles & Tablets',
      icon: 'smartphone',
      platform: 'Meesho',
      orderNumber: '#MS-67281',
      purchaseDate: '20 September 2026',
      deliveryStatus: 'Delivered',
      warrantyStatus: 'Active',
      warrantyExpiry: 'September 2027',
      serialNumber: 'SM-5510-5G',
      previousIssue: 'App crash',
      previousSolution: 'Cache cleared (Worked temporarily)',
      commonProblems: [
        'My smartphone application keeps crashing.',
        'Screen touch is unresponsive.',
        'Phone getting warm while charging.',
        'Network signal drops unexpectedly.'
      ]
    },
    {
      id: 'prod_washer',
      name: 'Washing Machine',
      category: 'Home Appliances',
      icon: 'package',
      platform: 'Demo Partner Store',
      orderNumber: '#DPS-44109',
      purchaseDate: '01 July 2026',
      deliveryStatus: 'Delivered',
      warrantyStatus: 'Active',
      warrantyExpiry: 'July 2028',
      serialNumber: 'WM-3310-PRO',
      previousIssue: 'Drain hose alert',
      previousSolution: 'Filter cleaned',
      commonProblems: [
        'My washing machine is not starting.',
        'Water drainage error code E2.',
        'Excessive vibration during spin cycle.',
        'Door lock not engaging.'
      ]
    }
  ];

  // Connected Shopping Platforms (Section 3)
  const connectedPlatforms: ConnectedPlatform[] = [
    {
      name: 'Amazon',
      status: 'Demo Connected',
      ordersCount: 12,
      lastSync: 'Today, 7:32 PM',
      logo: '📦',
      accentColor: 'from-amber-500 to-orange-600'
    },
    {
      name: 'Flipkart',
      status: 'Demo Connected',
      ordersCount: 8,
      lastSync: 'Today, 6:15 PM',
      logo: '🛍️',
      accentColor: 'from-blue-600 to-indigo-600'
    },
    {
      name: 'Meesho',
      status: 'Demo Connected',
      ordersCount: 6,
      lastSync: 'Today, 5:40 PM',
      logo: '🛒',
      accentColor: 'from-pink-500 to-rose-600'
    },
    {
      name: 'Other Store',
      status: 'Demo Connected',
      ordersCount: 3,
      lastSync: 'Today, 4:10 PM',
      logo: '🏪',
      accentColor: 'from-emerald-500 to-teal-600'
    }
  ];

  const [selectedProduct, setSelectedProduct] = useState<PurchasedProduct>(purchasedProducts[0]);

  // Chat conversation state
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'm1',
      sender: 'assistant',
      senderName: 'RecallAI Support',
      content: `Welcome back, ${customer.name || 'Sarah'}. I found your Dell Laptop purchased from Amazon (#AMZ-78241). Your warranty is active.\n\nI also have your complete purchase details and previous support history indexed, so you'll never have to repeat your story. What problem are you experiencing?`,
      timestamp: '10:00 AM',
      deliveryStatus: 'Read',
      options: ['My laptop is not charging.', 'The battery is draining very quickly.', 'Book Technician']
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('Checking product information...');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('Technician A');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Support (STT + TTS) States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [autoReadAloud, setAutoReadAloud] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Stop TTS
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentlySpeakingId(null);
  };

  // Text-To-Speech (TTS)
  const speakText = (text: string, messageId?: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      if (isSpeaking && currentlySpeakingId === messageId) {
        setIsSpeaking(false);
        setCurrentlySpeakingId(null);
        return;
      }

      // Clean markdown tags for natural speech
      const cleanText = text
        .replace(/[*#_~`]/g, '')
        .replace(/•/g, '')
        .replace(/[🔍⚠️✓📦🛍️🎙️]/g, '')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Zira') ||
            v.name.includes('David'))
      );
      if (naturalVoice) utterance.voice = naturalVoice;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentlySpeakingId(messageId || 'active');
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentlySpeakingId(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentlySpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Speech-To-Text (STT) Toggle
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    // Stop speaking if AI is talking
    stopSpeaking();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setInputVal(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('[STT Error]', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('[STT Initialization Error]', err);
      setIsListening(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentView === 'support') {
      scrollToBottom();
    }
  }, [messages, isTyping, currentView]);

  useEffect(() => {
    // Connect to WebSocket as customer
    liveWS.connect(customer.id, 'customer');

    const unsubscribe = liveWS.subscribe((msg: WSMessage) => {
      if (msg.type === 'chat_message') {
        setIsTyping(false);

        // Privacy rule: zero leakage of internal notes to customer (Section 29 & 30)
        if (msg.is_internal || msg.sender === 'technician_internal') {
          return;
        }

        const senderType = msg.sender === 'technician' ? 'technician' : msg.sender === 'agent' ? 'agent' : 'assistant';
        const senderLabel =
          msg.sender_name ||
          (senderType === 'technician'
            ? 'Technician A (Specialist)'
            : senderType === 'agent'
            ? 'Support Specialist'
            : 'RecallAI Grounded Support');

        if (autoReadAloud && msg.sender !== 'customer' && msg.content) {
          speakText(msg.content, `ws_${Date.now()}`);
        }

        setMessages((prev) => {
          if (msg.sender === 'customer') {
            const hasExact = prev.some((m) => m.content === msg.content && m.sender === 'customer');
            if (hasExact) return prev;
          } else {
            const last = prev[prev.length - 1];
            if (last && last.content === msg.content && last.sender !== 'customer') {
              return prev;
            }
          }

          return [
            ...prev,
            {
              id: `msg_${Date.now()}_${Math.random()}`,
              sender: senderType,
              senderName: senderLabel,
              content: msg.content || '',
              timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              deliveryStatus: 'Delivered',
              options: msg.options
            }
          ];
        });
      } else if (msg.type === 'typing_status') {
        setIsTyping(true);
        if (msg.message) {
          setTypingMessage(msg.message);
        }
      } else if (msg.type === 'system_event') {
        setMessages((prev) => [
          ...prev,
          {
            id: `sys_${Date.now()}`,
            sender: 'system',
            senderName: 'System',
            content: msg.message || '',
            timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else if (msg.type === 'case_resolved') {
        setMessages((prev) => [
          ...prev,
          {
            id: `res_${Date.now()}`,
            sender: 'assistant',
            senderName: 'RecallAI Memory Engine',
            content: msg.customer_message || 'Your issue has been resolved. The permanent fix has been saved to your product memory.',
            timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            deliveryStatus: 'Delivered'
          }
        ]);
      }
    });

    return () => {
      unsubscribe();
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
    };
  }, [customer.id, autoReadAloud]);

  const handleStartProductSupport = (product: PurchasedProduct) => {
    const isDifferentProduct = selectedProduct.id !== product.id;
    setSelectedProduct(product);
    setCurrentView('support');

    // Only re-initialize greeting if switching to a different product or no messages exist
    setMessages((prev) => {
      if (!isDifferentProduct && prev.length > 1) {
        return prev; // Preserve full multi-turn diagnostic progress
      }
      return [
        {
          id: `init_${Date.now()}`,
          sender: 'assistant',
          senderName: 'RecallAI Support',
          content: `I've opened the product record for your **${product.name}** (Order ${product.orderNumber} from ${product.platform}).\n\nWarranty: **${product.warrantyStatus}** | Delivery: **${product.deliveryStatus}**\n\nI already know your purchase history and previous support context. What problem are you experiencing?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          deliveryStatus: 'Read',
          options: product.commonProblems.slice(0, 3)
        }
      ];
    });
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    const curTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Local echo for instant UX
    const userMsg: MessageItem = {
      id: `user_${Date.now()}`,
      sender: 'customer',
      senderName: customer.name || 'Customer',
      content: text,
      timestamp: curTime,
      deliveryStatus: 'Sent'
    };

    // ALWAYS append sequentially to conversation history - NEVER overwrite or reset
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);
    setTypingMessage('🔍 Checking product information...');

    // Send to WebSocket with contextual product metadata
    liveWS.sendMessage(text, undefined, selectedProduct ? {
      name: selectedProduct.name,
      orderNumber: selectedProduct.orderNumber,
      platform: selectedProduct.platform,
      warrantyStatus: selectedProduct.warrantyStatus
    } : undefined);
  };

  const handleBookTechnician = () => {
    liveWS.bookTechnician(
      selectedTechnician,
      selectedSlot,
      `${selectedProduct.name} - Charging failure / Hardware check`
    );
    setShowBookingModal(false);
  };

  const filteredProducts = purchasedProducts.filter((p) => {
    if (platformFilter === 'All') return true;
    if (platformFilter === 'Other') return p.platform === 'Demo Partner Store';
    return p.platform.toLowerCase() === platformFilter.toLowerCase();
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* 1. TOP HEADER: POST-PURCHASE SUPPORT NAVIGATION */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm ring-2 ring-blue-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-base">
                RECALL<span className="text-blue-600">AI</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                Support Online
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 italic">
              "Bought it once. We'll remember it."
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setCurrentView('purchases')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              currentView === 'purchases'
                ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>My Purchases ({purchasedProducts.length})</span>
          </button>

          <button
            onClick={() => setCurrentView('support')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              currentView === 'support'
                ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Product Support Chat</span>
          </button>
        </div>

        {/* Support agent console shortcut */}
        {onOpenSupportAgent && (
          <button
            onClick={onOpenSupportAgent}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-slate-500" />
            <span>Agent Console</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          VIEW A: CUSTOMER HOME PAGE — MY PURCHASES & CONNECTED PLATFORMS (Sections 3, 5, 23, 34)
      ========================================================================= */}
      {currentView === 'purchases' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl w-full mx-auto">
          {/* Welcome Banner & Value Proposition (Sections 5 & 34) */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Post-Purchase Memory Platform
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                WELCOME BACK, {customer.name ? customer.name.toUpperCase().split(' ')[0] : 'SARAH'}
              </h1>
              <p className="text-sm font-medium text-slate-300">
                "How can we help with something you've purchased?"
              </p>
              <div className="pt-2 text-xs text-blue-200 font-semibold bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
                <strong>YOU BOUGHT IT. WE REMEMBER IT.</strong>
                <p className="font-normal text-slate-300 mt-0.5">
                  RecallAI connects post-purchase customer support with the products, orders, conversations, and solutions that already exist.
                </p>
              </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none"></div>
          </div>

          {/* Connected Shopping Platforms (Section 3) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                  <Store className="w-4 h-4 text-blue-600" />
                  <span>CONNECTED SHOPPING PLATFORMS</span>
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  RecallAI is an independent support platform with authorized webhook and order sync integrations.
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                4 Platforms Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {connectedPlatforms.map((plat) => (
                <div
                  key={plat.name}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{plat.logo}</span>
                      <span className="font-extrabold text-slate-900 text-sm">{plat.name}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
                      {plat.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Orders</span>
                      <strong className="text-slate-800 font-extrabold">{plat.ordersCount}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Last Sync</span>
                      <strong className="text-slate-700">{plat.lastSync}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Purchases Section (Section 5 & 23) */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black tracking-tight text-slate-900 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>MY PURCHASES</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Select any purchased product to begin natural, context-aware support.
                </p>
              </div>

              {/* Platform filter tabs (Section 23) */}
              <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
                {(['All', 'Amazon', 'Flipkart', 'Meesho', 'Other'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPlatformFilter(filter)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      platformFilter === filter
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid (Section 5) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((prod) => {
                const IconComponent =
                  prod.icon === 'laptop'
                    ? Laptop
                    : prod.icon === 'headphones'
                    ? Headphones
                    : prod.icon === 'smartphone'
                    ? Smartphone
                    : Package;

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Product Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                              {prod.name}
                            </h3>
                            <p className="text-xs font-semibold text-slate-500">{prod.category}</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {prod.platform} — Demo
                        </span>
                      </div>

                      {/* Product Metadata Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Order</span>
                          <strong className="text-blue-600 font-mono font-bold">{prod.orderNumber}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Purchased</span>
                          <strong className="text-slate-700">{prod.purchaseDate}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Delivery</span>
                          <strong className="text-emerald-700 font-bold flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            {prod.deliveryStatus}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Warranty</span>
                          <strong className="text-blue-700 font-bold flex items-center">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
                            {prod.warrantyStatus}
                          </strong>
                        </div>
                      </div>

                      {/* RecallAI Memory Badge (Section 8) */}
                      {prod.previousIssue && (
                        <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200/80 text-[11px] text-purple-900 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>
                              RecallAI Memory: <strong>{prod.previousIssue}</strong> (Previously resolved)
                            </span>
                          </div>
                          <span className="text-[9px] font-bold text-purple-700 uppercase">Context Indexed</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => handleStartProductSupport(prod)}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>Get Product Support</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW B: PRODUCT SUPPORT FLOW & NATURAL CHAT (Sections 6, 7, 8, 16, 17, 18)
      ========================================================================= */}
      {currentView === 'support' && (
        <div className="flex-1 flex flex-col overflow-hidden max-w-4xl w-full mx-auto bg-white sm:border-x border-slate-200">
          {/* Active Product Context Bar (Section 6) */}
          <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setCurrentView('purchases')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Back to My Purchases"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                    PRODUCT SUPPORT
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs font-bold text-slate-300">
                    {selectedProduct.platform} — Demo
                  </span>
                </div>
                <h2 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <span>{selectedProduct.name}</span>
                  <span className="text-blue-300 font-mono text-xs font-normal">
                    ({selectedProduct.orderNumber})
                  </span>
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {/* Voice Support Header Controls */}
              <button
                type="button"
                onClick={toggleListening}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
                title={isListening ? 'Click to stop listening' : 'Start Voice Support with AI'}
              >
                {isListening ? (
                  <>
                    <Radio className="w-3.5 h-3.5 animate-spin" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Talk to AI</span>
                  </>
                )}
              </button>

              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center space-x-1 animate-pulse cursor-pointer"
                  title="Stop AI voice playback"
                >
                  <Square className="w-3 h-3 fill-white" />
                  <span>Stop Voice</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (autoReadAloud) stopSpeaking();
                  setAutoReadAloud(!autoReadAloud);
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  autoReadAloud
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title={autoReadAloud ? 'Auto-voice read enabled: AI replies are spoken aloud' : 'Enable auto-voice read aloud'}
              >
                {autoReadAloud ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                <span className="hidden sm:inline">Auto-Voice {autoReadAloud ? 'ON' : 'OFF'}</span>
              </button>

              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold hidden md:inline">
                Warranty: {selectedProduct.warrantyStatus}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 hidden lg:inline">
                Delivery: {selectedProduct.deliveryStatus}
              </span>
            </div>
          </div>

          {/* Problem Prompt Suggestions (Section 6) */}
          <div className="bg-slate-50 px-4 sm:px-6 py-2.5 border-b border-slate-200 overflow-x-auto">
            <div className="flex items-center space-x-2 whitespace-nowrap text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                Quick Prompts:
              </span>
              {selectedProduct.commonProblems.map((prob) => (
                <button
                  key={prob}
                  type="button"
                  onClick={() => handleSendMessage(prob)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-semibold border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                >
                  "{prob}"
                </button>
              ))}
            </div>
          </div>

          {/* Messages Stream (Natural Chat - Section 7) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-100/60">
            {messages.map((m) => {
              const isUser = m.sender === 'customer';
              const isTech = m.sender === 'technician';
              const isSystem = m.sender === 'system';

              if (isSystem) {
                return (
                  <div
                    key={m.id}
                    className="p-2 text-center text-[11px] font-bold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200"
                  >
                    {m.content}
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[85%] sm:max-w-[75%] ${
                      isUser ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        isUser
                          ? 'bg-slate-900 text-white'
                          : isTech
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-blue-600 text-white shadow-xs'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : isTech ? <Wrench className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : isTech
                          ? 'bg-indigo-50 border border-indigo-200 text-slate-900 rounded-tl-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                      }`}
                    >
                      {/* Sender label */}
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-black/5 text-[10px] font-black uppercase tracking-wider">
                        <span>{m.senderName}</span>
                        <div className="flex items-center space-x-2">
                          {!isUser && (
                            <button
                              type="button"
                              onClick={() => speakText(m.content, m.id)}
                              className="text-slate-500 hover:text-blue-600 transition-colors p-0.5 rounded cursor-pointer flex items-center space-x-1"
                              title={currentlySpeakingId === m.id ? 'Stop voice reading' : 'Listen to this response aloud'}
                            >
                              {currentlySpeakingId === m.id ? (
                                <Square className="w-3 h-3 text-amber-600 fill-amber-600 animate-pulse" />
                              ) : (
                                <Volume2 className="w-3 h-3 text-slate-500 hover:text-blue-600" />
                              )}
                              <span className="text-[9px] font-normal normal-case">
                                {currentlySpeakingId === m.id ? 'Stop' : 'Listen'}
                              </span>
                            </button>
                          )}
                          <span className="font-normal opacity-60 text-[9px]">{m.timestamp}</span>
                        </div>
                      </div>

                      <div className="whitespace-pre-line font-medium">{m.content}</div>

                      {/* Action Chips under Assistant Message (Section 17) */}
                      {m.options && m.options.length > 0 && !isUser && (
                        <div className="pt-2.5 mt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {m.options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                if (opt.includes('Technician')) {
                                  setShowBookingModal(true);
                                } else {
                                  handleSendMessage(opt);
                                }
                              }}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shadow-2xs cursor-pointer ${
                                opt.includes('Technician')
                                  ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator with Section 7 Stages */}
            {isTyping && (
              <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs max-w-sm animate-pulse">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-bold text-[11px]">{typingMessage}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar with Integrated Mic & Keyboard */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-2">
            {isListening && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold animate-pulse">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  <span>Listening... Speak your problem clearly into your microphone</span>
                </div>
                <button
                  type="button"
                  onClick={toggleListening}
                  className="text-rose-700 font-bold hover:underline cursor-pointer"
                >
                  Done Speaking
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-400 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
                title={isListening ? 'Click to stop listening' : 'Click to speak your message (Voice-to-Text)'}
              >
                {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-slate-700" />}
              </button>

              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Describe your problem or click 🎙️ to speak..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputVal.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>⌨️ Keyboard or 🎙️ Voice supported. Zero canned messages guaranteed.</span>
              <button
                type="button"
                onClick={() => setShowBookingModal(true)}
                className="text-blue-600 font-bold hover:underline"
              >
                Need a technician?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          BOOK A TECHNICIAN MODAL (Sections 17 & 18)
      ========================================================================= */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">
                    BOOK A TECHNICIAN
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Product: {selectedProduct.name} ({selectedProduct.orderNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Context Summary */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1 text-[11px]">
              <div><strong>Product:</strong> {selectedProduct.name}</div>
              <div><strong>Platform:</strong> {selectedProduct.platform}</div>
              <div><strong>Warranty:</strong> <span className="text-emerald-700 font-bold">Active</span></div>
              <div><strong>Forwarded Context:</strong> Order #{selectedProduct.orderNumber}, previous troubleshooting history, and current charging failure.</div>
            </div>

            {/* Available Technicians (Section 18) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase block">
                Available Technicians:
              </label>
              <div className="space-y-1.5">
                {[
                  { name: 'Technician A', status: 'Available', state: 'online' },
                  { name: 'Technician B', status: 'Available', state: 'online' },
                  { name: 'Technician C', status: 'Busy', state: 'busy' }
                ].map((tech) => (
                  <div
                    key={tech.name}
                    onClick={() => tech.state !== 'busy' && setSelectedTechnician(tech.name)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      tech.state === 'busy'
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                        : selectedTechnician === tech.name
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 text-xs">{tech.name}</span>
                      <span className="text-[10px] text-slate-500">Certified Hardware Specialist</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tech.state === 'online'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {tech.state === 'online' ? '🟢 Available' : '🔴 Busy'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Appointments (Section 18) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase block">
                Available Appointments (Today):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['10:00 AM', '12:30 PM', '3:00 PM', '5:30 PM'].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all ${
                      selectedSlot === slot
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm Button */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBookTechnician}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-xs cursor-pointer"
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerChatView;
