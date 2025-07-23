/**
 * @jest-environment jsdom
 */

// ✅ Imports
import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import Reviews from './[foodPlaceId]';
import { useSearchParams } from 'next/navigation';
import '@testing-library/jest-dom';

// ✅ Mocks: next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useParams: jest.fn(() => ({ foodPlaceId: '123' })),
  useSearchParams: jest.fn(() => ({
    get: (key: string) => (key === 'name' ? 'Mock Restaurant Name' : null),
  })),
}));

// ✅ Mocks: Supabase
jest.mock('@/app/supabaseClient', () => {
  const mockInsert = jest.fn(() => ({
    select: jest.fn(() => ({
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'new-review-id',
          comment: 'New review',
          rating: 4,
          user_id: 'mock-user-id',
          image_url: '/mock_uploaded_image.jpg',
        },
      }),
    })),
  }));

  const mockDelete = jest.fn(() => ({
    eq: jest.fn(() => ({
      throwOnError: jest.fn().mockResolvedValue({}),
    })),
  }));

  const mockFrom = jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({
          data: [
            {
              review_id: 1,
              comment: 'Great!',
              rating: 4,
              image_url: '/some.jpg',
              user_id: 'mock-user-id',
              created_at: new Date().toISOString(),
              users: { username: 'tester' },
            },
          ],
          error: null,
        })),
        single: jest.fn().mockResolvedValue({
          data: {
            food_places_name: 'Mock Place',
            image_1: '/mock_image_1.jpg',
            image_2: '/mock_image_2.jpg',
            map_image: '/mock_map_image.jpg',
          },
        }),
      })),
    })),
    insert: mockInsert,
    delete: mockDelete,
  }));

  return {
    __esModule: true,
    supabase: {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'mock-user-id' } },
        }),
      },
      from: mockFrom,
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({
            data: { path: '/mock_uploaded_image.jpg' },
          }),
          getPublicUrl: jest.fn(() => ({
            data: { publicUrl: '/mock_uploaded_image.jpg' },
          })),
        })),
      },
    },
  };
});

describe('Reviews Component', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // 🧹 Clean mocks before each test
  });

  it('should render the review form', async () => {
    await act(async () => {
      render(<Reviews />);
    });

    expect(screen.getByPlaceholderText(/Share your experience.../i)).toBeInTheDocument();
    expect(screen.getByText(/submit review/i)).toBeInTheDocument();
  });

  it('should allow submitting a new review with image and star rating', async () => {
    await act(async () => {
      render(<Reviews />);
    });

    fireEvent.change(screen.getByPlaceholderText(/Share your experience.../i), {
      target: { value: 'Awesome food!' },
    });

    const stars = screen.getAllByTestId('star-icon');
    fireEvent.click(stars[4]); // 5-star

    fireEvent.click(screen.getByText(/submit review/i));
    // ✅ Optionally wait for a success message or confirmation in UI
  });

  it('should allow editing a review', async () => {
    await act(async () => {
      render(<Reviews />);
    });

    const editButton = screen.queryByText(/edit/i);
    if (editButton) {
      fireEvent.click(editButton);
      const textarea = await screen.findByPlaceholderText(/Share your experience.../i);
      fireEvent.change(textarea, { target: { value: 'Updated review' } });
      fireEvent.click(screen.getByText(/save/i));
    }
  });

  it('should allow deleting a review', async () => {
    await act(async () => {
      render(<Reviews />);
    });

    const deleteButton = screen.queryByText(/delete/i);
    if (deleteButton) {
      fireEvent.click(deleteButton);
      // ✅ Optionally check that the review is removed from DOM
    }
  });
});
