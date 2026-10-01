import React, { useState, useEffect } from 'react';
import { apiClient } from './main.jsx';
import './App.css';

function App() {
  const [collection, setCollection] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Visibility States
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Selected Entities
  const [activeBook, setActiveBook] = useState(null);
  const [bookPendingDelete, setBookPendingDelete] = useState(null);
  const [hasPreviewError, setHasPreviewError] = useState(false);

  // Form State
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    genre: 'Fiction',
    year: '',
    description: '',
    image: ''
  });

  // Load Book Collection from API
  const loadCollection = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/books');
      setCollection(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Unable to load book collection:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollection();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'image') {
      setHasPreviewError(false);
    }
    setBookForm(prev => ({
      ...prev,
      [name]: name === 'year' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const openAddModal = () => {
    setActiveBook(null);
    setBookForm({
      title: '',
      author: '',
      genre: 'Fiction',
      year: '',
      description: '',
      image: ''
    });
    setHasPreviewError(false);
    setShowFormModal(true);
  };

  const openEditModal = (book) => {
    setActiveBook(book);
    setBookForm({
      title: book.title || '',
      author: book.author || '',
      genre: book.genre || 'Fiction',
      year: book.year || '',
      description: book.description || '',
      image: book.image || ''
    });
    setHasPreviewError(false);
    setShowFormModal(true);
  };

  const openViewModal = (book) => {
    setActiveBook(book);
    setShowDetailModal(true);
  };

  const openDeleteModal = (book) => {
    setBookPendingDelete(book);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!bookForm.title || !bookForm.author || !bookForm.year) {
      alert("Please fill out all required fields.");
      return;
    }

    const payload = {
      ...bookForm,
      year: Number(bookForm.year)
    };

    try {
      if (activeBook) {
        await apiClient.put(`/books/${activeBook.id}`, payload);
      } else {
        await apiClient.post('/books', payload);
      }
      setShowFormModal(false);
      loadCollection();
    } catch (err) {
      console.error("Failed to save book record:", err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!bookPendingDelete) return;
    try {
      await apiClient.delete(`/books/${bookPendingDelete.id}`);
      setShowDeleteModal(false);
      setBookPendingDelete(null);
      loadCollection();
    } catch (err) {
      console.error("Failed to delete book record:", err.message);
    }
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="header-text">
          <h1>Book Collection Manager</h1>
          <p className="subtitle">
            Every book you've read, borrowed, or want to brag about — <br />
            kept on one shelf. <span>{collection.length} {collection.length === 1 ? 'book' : 'books'} on the shelf</span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add a book
        </button>
      </header>

      <hr className="divider" />

      {/* Main Grid */}
      {isLoading ? (
        <div className="loading-state">Loading book collection...</div>
      ) : (
        <div className="book-grid">
          {collection.map((book) => (
            <div key={book.id} className="book-card">
              <div className="card-image-wrapper">
                <span className="badge">{book.genre}</span>
                <img
                  src={book.image}
                  alt={book.title}
                  className="card-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    if (e.target.parentElement) {
                      e.target.parentElement.classList.add('fallback-cover');
                    }
                  }}
                />
                <div className="fallback-text"><b>{book.title}</b></div>
              </div>
              <div className="card-body">
                <h3 className="book-card-title">{book.title}</h3>
                <p className="book-author-year">
                  {book.author} — {book.year}
                </p>
                <div className="card-actions">
                  <button className="btn-action" onClick={() => openViewModal(book)}>View</button>
                  <button className="btn-action" onClick={() => openEditModal(book)}>Edit</button>
                  <button className="btn-action btn-delete" onClick={() => openDeleteModal(book)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE & EDIT MODAL */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{activeBook ? 'Edit book' : 'Add a book'}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={bookForm.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Author</label>
                  <input
                    type="text"
                    name="author"
                    value={bookForm.author}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Year</label>
                  <input
                    type="number"
                    min="1"
                    name="year"
                    value={bookForm.year}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Genre</label>
                <select name="genre" value={bookForm.genre} onChange={handleInputChange}>
                  <option value="Fiction">Fiction</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Biography">Biography</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={bookForm.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={bookForm.image}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-image-preview-container">
                <div className="preview-cover-box">
                  {bookForm.image && !hasPreviewError ? (
                    <img
                      src={bookForm.image}
                      alt="Preview"
                      onError={() => setHasPreviewError(true)}
                    />
                  ) : (
                    <div className="fallback-plain-cover">Book Cover</div>
                  )}
                </div>
                <p className="preview-help-text">
                  If the link doesn't load, a plain cover is shown instead — so your shelf never has broken images.
                </p>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {activeBook ? 'Save changes' : 'Add book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showDetailModal && activeBook && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="view-image-container">
              <span className="badge">{activeBook.genre}</span>
              <img
                src={activeBook.image}
                alt={activeBook.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  if (e.target.parentElement) {
                    e.target.parentElement.classList.add('fallback-cover');
                  }
                }}
              />
              <div className="fallback-text">{activeBook.title}</div>
            </div>
            <div className="view-details">
              <h3>{activeBook.title}</h3>
              <p className="view-author">{activeBook.author} — {activeBook.year}</p>
              <p className="view-desc">{activeBook.description}</p>
              <div className="modal-actions align-right">
                <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && bookPendingDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Remove this book?</h3>
            <p>Are you sure you want to delete <strong>"{bookPendingDelete.title}"</strong>?</p>
            <div className="modal-actions center">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;