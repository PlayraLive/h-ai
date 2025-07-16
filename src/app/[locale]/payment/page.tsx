'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  Shield, 
  ArrowLeft,
  Bitcoin,
  Wallet,
  CheckCircle,
  AlertCircle,
  Lock,
  DollarSign
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { cn, formatCurrency } from '@/lib/utils';

export default function PaymentPage({ params: { locale } }: { params: { locale: string } }) {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto'>('stripe');
  const [cryptoType, setCryptoType] = useState('bitcoin');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const projectDetails = {
    title: 'AI Logo Design for TechCorp',
    freelancer: 'Alex Chen',
    amount: 1500,
    platformFee: 150, // 10%
    total: 1650
  };

  const cryptoOptions = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: Bitcoin },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: Wallet },
    { id: 'usdt', name: 'Tether', symbol: 'USDT', icon: DollarSign }
  ];

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Processing payment:', { paymentMethod, cardData, cryptoType });
    // Handle payment processing
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href={`/${locale}/dashboard`}
              className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Secure Payment</h1>
            <p className="text-gray-400">Complete your payment to start the project</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <div className="glass-card p-6 rounded-2xl">
                <h2 className="text-xl font-semibold text-white mb-6">Payment Method</h2>
                
                {/* Payment Method Selection */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={cn(
                      "flex flex-col items-center space-y-3 p-6 rounded-xl border-2 transition-all duration-300",
                      paymentMethod === 'stripe'
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                    )}
                  >
                    <CreditCard className="w-8 h-8 text-purple-400" />
                    <div className="text-center">
                      <div className="text-white font-medium">Credit Card</div>
                      <div className="text-sm text-gray-400">Visa, Mastercard, Amex</div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('crypto')}
                    className={cn(
                      "flex flex-col items-center space-y-3 p-6 rounded-xl border-2 transition-all duration-300",
                      paymentMethod === 'crypto'
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                    )}
                  >
                    <Bitcoin className="w-8 h-8 text-orange-400" />
                    <div className="text-center">
                      <div className="text-white font-medium">Cryptocurrency</div>
                      <div className="text-sm text-gray-400">BTC, ETH, USDT</div>
                    </div>
                  </button>
                </div>

                <form onSubmit={handlePayment}>
                  {paymentMethod === 'stripe' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          required
                          value={cardData.number}
                          onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                          className="input-field w-full"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            required
                            value={cardData.expiry}
                            onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                            className="input-field w-full"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            CVC
                          </label>
                          <input
                            type="text"
                            required
                            value={cardData.cvc}
                            onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                            className="input-field w-full"
                            placeholder="123"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          required
                          value={cardData.name}
                          onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                          className="input-field w-full"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'crypto' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-4">
                          Select Cryptocurrency
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          {cryptoOptions.map((crypto) => {
                            const Icon = crypto.icon;
                            return (
                              <button
                                key={crypto.id}
                                type="button"
                                onClick={() => setCryptoType(crypto.id)}
                                className={cn(
                                  "flex flex-col items-center space-y-2 p-4 rounded-xl border-2 transition-all duration-300",
                                  cryptoType === crypto.id
                                    ? "border-purple-500 bg-purple-500/10"
                                    : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                                )}
                              >
                                <Icon className="w-6 h-6 text-orange-400" />
                                <div className="text-center">
                                  <div className="text-white text-sm font-medium">{crypto.symbol}</div>
                                  <div className="text-xs text-gray-400">{crypto.name}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 p-4 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium text-yellow-400">Payment Instructions</span>
                        </div>
                        <p className="text-sm text-gray-300">
                          After clicking "Pay Now", you'll receive a wallet address and QR code for payment. 
                          The payment will be confirmed automatically once the transaction is verified on the blockchain.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Secure Payment</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Your payment information is encrypted and secure. Funds are held in escrow until project completion.
                    </p>
                  </div>

                  <button type="submit" className="w-full btn-primary mt-8">
                    <Lock className="w-4 h-4 mr-2" />
                    Pay {formatCurrency(projectDetails.total)}
                  </button>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-medium mb-1">{projectDetails.title}</h4>
                    <p className="text-sm text-gray-400">by {projectDetails.freelancer}</p>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Project Amount</span>
                      <span className="text-white">{formatCurrency(projectDetails.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Platform Fee (10%)</span>
                      <span className="text-white">{formatCurrency(projectDetails.platformFee)}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 flex justify-between">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-white font-semibold">{formatCurrency(projectDetails.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Protection */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Payment Protection</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <div className="text-white text-sm font-medium">Escrow Protection</div>
                      <div className="text-xs text-gray-400">Funds held until work is completed</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <div className="text-white text-sm font-medium">Dispute Resolution</div>
                      <div className="text-xs text-gray-400">24/7 support for any issues</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <div className="text-white text-sm font-medium">Refund Guarantee</div>
                      <div className="text-xs text-gray-400">Full refund if work not delivered</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Our support team is available 24/7 to assist you with any payment questions.
                </p>
                <Link href={`/${locale}/support`} className="btn-secondary w-full text-center">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
