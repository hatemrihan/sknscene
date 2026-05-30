'use client';

import { useState, useEffect } from 'react';
import { Download, MoreHorizontal, CheckCircle, Clock, User, Search, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// ── Types ─────────────────────────────────────────────────────

interface Contact {
    id: string;
    _id?: string;
    name: string;
    email: string;
    message?: string;
    status: 'pending' | 'responded' | 'archived';
    createdAt: string;
    updatedAt: string;
}

// ── Page ──────────────────────────────────────────────────────

export default function AdminContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [respondingContacts, setRespondingContacts] = useState<Set<string>>(new Set());

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/contacts');
            if (!res.ok) return;
            const data = await res.json();
            if (data.success) setContacts(data.data ?? []);
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchContacts(), 0);
        return () => clearTimeout(timer);
    }, []);

    const filteredContacts = contacts.filter((c) => {
        const search = globalFilter.toLowerCase();
        return c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search) || c.status.toLowerCase().includes(search);
    });

    const exportAsCSV = () => {
        const csvData = [
            ['Name', 'Email', 'Status', 'Date Submitted'],
            ...filteredContacts.map(c => [c.name, c.email, c.status, new Date(c.createdAt).toLocaleDateString()])
        ];
        const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `contacts_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV downloaded');
    };

    const handleMarkAsResponded = async (contactId: string) => {
        setRespondingContacts(prev => new Set(prev).add(contactId));
        try {
            const res = await fetch(`/api/contacts/${contactId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'responded' }),
            });
            const data = await res.json();
            if (data.success) {
                setContacts(prev => prev.map(c =>
                    (c.id === contactId || c._id === contactId) ? { ...c, status: 'responded' as Contact['status'] } : c
                ));
                toast.success('Marked as responded');
            }
        } catch (error) {
            console.error('Error updating contact:', error);
            toast.error('Failed to update contact');
        } finally {
            setRespondingContacts(prev => {
                const next = new Set(prev);
                next.delete(contactId);
                return next;
            });
        }
    };

    const handleArchive = async (contactId: string) => {
        try {
            const res = await fetch(`/api/contacts/${contactId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'archived' }),
            });
            const data = await res.json();
            if (data.success) {
                setContacts(prev => prev.map(c =>
                    (c.id === contactId || c._id === contactId) ? { ...c, status: 'archived' as Contact['status'] } : c
                ));
                toast.success('Contact archived');
            }
        } catch (error) {
            console.error('Error archiving contact:', error);
            toast.error('Failed to archive');
        }
    };

    // ── Loading ───────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-stone-500" />
                    <span className="text-[13px] text-stone-500">Loading contacts…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="text-white max-w-6xl mt-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="text-[13px] text-stone-500 mb-1">Communications</div>
                    <h1 className="text-xl font-semibold text-white">Contacts</h1>
                </div>
                <Button
                    variant="outline"
                    onClick={exportAsCSV}
                    className="border-stone-700 bg-stone-800/60 text-stone-300 hover:bg-stone-800 hover:text-white text-[13px] h-9 gap-1.5"
                >
                    <Download className="h-3.5 w-3.5" />
                    Export
                </Button>
            </div>

            {/* Empty State */}
            {contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-6">
                    <div className="w-16 h-16 rounded-2xl bg-stone-800/60 border border-stone-800/60 flex items-center justify-center mb-5">
                        <Mail className="h-7 w-7 text-stone-600" />
                    </div>
                    <h2 className="text-[15px] font-medium text-stone-300 mb-1.5">No contacts yet</h2>
                    <p className="text-[13px] text-stone-500 text-center max-w-sm">
                        When customers submit the contact form, their messages will appear here.
                    </p>
                </div>
            ) : (
                <>
                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                        <Input
                            placeholder="Search contacts…"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-10 bg-stone-800/60 border-stone-700 text-white placeholder:text-stone-500 focus-visible:ring-stone-600 h-10"
                        />
                    </div>

                    {/* Table */}
                    <div className="bg-stone-800/30 border border-stone-800/60 rounded-xl overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-stone-800/60 hover:bg-transparent">
                                    <TableHead className="text-[11px] text-stone-500 uppercase tracking-wider font-medium px-5 py-3">Status</TableHead>
                                    <TableHead className="text-[11px] text-stone-500 uppercase tracking-wider font-medium px-5 py-3">Name</TableHead>
                                    <TableHead className="text-[11px] text-stone-500 uppercase tracking-wider font-medium px-5 py-3">Email</TableHead>
                                    <TableHead className="text-[11px] text-stone-500 uppercase tracking-wider font-medium px-5 py-3">Date</TableHead>
                                    <TableHead className="text-[11px] text-stone-500 uppercase tracking-wider font-medium px-5 py-3 text-right w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredContacts.map((contact) => {
                                    const activeId = contact.id || contact._id || '';
                                    return (
                                        <TableRow key={activeId} className="border-stone-800/60 hover:bg-stone-800/30 transition-colors">
                                            <TableCell className="px-5 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize
                                                    ${contact.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' : ''}
                                                    ${contact.status === 'responded' ? 'bg-green-500/15 text-green-400 border-green-500/20' : ''}
                                                    ${contact.status === 'archived' ? 'bg-stone-700/50 text-stone-400 border-stone-700' : ''}
                                                `}>
                                                    {contact.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                                    {contact.status === 'responded' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                    {contact.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-5 py-3">
                                                <div className="flex items-center gap-2 text-[13px] text-stone-200">
                                                    <User className="h-3.5 w-3.5 text-stone-500" />
                                                    {contact.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-5 py-3 text-[13px] text-stone-400 lowercase">
                                                {contact.email}
                                            </TableCell>
                                            <TableCell className="px-5 py-3 text-[12px] text-stone-500 tabular-nums whitespace-nowrap">
                                                {new Date(contact.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell className="px-5 py-3 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-stone-800 text-stone-500 hover:text-white">
                                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-stone-900 border-stone-800 text-stone-300">
                                                        <DropdownMenuLabel className="text-stone-500 text-[11px]">Actions</DropdownMenuLabel>
                                                        {contact.status !== 'responded' && contact.status !== 'archived' && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleMarkAsResponded(activeId)}
                                                                    disabled={respondingContacts.has(activeId)}
                                                                    className="text-green-400 hover:bg-stone-800 focus:bg-stone-800 focus:text-green-300 cursor-pointer text-[13px]"
                                                                >
                                                                    {respondingContacts.has(activeId) ? 'Marking…' : '✓ Mark as Responded'}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="bg-stone-800" />
                                                            </>
                                                        )}
                                                        <DropdownMenuItem
                                                            className="hover:bg-stone-800 focus:bg-stone-800 cursor-pointer text-[13px]"
                                                            onClick={() => navigator.clipboard.writeText(contact.email)}
                                                        >
                                                            Copy Email
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-stone-800" />
                                                        <DropdownMenuItem
                                                            className="text-red-400 hover:bg-stone-800 focus:bg-stone-800 focus:text-red-300 cursor-pointer text-[13px]"
                                                            onClick={() => handleArchive(activeId)}
                                                        >
                                                            Archive
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filteredContacts.length === 0 && (
                                    <TableRow className="hover:bg-transparent border-stone-800/60">
                                        <TableCell colSpan={5} className="h-24 text-center text-[13px] text-stone-500">
                                            No contacts match your search.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="py-3 text-[12px] text-stone-500">
                        {filteredContacts.length} contacts
                    </div>
                </>
            )}
        </div>
    );
}
