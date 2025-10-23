import React, { useState } from 'react';
import toast from 'react-hot-toast'; // --- 1. IMPORT TOAST ---
import './ReviewModal.css';

const ReviewModal = ({ restaurantName, onSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      // --- 2. REPLACE THE ALERT WITH A TOAST ---
      toast.error("Please select a star rating.");
      return;
    }
    onSubmit({ rating, comment });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
        {/* ... (The rest of your JSX remains exactly the same) ... */}
        <div className="modal-header">
          <h3 className="modal-title">Leave a Review for {restaurantName}</h3>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="star-rating">
              {[...Array(5)].map((star, index) => {
                const ratingValue = index + 1;
                return (
                  <label key={index}>
                    <input
                      type="radio"
                      name="rating"
                      value={ratingValue}
                      onClick={() => setRating(ratingValue)}
                    />
                    <span
                      className="star"
                      style={{ color: ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9" }}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(0)}
                    >
                      &#9733;
                    </span>
                  </label>
                );
              })}
            </div>
            <textarea
              className="form-textarea"
              rows="4"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="modal-btn btn-secondary-custom">Cancel</button>
            <button type="submit" className="modal-btn btn-primary-custom">Submit Review</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;