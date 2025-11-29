import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, ChevronDown } from 'lucide-react';

interface MultiSelectUserProps {
  label: string;
  options: { id: string; name: string; avatar: string; department?: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

const MultiSelectUser: React.FC<MultiSelectUserProps> = ({ label, options, selectedIds, onChange, placeholder = "Select members..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((i: string) => i !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const filteredOptions = options.filter((opt) => 
        opt.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="min-h-[46px] w-full p-2 bg-slate-50 hover:bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-slate-800 dark:focus-within:ring-blue-900 cursor-pointer flex flex-wrap gap-2 items-center transition-all shadow-sm"
            >
                {selectedIds.length === 0 && (
                    <span className="text-slate-400 text-sm ml-2">{placeholder}</span>
                )}
                
                {selectedIds.map((id: string) => {
                    const user = options.find((o) => o.id === id);
                    if (!user) return null;
                    return (
                        <div key={id} className="flex items-center gap-1 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-full pl-1 pr-2 py-0.5 shadow-sm">
                            <img src={user.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{user.name.split(' ')[0]}</span>
                            <div 
                                onClick={(e) => { e.stopPropagation(); toggleSelection(id); }}
                                className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-500 rounded-full text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                            >
                                <X size={12} />
                            </div>
                        </div>
                    );
                })}
                
                <div className="ml-auto pr-2 text-slate-400">
                     <ChevronDown size={16} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-50 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                autoFocus
                                placeholder="Search team..." 
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 dark:text-white transition-all placeholder:text-slate-400"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-400">No members found</div>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected = selectedIds.includes(option.id);
                                return (
                                    <div 
                                        key={option.id}
                                        onClick={() => toggleSelection(option.id)}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                            isSelected 
                                            ? 'bg-blue-50 dark:bg-blue-900/20' 
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <div className="relative">
                                            <img src={option.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                            {isSelected && (
                                                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-800">
                                                    <Check size={8} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`text-sm font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {option.name}
                                            </div>
                                            <div className="text-xs text-slate-400">{option.department}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiSelectUser;
