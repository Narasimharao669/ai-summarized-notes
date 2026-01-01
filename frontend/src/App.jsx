import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Note from "./components/Note";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/notes/";

function App() {
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  
  // NEW: Track which note is being edited
  const [editingNote, setEditingNote] = useState(null); 
  const [noteToDelete, setNoteToDelete] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL);
      setNotes(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
      showToast("❌ Connection error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // 1. POPULATE FORM WHEN EDIT CLICKED
  const handleEditStart = (note) => {
    setEditingNote(note);        // Remember which note we are editing
    setNoteTitle(note.title);    // Fill the title input
    setNoteContent(note.content);// Fill the content input
  };

  // 2. RESET FORM
  const resetForm = () => {
    setNoteTitle("");
    setNoteContent("");
    setEditingNote(null);
  };

  // 3. HANDLE SUBMIT (DECIDE: CREATE OR UPDATE?)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) {
        showToast("⚠️ Fields cannot be empty");
        return;
    }

    setIsLoading(true);
    try {
        if (editingNote) {
            // --- UPDATE MODE (PUT) ---
            const response = await axios.put(`${API_URL}${editingNote.id}/`, {
                title: noteTitle,
                content: noteContent
            });
            // Update the list without refetching
            setNotes(prev => prev.map(n => n.id === editingNote.id ? response.data : n));
            showToast("✅ Note updated!");
        } else {
            // --- CREATE MODE (POST) ---
            const response = await axios.post(API_URL, {
                title: noteTitle,
                content: noteContent
            });
            setNotes(prev => [response.data, ...prev]);
            showToast("✅ Note created!");
        }
        resetForm(); // Clear inputs and exit edit mode
    } catch (error) {
        console.error("Submit failed:", error);
        showToast("❌ Save failed");
    } finally {
        setIsLoading(false);
    }
  };

  const initiateDelete = (id) => setNoteToDelete(id);
  
  const performDelete = async () => {
    if (!noteToDelete) return;
    try {
      await axios.delete(`${API_URL}${noteToDelete}/`);
      setNotes(prev => prev.filter(n => n.id !== noteToDelete));
      showToast("🗑️ Note deleted");
      
      // If we deleted the note currently being edited, clear the form
      if (editingNote && editingNote.id === noteToDelete) resetForm();
      
    } catch (error) {
      showToast("❌ Delete failed");
    } finally {
      setNoteToDelete(null);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand"><span>⚡</span> DevDash</div>
        
        {/* FORM HANDLES BOTH CREATE AND UPDATE */}
        <form onSubmit={handleSubmit} className="note-form">
          <div className="input-group">
            <label className="form-label">Title</label>
            <input type="text" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} maxLength={100} />
          </div>
          <div className="input-group">
            <label className="form-label">Content</label>
            <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)}></textarea>
          </div>
          
          {/* DYNAMIC BUTTON */}
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Saving..." : (editingNote ? "Update Note 🔄" : "Add Entry +")}
          </button>
          
          {/* CANCEL EDIT BUTTON */}
          {editingNote && (
            <button type="button" onClick={resetForm} className="btn-secondary" style={{marginTop: '10px', width: '100%'}}>
                Cancel Edit
            </button>
          )}
        </form>
      </aside>

      <main className="main-content">
        <div className="top-bar">
          <input type="text" className="search-input" placeholder="🔍 Search documentation..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {toastMessage && <div className="toast-notification">{toastMessage}</div>}

        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <Note 
              key={note.id} 
              note={note} 
              onDelete={initiateDelete} 
              onEdit={handleEditStart} // <--- PASS THE NEW FUNCTION
            />
          ))}
        </div>
      </main>
      
      {noteToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>⚠️ Delete Note?</h3>
            <p>Are you sure?</p>
            <div className="modal-actions">
              <button onClick={() => setNoteToDelete(null)} className="btn-secondary">Cancel</button>
              <button onClick={performDelete} className="btn-danger">Yes, Delete It</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;