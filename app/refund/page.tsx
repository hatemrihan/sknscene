'use client'

import React, { useState } from 'react'
import Nav from '@/app/sections/nav'
import Footer from '@/app/sections/footer'
import { motion } from 'framer-motion'

const RefundPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        orderNumber: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const res = await fetch('/api/return', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Something went wrong');

            setStatus('success');
            setFormData({ email: '', orderNumber: '' });
        } catch (error) {
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
        }
    };

    if (status === 'success') {
        return (
            <>
                <Nav />
                <div className="min-h-[60vh] flex items-center justify-center px-4" dir="ltr">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-md"
                    >
                        <h2 className="text-2xl mb-4 font-light">
                            Request Submitted
                        </h2>
                        <p className="text-neutral-600 mb-8">
                            Thank you. You will receive an email confirming your request shortly with further instructions.
                        </p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="text-sm underline underline-offset-4 hover:text-neutral-500 transition-colors"
                        >
                            Submit another request
                        </button>
                    </motion.div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Nav />
            <main className="min-h-screen bg-[#F5F2EB] pt-20 transition-colors duration-300" dir="ltr">
                <div className="px-4 py-16">
                    <div className="px-10 space-y-6 text-black transition-colors duration-300 max-w-4xl mx-auto">
                        <h2 className="pt-4 mb-4 text-black font-bold text-center text-lg">
                            Return Form
                        </h2>

                        <div className="text-center mb-8">
                            <p className="text-sm max-w-2xl mx-auto text-left">
                                To submit your return request, please complete the form below. You will receive an email confirming your request, and a member of our Customer Care team will send you a unique authorization number together with return instructions.
                            </p>
                        </div>

                        <section>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-12">
                                    <div className="text-center text-neutral-900 text-sm font-light mb-6">
                                        Please enter your email and order number:
                                    </div>

                                    <div className="space-y-8">
                                        <div className="relative">
                                            <input
                                                type="email"
                                                id="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="peer w-full py-2 bg-transparent border-b border-neutral-200 text-neutral-900 placeholder-transparent focus:outline-none focus:border-neutral-900 transition-colors rounded-none text-xs text-left"
                                                placeholder="Email"
                                            />
                                            <label
                                                htmlFor="email"
                                                className="absolute left-0 -top-3 text-neutral-500 text-xs transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:text-neutral-400 peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-neutral-500 peer-focus:text-xs"
                                            >
                                                Email:
                                            </label>
                                        </div>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="orderNumber"
                                                required
                                                value={formData.orderNumber}
                                                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                                                className="peer w-full py-2 bg-transparent border-b border-neutral-200 text-neutral-900 placeholder-transparent focus:outline-none focus:border-neutral-900 transition-colors rounded-none text-xs text-left"
                                                placeholder="Order Number"
                                            />
                                            <label
                                                htmlFor="orderNumber"
                                                className="absolute left-0 -top-3 text-neutral-500 text-xs transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:text-neutral-400 peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-neutral-500 peer-focus:text-xs"
                                            >
                                                Order Number:
                                            </label>
                                        </div>
                                    </div>

                                    {status === 'error' && (
                                        <p className="text-red-600 text-center text-sm">{errorMessage}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full bg-[#222] text-white py-4 px-8 text-xs uppercase tracking-[0.2em] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {status === 'loading' ? 'Submitting...' : 'Submit'}
                                    </button>
                                </form>
                            </motion.div>
                        </section>
                    </div>
                </div>
                <Footer />
            </main>
        </>
    )
}

export default RefundPage
