import { useState } from "react";

function Note({ note, onDelete, onEdit }) { // <--- 1. Receive onEdit prop
    const [summary, setSummary] = useState(null);
    const [isSummarizing, setIsSummarizing] = useState(false);

    const showSummarizeBtn = note.content.length > 20;

    const handleSummarize = () => {
        setIsSummarizing(true);
        setTimeout(() => {
            setSummary("✨ Simulation: This note is about React hooks and state management.");
            setIsSummarizing(false);
        }, 1500);
    };

    const formattedDate = new Date(note.created_at).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
    });

    return (
        <div className="note-card">
            <div className="card-header">
                <h3 className="note-title">{note.title}</h3>
                {showSummarizeBtn && (
                    <button onClick={handleSummarize} disabled={isSummarizing} className="badge-ai">
                        {isSummarizing ? "✨ Thinking..." : (summary ? "✅ Done" : "✨ Summarize")}
                    </button>
                )}
            </div>

            {summary && <div className="summary-box"><strong>AI Summary:</strong> {summary}</div>}

            <p className="note-body">{note.content}</p>

            <div className="card-footer">
                <span className="note-date">{formattedDate}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* 2. NEW EDIT BUTTON */}
                    <button 
                        className="btn-edit" 
                        onClick={() => onEdit(note)} // Trigger the edit
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
                    <button className="btn-delete" onClick={() => onDelete(note.id)}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Note;