import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Building, MessageSquare, Search, Trash2, ArrowRight } from 'lucide-react';
import { Message } from '../types';

interface MessagesInboxProps {
  token: string;
  onSelectProperty: (propertyId: string) => void;
}

export default function MessagesInbox({ token, onSelectProperty }: MessagesInboxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/messages', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Failed to load message inbox');
        }

        const data = await res.json();
        // Sort newest first
        data.sort((a: Message, b: Message) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMessages(data);
      } catch (err: any) {
        setError(err.message || 'Error loading messages.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [token]);

  const filteredMessages = messages.filter(m =>
    m.senderName.toLowerCase().includes(filterQuery.toLowerCase()) ||
    m.senderEmail.toLowerCase().includes(filterQuery.toLowerCase()) ||
    m.propertyTitle.toLowerCase().includes(filterQuery.toLowerCase()) ||
    m.messageText.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center" id="messages-loading">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <span className="block mt-4 text-slate-500 text-sm font-semibold">Opening mailbox...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="messages-view">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Direct Messages Inbox
          </h1>
          <p className="text-slate-500 text-sm">
            Read direct interest inquiries and view lead contact specifications for your properties.
          </p>
        </div>

        {/* Search bar */}
        {messages.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter messages..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500 bg-white"
            />
          </div>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto my-12 shadow-xs">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Inbox is Empty</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            As soon as prospective renters or buyers make inquiries on your listed properties, their contact messages will appear here.
          </p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto my-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1">No matching messages</h3>
          <p className="text-slate-500 text-xs">Try searching for a different keyword or name.</p>
        </div>
      ) : (
        <div className="space-y-4" id="messages-list">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs hover:border-slate-300 transition-all"
              id={`message-card-${msg.id}`}
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    {msg.senderName}
                  </h3>
                  {/* Sender Contact Links */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <a href={`mailto:${msg.senderEmail}`} className="hover:underline flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {msg.senderEmail}
                    </a>
                    {msg.senderPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {msg.senderPhone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
              </div>

              {/* Property related details */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Building className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-slate-500 font-normal">Inquiry on:</span>
                  <span className="truncate max-w-[300px]">{msg.propertyTitle}</span>
                </div>

                <button
                  onClick={() => onSelectProperty(msg.propertyId)}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-[11px] hover:underline cursor-pointer shrink-0 font-bold"
                >
                  Inspect Property Listing
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Message text */}
              <div className="text-slate-600 text-sm whitespace-pre-line leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
                {msg.messageText}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
