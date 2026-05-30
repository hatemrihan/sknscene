'use client'

import React from 'react'
import Link from 'next/link'
import Nav from '@/app/sections/nav'
import Footer from '@/app/sections/footer'

const ShippingPage = () => {
    return (
        <>
            <Nav />
            <main className="min-h-screen bg-[#F5F2EB]  pt-20 transition-colors duration-300" dir="ltr">
                <div className="px-4 py-16">
                    <h1 className="font-extrabold pt-4 text-black max-w-4xl mx-auto px-10 mb-4 text-lg text-left">
                        Shipping & Delivery
                    </h1>

                    <div className="px-10 space-y-6 text-black transition-colors duration-300 max-w-4xl mx-auto">
                        <div className="space-y-4">
                            <p className="leading-relaxed text-sm text-left">
                                All Sknscene products are batch-formulated with meticulous attention to detail. Each formula is carefully prepared and packaged before dispatch, ensuring that every product meets our exacting standards of efficacy, quality, and freshness.
                            </p>
                            <p className="leading-relaxed text-sm text-left">
                                Please allow 2–3 business days for order processing and packaging before shipment. This timeframe ensures that each order receives the dedicated attention it deserves. Once your order is ready and dispatched, you will receive a confirmation email with detailed tracking information.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-left">
                                Domestic Orders (Lebanon)
                            </h2>
                            <p className="leading-relaxed text-sm text-left">
                                Orders within Lebanon are shipped via our trusted local courier partners, ensuring reliable and efficient delivery. Your items will typically arrive within 1–3 business days after dispatch, depending on your specific location within the country.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-left">
                                International Orders
                            </h2>
                            <p className="leading-relaxed text-sm text-left">
                                International shipping is available worldwide through our global logistics network. Estimated delivery time is 5–10 business days, depending on your destination and local customs procedures. We work with reliable international carriers to ensure your order arrives safely.
                            </p>
                            <p className="leading-relaxed text-sm text-left">
                                Please note that international customers are responsible for any duties, taxes, or import fees that may apply upon arrival in their country. These charges are determined by local customs authorities and are separate from your order total.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-left">
                                Premium Packaging
                            </h2>
                            <p className="leading-relaxed text-sm text-left">
                                Each product is housed in our signature Sknscene packaging, custom-designed to protect the active ingredients from light and air, ensuring maximum stability and product life. Our packaging reflects the high standards we hold for our skincare.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-normal pt-6 text-black underline text-left">
                                Batch-Formulated Policy
                            </h2>
                            <p className="leading-relaxed text-sm text-left">
                                Because our products are skincare formulas, returns are only accepted if the item remains unopened and fully sealed in its original packaging within 7 days of delivery. Once the seal is broken or the product is used, returns cannot be accepted due to health, safety, and hygiene standards.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-neutral-200">
                            <p className="leading-relaxed text-sm text-left">
                                For any inquiries regarding shipping, orders, or our policies, please don&apos;t hesitate to contact our customer service team at <a href="mailto:info@sknscene.com" className="text-neutral-900 hover:text-neutral-600 underline font-medium">info@sknscene.com</a>
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

export default ShippingPage
