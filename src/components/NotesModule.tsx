import React, { useState } from 'react';
import { Loan, Note } from '../types';
import { Plus, Tag, Trash2, FileText, Search, StickyNote } from 'lucide-react';

interface NotesModuleProps {
  loans: Loan[];
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

const NotesModule: React.FC<NotesModuleProps> = ({ loans, notes, setNotes }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoanFilter, setSelectedLoanFilter] = useState<string>('all');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newLoanId, setNewLoanId] = useState('');
  const [newTags, setNewTags] = useState('');

  const handleSaveNote = () => {
    if (!newTitle || !newContent || !newLoanId) {
        alert("Please fill in Title, Content and select a Loan");
        return;
    }

    const note: Note = {
      id: Date.now().toString(),
      loanId: newLoanId,
      title: newTitle,
      content: newContent,
      tags: newTags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      createdAt: new Date().toISOString()
    };

    setNotes(prev => [note, ...prev]);
    setIsEditing(false);
    resetForm();
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const resetForm = () => {
    setNewTitle('');
    setNewContent('');
    setNewLoanId('');
    setNewTags('');
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLoan = selectedLoanFilter === 'all' || note.loanId === selectedLoanFilter;
    return matchesSearch && matchesLoan;
  });

  const getLoanName = (id: string) => loans.find(l => l.id === id)?.name || 'Unknown Loan';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Sidebar / List */}
      <div className="lg:col-span-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-slate-800 dark:text-white">My Notes</h2>
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <select 
            value={selectedLoanFilter}
            onChange={(e) => setSelectedLoanFilter(e.target.value)}
            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 outline-none"
          >
            <option value="all">All Loans</option>
            {loans.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredNotes.length === 0 ? (
             <div className="text-center py-10 text-slate-400">
                <FileText size={32} className="mx-auto mb-2 opacity-50"/>
                <p>No notes found.</p>
             </div>
          ) : (
            filteredNotes.map(note => (
                <div key={note.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">{note.title}</h3>
                        <button onClick={(e) => {e.stopPropagation(); deleteNote(note.id)}} className="text-slate-300 hover:text-red-500">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <p className="text-xs text-primary font-medium mb-2">{getLoanName(note.loanId)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{note.content}</p>
                    {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {note.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] rounded-full">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col transition-colors">
        {isEditing ? (
            <div className="flex-1 p-6 flex flex-col space-y-4 animate-fade-in">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Create New Note</h2>
                    <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white">Cancel</button>
                </div>
                
                <div className="space-y-4 flex-1">
                    <input 
                        type="text" 
                        placeholder="Note Title" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full text-lg font-semibold px-4 py-2 bg-transparent text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 focus:border-primary outline-none"
                    />
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Related Loan</label>
                        <select 
                            value={newLoanId}
                            onChange={(e) => setNewLoanId(e.target.value)}
                            className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg"
                        >
                            <option value="">Select a loan...</option>
                            {loans.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>

                    <textarea 
                        placeholder="Write your details here..." 
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="w-full flex-1 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none resize-none min-h-[200px]"
                    />

                    <div>
                         <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Tags (comma separated)</label>
                         <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                             <Tag size={16} className="text-slate-400" />
                             <input 
                                type="text"
                                value={newTags}
                                onChange={(e) => setNewTags(e.target.value)}
                                placeholder="documents, negotiation, urgent"
                                className="flex-1 outline-none text-sm bg-transparent text-slate-800 dark:text-white"
                             />
                         </div>
                    </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                    <button 
                        onClick={handleSaveNote}
                        className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Save Note
                    </button>
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-full mb-4">
                    <StickyNote size={48} className="opacity-50" />
                </div>
                <p className="text-lg">Select a note to view or create a new one.</p>
                <button 
                    onClick={() => setIsEditing(true)}
                    className="mt-4 text-primary font-medium hover:underline"
                >
                    Create a new note
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default NotesModule;