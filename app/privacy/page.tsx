'use client'

import React from 'react'
import Link from 'next/link'
import Nav from '@/app/sections/nav'
import Footer from '@/app/sections/footer'

const PrivacyPage = () => {
    return (
        <>
            <Nav />
            <main className="min-h-screen bg-[#F5F2EB] pt-20 transition-colors duration-300" dir="ltr">
                <div className="px-4 py-16">
                    <h1 className="font-extrabold pt-4 text-black max-w-4xl mx-auto px-10 mb-4 text-lg text-left">
                        Privacy & Policy
                    </h1>

                    <div className="px-10 space-y-6 text-black transition-colors duration-300 max-w-4xl mx-auto">
                        <div className="space-y-4">
                            <p className="leading-relaxed text-sm text-left">
                                Sknscene values your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard information when you visit our website sknscene.com (the &quot;Site&quot;) or interact with us online.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-normal pt-6 text-black underline text-left">
                                1. Information We Collect
                            </h3>
                            <p className="leading-relaxed text-sm text-left">
                                We collect information you provide directly to us, such as when you create an account, place an order, subscribe to our newsletter, or contact our customer care team. This may include your name, email address, shipping and billing details, and payment information. We also collect certain technical information automatically, including your IP address, browser type, and usage data, to help us improve our Site&apos;s performance and user experience.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-normal pt-6 text-black underline text-left">
                                2. How We Use Your Information
                            </h3>
                            <p className="leading-relaxed text-sm text-left">
                                Your information is used to process and fulfill orders, communicate with you about purchases and updates, improve our website and services, send marketing communications (only with your consent), and comply with legal obligations and prevent fraud.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-normal pt-6 text-black underline text-left">
                                3. Sharing Your Information
                            </h3>
                            <p className="leading-relaxed text-sm text-left">
                                We do not sell your personal data. We only share information with trusted service providers who help us operate our website, process payments, and deliver orders—always under strict confidentiality agreements.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-normal pt-6 text-black underline text-left">
                                4. International Access
                            </h3>
                            <p className="leading-relaxed text-sm text-left">
                                As Sknscene serves a global audience, your information may be processed in different countries. Regardless of location, we apply the same level of care and protection to your data.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-normal pt-6 text-black underline text-left">
                                5. Data Security
                            </h3>
                            <p className="leading-relaxed text-sm text-left">
                                We use industry-standard measures to protect your information from unauthorized access, misuse, or disclosure. However, no system is entirely secure, and you share your information at your own risk.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-normal pt-6 text-black underline text-left">
                                6. Your Rights
                            </h3>
                            <p className="leading-relaxed text-sm text-left">
                                You have the right to access, correct, or delete your personal data at any time. To make a request or update your preferences, contact us at <a href="mailto:info@sknscene.com" className="text-neutral-900 hover:text-neutral-600 underline font-medium">info@sknscene.com</a>. You may also unsubscribe from our communications at any time.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-normal pt-6 text-black underline text-left">
                                7. Changes to this Policy
                            </h3>
                            <p className="leading-relaxed text-sm text-left">
                                We may update this policy periodically. Continued use of our services indicates your acceptance of any changes.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-normal pt-6 text-black underline text-left">
                                8. Contact Us
                            </h3>
                            <p className="leading-relaxed text-sm text-left">
                                For any questions about this Privacy Policy or how we handle your information, please contact our team at: <a href="mailto:info@sknscene.com" className="text-neutral-900 hover:text-neutral-600 underline font-medium">info@sknscene.com</a>
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href="/"
                            className="inline-block w-full max-w-xs mx-auto bg-[#222] text-white py-4 px-8 text-xs uppercase tracking-[0.2em] hover:bg-black transition-colors"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        </>
    )
}

export default PrivacyPage
