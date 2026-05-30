'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Send, Trash2, Search, Mail, CheckCircle2, XCircle, RefreshCw, X, HelpCircle, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface Subscriber {
    id: string;
    email: string;
    subscribedAt: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdminNewsletterPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Compose form
    const [showCompose, setShowCompose] = useState(false);
    const [sendForm, setSendForm] = useState({ subject: '', heading: '', message: '' });
    const [recipientType, setRecipientType] = useState<'all' | 'selected'>('all');
    const [sending, setSending] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const fetchSubscribers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/newsletter?limit=500');
            const data = await res.json();
            if (data.success) setSubscribers(data.subscribers);
        } catch {
            toast.error('Failed to load subscribers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchSubscribers(), 0);
        return () => clearTimeout(timer);
    }, [fetchSubscribers]);

    const filtered = subscribers.filter(s =>
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = subscribers.filter(s => s.isActive).length;
    const inactiveCount = subscribers.length - activeCount;

    // Selection
    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const s = new Set(prev);
            if (s.has(id)) { s.delete(id); } else { s.add(id); }
            return s;
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filtered.map(s => s.id)));
        }
        setSelectAll(!selectAll);
    };

    // Delete subscriber
    const handleDelete = async (email: string) => {
        if (!confirm(`Unsubscribe ${email}?`)) return;
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, unsubscribe: true }),
            });
            if (res.ok) {
                toast.success('Unsubscribed');
                fetchSubscribers();
            }
        } catch {
            toast.error('Failed');
        }
    };

    // Send newsletter
    const handleSend = async () => {
        if (!sendForm.subject.trim() || !sendForm.heading.trim() || !sendForm.message.trim()) {
            toast.error('All fields are required');
            return;
        }
        if (recipientType === 'selected' && selected.size === 0) {
            toast.error('Select at least one recipient');
            return;
        }

        setSending(true);
        try {
            const payload: Record<string, unknown> = { ...sendForm, recipientType };
            if (recipientType === 'selected') {
                payload.selectedEmails = subscribers.filter(s => selected.has(s.id)).map(s => s.email);
            }

            const res = await fetch('/api/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message || 'Newsletter sent!');
                setSendForm({ subject: '', heading: '', message: '' });
                setShowCompose(false);
            } else {
                toast.error(data.error || 'Failed to send');
            }
        } catch {
            toast.error('Send failed');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-5 -mt-2">

            {/* Header */}
            <div className="flex items-center justify-between pt-[2px]">
                <div className="flex items-center gap-2.5">
                    <h1 className="text-[15px] font-semibold text-white leading-none">Subscribers</h1>
                    <span className="text-[11px] text-white/30 leading-none">{subscribers.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowInfo(true)}
                        className="px-3 py-1.5 text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md hover:bg-indigo-500/20 transition-colors"
                    >
                        Click here Lara
                    </button>
                    <button
                        onClick={fetchSubscribers}
                        className="p-1.5 text-white/20 hover:text-white/50 transition-colors"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => setShowCompose(!showCompose)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-[11px] font-medium rounded hover:bg-white/90 transition-colors"
                    >
                        <Send className="h-3.5 w-3.5" />
                        Compose
                    </button>
                </div>
            </div>

            {showInfo && <InfoDialog onClose={() => setShowInfo(false)} />}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3">
                    <div className="text-xl font-semibold text-white">{subscribers.length}</div>
                    <div className="text-[10px] text-white/30 mt-0.5">Total</div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3">
                    <div className="text-xl font-semibold text-green-400">{activeCount}</div>
                    <div className="text-[10px] text-white/30 mt-0.5">Active</div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3">
                    <div className="text-xl font-semibold text-white/40">{inactiveCount}</div>
                    <div className="text-[10px] text-white/30 mt-0.5">Unsubscribed</div>
                </div>
            </div>

            {/* Compose form — smooth slide */}
            <div className={`grid transition-all duration-300 ease-in-out ${showCompose ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-medium text-white">Compose Newsletter</span>
                            <button onClick={() => setShowCompose(false)} className="text-white/30 hover:text-white transition-colors text-[11px]">✕</button>
                        </div>

                        <div>
                            <label className="text-[11px] text-white/40 mb-1 block">Subject *</label>
                            <input
                                value={sendForm.subject}
                                onChange={e => setSendForm(f => ({ ...f, subject: e.target.value }))}
                                placeholder="New arrivals this week"
                                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] text-white/40 mb-1 block">Heading *</label>
                            <input
                                value={sendForm.heading}
                                onChange={e => setSendForm(f => ({ ...f, heading: e.target.value }))}
                                placeholder="Check out our latest collection"
                                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] text-white/40 mb-1 block">Message *</label>
                            <textarea
                                value={sendForm.message}
                                onChange={e => setSendForm(f => ({ ...f, message: e.target.value }))}
                                placeholder="Write your newsletter content..."
                                rows={4}
                                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 resize-none"
                            />
                        </div>

                        {/* Recipient type */}
                        <div>
                            <label className="text-[11px] text-white/40 mb-1.5 block">Send to</label>
                            <div className="flex items-center gap-4">
                                {(['all', 'selected'] as const).map(type => (
                                    <button key={type} onClick={() => setRecipientType(type)} className="flex items-center gap-2 group">
                                        <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-150 ${recipientType === type ? 'border-white bg-white' : 'border-white/25 group-hover:border-white/50'
                                            }`}>
                                            {recipientType === type && <div className="w-2 h-2 rounded-full bg-black" />}
                                        </div>
                                        <span className={`text-[12px] transition-colors ${recipientType === type ? 'text-white' : 'text-white/40'}`}>
                                            {type === 'all' ? `All active (${activeCount})` : `Selected (${selected.size})`}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <button
                                onClick={handleSend}
                                disabled={sending}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-[11px] font-medium rounded hover:bg-white/90 transition-colors disabled:opacity-50"
                            >
                                {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                {sending ? 'Sending...' : 'Send Newsletter'}
                            </button>
                            <button onClick={() => setShowCompose(false)} className="px-4 py-2 text-[11px] text-white/40 hover:text-white transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search subscribers..."
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-8 pr-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/15"
                />
            </div>

            {/* Subscribers list */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-5 w-5 animate-spin text-white/25" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-white/25 text-[12px]">
                    {search ? 'No results' : 'No subscribers yet'}
                </div>
            ) : (
                <div className="space-y-px">
                    {/* Select all header */}
                    <div className="flex items-center gap-2.5 px-3 py-2">
                        <button onClick={handleSelectAll} className="flex items-center gap-2 group">
                            <div className={`w-3.5 h-3.5 rounded-[3px] border-[1.5px] flex items-center justify-center transition-all ${selectAll ? 'border-white bg-white' : 'border-white/20 group-hover:border-white/40'
                                }`}>
                                {selectAll && <div className="w-2 h-2 bg-black rounded-[1px]" />}
                            </div>
                            <span className="text-[10px] text-white/30">Select all ({filtered.length})</span>
                        </button>
                    </div>

                    {filtered.map(sub => {
                        const isSelected = selected.has(sub.id);
                        return (
                            <div
                                key={sub.id}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-200 ${sub.isActive
                                        ? 'bg-white/[0.02] border-white/[0.05]'
                                        : 'bg-white/[0.01] border-white/[0.03] opacity-40'
                                    }`}
                            >
                                <button onClick={() => toggleSelect(sub.id)} className="shrink-0 group">
                                    <div className={`w-3.5 h-3.5 rounded-[3px] border-[1.5px] flex items-center justify-center transition-all ${isSelected ? 'border-white bg-white' : 'border-white/15 group-hover:border-white/40'
                                        }`}>
                                        {isSelected && <div className="w-2 h-2 bg-black rounded-[1px]" />}
                                    </div>
                                </button>

                                <Mail className="h-3.5 w-3.5 text-white/15 shrink-0" />
                                <span className="text-[12px] text-white flex-1 truncate">{sub.email}</span>

                                {sub.isActive ? (
                                    <CheckCircle2 className="h-3 w-3 text-green-400/60 shrink-0" />
                                ) : (
                                    <XCircle className="h-3 w-3 text-white/20 shrink-0" />
                                )}

                                <span className="text-[10px] text-white/20 shrink-0">
                                    {new Date(sub.subscribedAt || sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>

                                <button
                                    onClick={() => handleDelete(sub.email)}
                                    className="p-1 rounded text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoDialog({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-stone-900 border border-white/10 rounded-xl w-full max-w-4xl aspect-[4/3] md:aspect-video flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()} dir="ltr">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                    <div className="text-left">
                        <h2 className="text-lg font-semibold text-white">Understanding the Newsletter</h2>
                        <p className="text-xs text-white/40 mt-1">Your guide to managing your subscriber base and marketing campaigns</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md transition-colors">
                        <X className="w-5 h-5 text-white/50" />
                    </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-white/10 text-left">
                    <section>
                        <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-indigo-400" />
                            1. What is this page?
                        </h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                            This is your email marketing dashboard. Here you can view everyone subscribed to your newsletter, track their subscription status, and compose and send emails directly to target groups.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            2. Subscriptions & Statuses
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                                <span className="text-xs text-white block mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-400" /> Active Subscribers</span>
                                <span className="text-[11px] text-white/50">These users will receive emails when you broadcast a campaign to all active users.</span>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                                <span className="text-xs text-white block mb-1 flex items-center gap-1.5"><XCircle className="w-3 h-3 text-red-400" /> Unsubscribed</span>
                                <span className="text-[11px] text-white/50">Users who opted out. They remain in records for reference but will not receive any bulk emails.</span>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                            <Send className="w-4 h-4 text-orange-400" />
                            3. Sending Campaigns
                        </h3>
                        <ul className="space-y-3 text-xs text-white/60">
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#818cf8] mt-1.5 shrink-0" />
                                <div><strong className="text-white/80">Compose Email:</strong> Click the &quot;Compose&quot; button to open the editor. You will need to specify a Subject, Heading, and Message content.</div>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] mt-1.5 shrink-0" />
                                <div><strong className="text-white/80">Target Recipients:</strong> You can broadcast to all active subscribers, or manually check specific subscribers to send to selected recipients only.</div>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
