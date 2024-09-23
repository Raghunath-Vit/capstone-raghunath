import '@testing-library/jest-dom/extend-expect'; 
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GiveRating from '../GiveRating'; 
import { useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';


jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useLocation: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

describe('GiveRating Component', () => {
  const mockToken = 'mockToken';
  
  beforeEach(() => {
    useParams.mockReturnValue({ id: '1' });
    useLocation.mockReturnValue({ state: { isServiceProvider: true } });
    useSelector.mockReturnValue({ token: mockToken });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the rating component', () => {
    render(<GiveRating />);
    
    expect(screen.getByText('Rate Your Experience')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit rating/i })).toBeDisabled();
  });

  it('allows the user to select a rating and submit', async () => {
    render(<GiveRating />);
    
    const submitButton = await screen.findByRole('button', { name: /submit rating/i });
    
    const ratingStars = screen.getAllByRole('button', { name: /star/i }); // Adjust accordingly
    fireEvent.click(ratingStars[4]); // Click on the 5th star (index 4)

    expect(submitButton).toBeEnabled();

    axios.post.mockResolvedValueOnce({ data: { message: 'Rating submitted successfully!' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
      expect(axios.post).toHaveBeenCalledWith(
        `http://localhost:5000/providers/1/rate`,
        { rating: 5 },
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
    });
  });

  it('handles error on rating submission', async () => {
    render(<GiveRating />);
    
    const ratingStars = screen.getAllByRole('button', { name: /star/i }); // Adjust accordingly
    fireEvent.click(ratingStars[3]); // Click on the 4th star (index 3)

    axios.post.mockRejectedValueOnce({ response: { data: { error: 'Submission error' } } });

    const submitButton = screen.getByRole('button', { name: /submit rating/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/submission error/i)).toBeInTheDocument();
    });
  });
});
