import React, { useState } from "react";
import axios from "axios"; // <--- 1. Import Axios
import ReactMarkdown from "react-markdown";
function Note({ note, onDelete, onEdit }) {
    const [summary, setSummary] = useState(null);
    const [isSummarizing, setIsSummarizing] = useState(false);

    const showSummarizeBtn = note.content.length > 20;

    
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/notes/";

    
    const handleSummarize = async () => {
        if (summary) return; 
        
        setIsSummarizing(true);
        try {
            
            const response = await axios.post(`${API_URL}${note.id}/summarize/`);
            
            
            setSummary("✨ " + response.data.summary);
            
        } catch (error) {
            console.error("AI Error:", error);
            setSummary("❌ AI is busy or offline. Try again.");
        } finally {
            setIsSummarizing(false);
        }
    };

    const formattedDate = new Date(note.created_at).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
    });

    return (
        <div className="note-card">
            <div className="card-header">
                <h3 className="note-title">{note.title}</h3>
                {showSummarizeBtn && (
                    <button 
                        onClick={handleSummarize} 
                        disabled={isSummarizing} 
                        className="badge-ai"
                        style={{
                            cursor: 'pointer',
                            border: 'none',
                            transition: 'all 0.2s',
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        {isSummarizing ? "✨ Thinking..." : (summary ? "✅ Done" : "✨ Summarize")}
                    </button>
                )}
            </div>

           {/* SUMMARY BOX */}
        {summary && (
            <div style={{
                backgroundColor: '#f0f9ff',
                borderLeft: '4px solid #3b82f6',
                padding: '15px',
                margin: '15px 0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                color: '#1e293b',
                lineHeight: '1.6',
                animation: 'fadeIn 0.5s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <strong style={{ display: 'block', marginBottom: '8px', color: '#1d4ed8' }}>
                    ✨ AI Insight:
                </strong>

                {/* THIS RENDERS THE MARKDOWN BEAUTIFULLY */}
                <div className="markdown-content">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
            </div>
        )}

            <p className="note-body">{note.content}</p>

            <div className="card-footer">
                <span className="note-date">{formattedDate}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* EDIT BUTTON */}
                    <button 
                        className="btn-edit" 
                        onClick={() => onEdit(note)} 
                        style={{
                            background: 'transparent',
                            color: '#3b82f6',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Edit
                    </button>
                    {/* DELETE BUTTON */}
                    <button className="btn-delete" onClick={() => onDelete(note.id)}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Note;