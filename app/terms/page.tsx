'use client'

import React from 'react'
import Link from 'next/link'
import Nav from '@/app/sections/nav'
import Footer from '@/app/sections/footer'

const TermsPage = () => {
    return (
        <>
            <Nav />
            <main className="min-h-screen bg-[#F5F2EB] pt-20 transition-colors duration-300" dir="ltr">
                <div className="px-4 py-16">
                    <h1 className="font-extrabold pt-4 text-black max-w-4xl mx-auto px-10 mb-4 text-lg text-left">
                        Terms of Service
                    </h1>

                    <div className="px-10 space-y-6 text-black transition-colors duration-300 max-w-4xl mx-auto">
                        <div className="space-y-4">
                            <p className="leading-relaxed text-sm text-left">
                                Welcome to sknscene.com. The Site is owned and operated by Sknscene. By accessing or using this Site, you agree to the following terms and conditions. Please read them carefully before using or making a purchase.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-left">
                                1. General Terms
                            </h2>
                            <p className="leading-relaxed text-sm text-left">
                                By using our Site, you agree to these Terms of Use and all applicable laws. If you do not agree, please do not use the site. We may update or modify these Terms at any time without prior notice. Continued use of the Site after changes means you accept those revisions.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-left">
                                2. Eligibility
                            </h2>
                            <p className="leading-relaxed text-sm text-left">
                                You must be at least 16 years old to make a purchase on our site. By placing an order, you confirm that all information provided is accurate and complete.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-left">
                                3. Products and Availability
                            </h2>
                            <p className="leading-relaxed text-sm text-left">
                                All products on sknscene.com are subject to availability. We reserve the right to modify, limit, or discontinue items at any time without notice. Prices are displayed in the currency indicated on the Site and may change without notice.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-left">
                                4. Orders and Payments
                            </h2>
                            <p className="leading-relaxed text-sm text-left">
                                When you place an order, you agree to provide accurate billing, shipping, and payment details. Orders are subject to confirmation and acceptance. Sknscene reserves the right to cancel or refuse any order at our discretion, including for suspected fraud or unauthorized activity.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-left">
                                5. Shipping and Returns
                            </h2>
                            <p className="leading-relaxed text-sm text-left">
                                We offer international shipping. Delivery times and costs vary by region and are displayed during checkout. For information on returns, please refer to our Return Policy available on the Site.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-left">
                                6. Intellectual Property
                            </h2>
                            <p className="leading-relaxed text-sm text-left">
                                All content on this Site—including designs, images, logos, text, graphics, and photography—is the property of Sknscene and protected under international copyright and trademark laws. You may not reproduce, distribute, or use any material from the Site without our prior written consent.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-left">
                                7. User Account
                            </h2>
                            <p className="leading-relaxed text-sm text-left">
                                If you create an account on sknscene.com, you are responsible for maintaining its confidentiality and for all activity under your credentials. We reserve the right to suspend or terminate accounts that violate these Terms or involve fraudulent behavior.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-left">
                                8. Limitation of Liability
                            </h2>
                            <p className="leading-relaxed text-sm text-left">
                                While we strive to ensure accuracy and reliability, Sknscene is not responsible for any indirect, incidental, or consequential damages arising from the use or inability to use our Site or products.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-left">
                                9. Governing Law
                            </h2>
                            <p className="leading-relaxed text-sm text-left">
                                These Terms are governed by and construed in accordance with the laws of Lebanon, without regard to conflict of law principles.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-left">
                                10. Contact
                            </h2>
                            <p className="leading-relaxed text-sm text-left">
                                For any questions about these Terms, please contact our customer care team at: <a href="mailto:info@sknscene.com" className="text-neutral-900 hover:text-neutral-600 underline font-medium">info@sknscene.com</a>
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

export default TermsPage
