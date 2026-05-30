import * as React from 'react';

// ─── Shared Types ─────────────────────────────────────────────

interface OrderItemProps {
    name: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
    attributes?: Record<string, string>;
}

interface OrderEmailProps {
    customerName: string;
    orderId: string;
    orderItems: OrderItemProps[];
    subtotal: number;
    shippingCost: number;
    codFee: number;
    discountAmount: number;
    promoCode?: string;
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: {
        governorate: string;
        city: string;
        address: string;
        apartment?: string;
    };
    customerPhone: string;
    customerEmail?: string;
}

// ─── Styles ───────────────────────────────────────────────────

const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
const dark = '#1c1917';
const muted = '#78716c';
const light = '#a8a29e';
const border = '#e7e5e4';
const bg = '#fafaf9';

// ─── Customer Order Confirmation ──────────────────────────────

export const OrderEmailTemplate: React.FC<Readonly<OrderEmailProps>> = (props) => (
    <div style={{ fontFamily: font, backgroundColor: '#f4f4f5', margin: 0, padding: '40px 0' }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <tbody>
                {/* Header */}
                <tr>
                    <td style={{ backgroundColor: dark, padding: '32px 40px', textAlign: 'center' }}>
                        <h1 style={{ color: '#fff', margin: 0, fontSize: '24px', fontWeight: 700 }}>Sknscene</h1>
                    </td>
                </tr>
                {/* Body */}
                <tr>
                    <td style={{ padding: '40px' }}>
                        <h2 style={{ color: dark, margin: '0 0 8px', fontSize: '20px' }}>Thank you, {props.customerName}!</h2>
                        <p style={{ color: muted, margin: '0 0 24px', fontSize: '14px' }}>
                            Your order <strong style={{ color: dark }}>{props.orderId}</strong> has been confirmed.
                        </p>
                        <ItemsTable {...props} />
                        <AddressBlock {...props} />
                    </td>
                </tr>
                {/* Footer */}
                <tr>
                    <td style={{ padding: '24px 40px', backgroundColor: bg, textAlign: 'center', borderTop: `1px solid ${border}` }}>
                        <p style={{ color: light, fontSize: '12px', margin: 0 }}>
                            Payment: {props.paymentMethod} · Phone: {props.customerPhone}
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
);

// ─── Admin Order Notification ─────────────────────────────────

export const AdminOrderEmailTemplate: React.FC<Readonly<OrderEmailProps>> = (props) => (
    <div style={{ fontFamily: font, backgroundColor: '#f4f4f5', margin: 0, padding: '40px 0' }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <tbody>
                {/* Header */}
                <tr>
                    <td style={{ backgroundColor: '#dc2626', padding: '24px 40px', textAlign: 'center' }}>
                        <h1 style={{ color: '#fff', margin: 0, fontSize: '20px', fontWeight: 700 }}>🛒 New Order Received</h1>
                    </td>
                </tr>
                {/* Body */}
                <tr>
                    <td style={{ padding: '32px 40px' }}>
                        <h2 style={{ color: dark, margin: '0 0 4px', fontSize: '18px' }}>Order #{props.orderId}</h2>
                        <p style={{ color: muted, margin: '0 0 24px', fontSize: '13px' }}>
                            {new Date().toLocaleString('en-EG', { timeZone: 'Africa/Cairo' })}
                        </p>

                        {/* ── Customer Info ── */}
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '24px', backgroundColor: bg, borderRadius: '8px', padding: '16px' }}>
                            <tbody>
                                <tr><td style={{ padding: '16px' }}>
                                    <p style={{ margin: '0 0 4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: light, fontWeight: 600 }}>Customer</p>
                                    <p style={{ margin: '0 0 4px', color: dark, fontSize: '15px', fontWeight: 600 }}>{props.customerName}</p>
                                    <p style={{ margin: '0 0 2px', color: muted, fontSize: '14px' }}>📱 {props.customerPhone}</p>
                                    {props.customerEmail && (
                                        <p style={{ margin: '0', color: muted, fontSize: '14px' }}>✉️ {props.customerEmail}</p>
                                    )}
                                </td></tr>
                            </tbody>
                        </table>

                        {/* ── Delivery Address ── */}
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '24px', backgroundColor: bg, borderRadius: '8px' }}>
                            <tbody>
                                <tr><td style={{ padding: '16px' }}>
                                    <p style={{ margin: '0 0 4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: light, fontWeight: 600 }}>Delivery Address</p>
                                    <p style={{ margin: '0 0 2px', color: dark, fontSize: '14px' }}>{props.shippingAddress.address}</p>
                                    {props.shippingAddress.apartment && (
                                        <p style={{ margin: '0 0 2px', color: muted, fontSize: '14px' }}>Apt: {props.shippingAddress.apartment}</p>
                                    )}
                                    <p style={{ margin: '0', color: muted, fontSize: '14px' }}>
                                        {props.shippingAddress.city}{props.shippingAddress.city && props.shippingAddress.governorate ? ', ' : ''}{props.shippingAddress.governorate}
                                    </p>
                                </td></tr>
                            </tbody>
                        </table>

                        {/* ── Items ── */}
                        <ItemsTable {...props} showVariants />

                        {/* ── Payment Method ── */}
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginTop: '16px', backgroundColor: bg, borderRadius: '8px' }}>
                            <tbody>
                                <tr><td style={{ padding: '16px' }}>
                                    <p style={{ margin: '0 0 4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: light, fontWeight: 600 }}>Payment Method</p>
                                    <p style={{ margin: '0', color: dark, fontSize: '15px', fontWeight: 600 }}>{props.paymentMethod}</p>
                                </td></tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
);

// ─── Shared: Items Table ──────────────────────────────────────

const ItemsTable: React.FC<OrderEmailProps & { showVariants?: boolean }> = (props) => (
    <table width="100%" cellPadding="0" cellSpacing="0">
        <tbody>
            {/* Header row */}
            <tr>
                <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: `2px solid ${dark}`, color: dark, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Item</th>
                <th style={{ textAlign: 'center', padding: '8px 0', borderBottom: `2px solid ${dark}`, color: dark, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '8px 0', borderBottom: `2px solid ${dark}`, color: dark, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</th>
            </tr>
            {/* Item rows */}
            {props.orderItems.map((item, i) => (
                <tr key={i}>
                    <td style={{ padding: '12px 0', borderBottom: `1px solid ${border}`, color: dark, fontSize: '14px' }}>
                        {item.name}
                        {props.showVariants && (item.size || item.color || item.attributes) && (
                            <span style={{ display: 'block', color: muted, fontSize: '12px', marginTop: '2px' }}>
                                {[
                                    item.size && `Size: ${item.size}`,
                                    item.color && `Color: ${item.color}`,
                                    ...(item.attributes
                                        ? Object.entries(item.attributes)
                                            .filter(([k]) => k !== 'size' && k !== 'color')
                                            .map(([k, v]) => `${k}: ${v}`)
                                        : []),
                                ].filter(Boolean).join(' · ')}
                            </span>
                        )}
                    </td>
                    <td style={{ padding: '12px 0', borderBottom: `1px solid ${border}`, color: muted, fontSize: '14px', textAlign: 'center' }}>×{item.quantity}</td>
                    <td style={{ padding: '12px 0', borderBottom: `1px solid ${border}`, color: dark, fontSize: '14px', textAlign: 'right', fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString()} USD</td>
                </tr>
            ))}
            {/* Subtotal */}
            <tr>
                <td colSpan={2} style={{ padding: '8px 0', color: muted, fontSize: '13px' }}>Subtotal</td>
                <td style={{ padding: '8px 0', textAlign: 'right', color: muted, fontSize: '13px' }}>{props.subtotal.toLocaleString()} USD</td>
            </tr>
            {/* Shipping */}
            <tr>
                <td colSpan={2} style={{ padding: '8px 0', color: muted, fontSize: '13px' }}>Shipping</td>
                <td style={{ padding: '8px 0', textAlign: 'right', color: muted, fontSize: '13px' }}>{props.shippingCost.toLocaleString()} USD</td>
            </tr>
            {/* COD Fee */}
            {props.codFee > 0 && (
                <tr>
                    <td colSpan={2} style={{ padding: '8px 0', color: muted, fontSize: '13px' }}>COD Fee</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: muted, fontSize: '13px' }}>{props.codFee.toLocaleString()} USD</td>
                </tr>
            )}
            {/* Discount */}
            {props.discountAmount > 0 && (
                <tr>
                    <td colSpan={2} style={{ padding: '8px 0', color: '#16a34a', fontSize: '13px' }}>
                        Discount{props.promoCode ? ` (${props.promoCode})` : ''}
                    </td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#16a34a', fontSize: '13px' }}>-{props.discountAmount.toLocaleString()} USD</td>
                </tr>
            )}
            {/* Total */}
            <tr>
                <td colSpan={2} style={{ padding: '16px 0 0', fontSize: '16px', fontWeight: 700, color: dark, borderTop: `2px solid ${dark}` }}>Total</td>
                <td style={{ padding: '16px 0 0', textAlign: 'right', fontSize: '16px', fontWeight: 700, color: dark, borderTop: `2px solid ${dark}` }}>{props.totalAmount.toLocaleString()} USD</td>
            </tr>
        </tbody>
    </table>
);

// ─── Shared: Address Block ────────────────────────────────────

const AddressBlock: React.FC<Pick<OrderEmailProps, 'shippingAddress'>> = ({ shippingAddress }) => (
    <div style={{ marginTop: '32px', padding: '20px', backgroundColor: bg, borderRadius: '8px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: light, fontWeight: 600 }}>Delivery Address</p>
        <p style={{ margin: 0, color: dark, fontSize: '14px' }}>
            {shippingAddress.address}{shippingAddress.apartment ? `, ${shippingAddress.apartment}` : ''}
        </p>
        <p style={{ margin: '4px 0 0', color: muted, fontSize: '14px' }}>
            {shippingAddress.city}{shippingAddress.city && shippingAddress.governorate ? ', ' : ''}{shippingAddress.governorate}
        </p>
    </div>
);
