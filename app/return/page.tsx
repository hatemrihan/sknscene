'use client'

import React from 'react'
import Link from 'next/link'
import Nav from '@/app/sections/nav'
import Footer from '@/app/sections/footer'

const ReturnPage = () => {
    return (
        <>
            <Nav />
            <main className="min-h-screen bg-[#F5F2EB] pt-20 transition-colors duration-300" dir="ltr">
                <div className="px-4 py-16">
                    <h1 className="font-extrabold pt-4 text-black max-w-4xl mx-auto px-10 mb-4 text-lg text-left">
                        Returns & Exchanges
                    </h1>

                    <div className="px-10 space-y-6 text-black transition-colors duration-300 max-w-4xl mx-auto">
                        <div className="space-y-4">
                            <p className="leading-relaxed text-sm text-left">
                                Due to the hygiene, safety, and health protection standards of cosmetic products, returns or exchanges cannot be accepted once a skincare product has been opened or if its protective seal is broken. We only accept returns or exchanges for items that are completely unopened, unused, and in their original sealed packaging.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <ul className="space-y-3 leading-relaxed text-sm list-none text-left">
                                <li>
                                    • If you wish to return an unopened and sealed product, please email us within 7 days of receiving your order.
                                </li>
                                <li>
                                    • Our Customer Care team will review your request and contact you within 1 business day with a Return Authorization (RA) and next steps.
                                </li>
                                <li>
                                    • Only items with an approved RA can be returned.
                                </li>
                                <li>
                                    • To be eligible for return, the item must be in its original, sealed condition, with all packaging intact.
                                </li>
                                <li>
                                    • Once received and inspected, please allow up to 10 business days for processing.
                                </li>
                                <li>
                                    • If the item does not meet these conditions (i.e. if the product is opened, unsealed, or used), the return will be denied and the item will be sent back to you.
                                </li>
                                <li>
                                    • Shipping fees are non-refundable.
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-left">
                                Product Exchanges
                            </h2>
                            <ul className="space-y-3 leading-relaxed text-sm list-none text-left">
                                <li>
                                    • Exchanges are only accepted for completely unopened and sealed products.
                                </li>
                                <li>
                                    • Please contact <a href="mailto:info@sknscene.com" className="text-neutral-900 hover:text-neutral-600 underline font-medium">info@sknscene.com</a> within 7 days of delivery to request an exchange.
                                </li>
                                <li>
                                    • The product must be unused, sealed, and returned in its original outer packaging.
                                </li>
                                <li>
                                    • Shipping costs for exchanges are the responsibility of the client.
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-left">
                                Regional Returns
                            </h2>
                            <ul className="space-y-3 leading-relaxed text-sm list-none text-left">
                                <li>
                                    • Sknscene will provide a prepaid return label for approved returns originating from Lebanon.
                                </li>
                                <li>
                                    • For all other regions, the client is responsible for arranging and covering the cost of return shipping once the Return Authorization has been issued.
                                </li>
                            </ul>
                        </div>

                        <div className="pt-6 border-t border-neutral-200">
                            <p className="leading-relaxed text-sm text-left">
                                For further information or assistance, please contact Customer Care at <a href="mailto:info@sknscene.com" className="text-neutral-900 hover:text-neutral-600 underline font-medium">info@sknscene.com</a>
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

export default ReturnPage
