import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ to, label = "Back", className = "" }) => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => to ? navigate(to) : navigate(-1)}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm ring-1 ring-slate-100 group active:scale-95 ${className}`}
            title={label}
        >
            <svg className="h-6 w-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
        </button>
    );
};

export default BackButton;
