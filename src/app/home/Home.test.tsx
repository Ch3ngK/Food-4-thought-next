import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import Home from './Home';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/supabaseClient';
import React from 'react';
import '@testing-library/jest-dom';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { advanceTo, clear } from 'jest-date-mock';
import Link from 'next/link';

// Create enhanced mock router
const mockRouter = {
  push: jest.fn(),
  prefetch: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
};
(globalThis as any).mockRouter = mockRouter;

// Mock useRouter from next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: jest.fn().mockReturnValue('/'),
}));

jest.mock('next/link', () => {
  return {
    __esModule: true,
    default: function LinkComponent(props) {
      const { children, href } = props;
      return (
        <a
          href={href}
          onClick={(e) => {
            e.preventDefault();
            if (globalThis.mockRouter) {
              globalThis.mockRouter.push(href);
            }
          }}
          {...props}
        >
          {children}
        </a>
      );
    }
  };
});


// Mock ProtectedRoute to render children directly
jest.mock('../auth/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
// In your test file or a setup file
jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: jest.fn(() => [
    jest.fn(), // emblaRef
    { // emblaApi
      scrollPrev: jest.fn(),
      scrollNext: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      scrollTo: jest.fn(),
      canScrollPrev: jest.fn().mockReturnValue(true),
      canScrollNext: jest.fn().mockReturnValue(true),
      scrollSnapList: jest.fn().mockReturnValue([]),
      selectedScrollSnap: jest.fn().mockReturnValue(0),
    }
  ])
}));
// Create the Supabase mock inside the jest.mock factory
jest.mock('@/app/supabaseClient', () => {
  // Define the interface locally
  interface MockSupabaseClient {
    auth: {
      signOut: jest.Mock;
      getSession: jest.Mock;
      getUser: jest.Mock;
      onAuthStateChange: jest.Mock;
    };
    from: jest.Mock;
    select: jest.Mock;
    storage: {
      from: jest.Mock;
    };
  }



  // Create the mock implementation
  const supabaseMock: MockSupabaseClient = {
    auth: {
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: '123', email: 'test@example.com' } } },
        error: null,
      }),
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null,
      }),
      onAuthStateChange: jest.fn((callback) => {
        callback({ 
          event: 'SIGNED_IN',
          session: { 
            user: { id: '123', email: 'test@example.com' } 
          } 
        });
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
    },
    from: jest.fn().mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            name: 'Trending Food 1',
            image_url: '/image1.jpg',
            description: 'Description 1'
          },
          {
            id: 2,
            name: 'Trending Food 2',
            image_url: '/image2.jpg',
            description: 'Description 2'
          }
        ],
        error: null,
        status: 200,
        statusText: 'OK'
      }),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis()
    })),
    storage: {
      from: jest.fn(() => ({
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: 'https://mocked-public-url.com/fake-image.jpg' },
          error: null
        })),
        upload: jest.fn().mockResolvedValue({ error: null }),
        download: jest.fn().mockResolvedValue({ error: null })
      })),
    },
  };

  return { supabase: supabaseMock };
});

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.push.mockImplementation(() => Promise.resolve(true));
    
    // Mock console.error to keep test output clean
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Reset to default mock implementation
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            name: 'Trending Food 1',
            image_url: '/image1.jpg',
            description: 'Description 1'
          }
        ],
        error: null
      })
    }));
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

describe('Trending Foods Carousel', () => {
  beforeAll(() => {
    // Set mock date to January 1, 2023
    advanceTo(new Date('2023-01-01T12:00:00Z'));
    
    // Mock supabase response
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        data: [{
          trending_food_id: '1',
          image_key: 'food1.jpg',
          description: 'Test Food',
          cuisine_id: '1',
          cuisine_name: 'Test Cuisine'
        }],
        error: null
      })
    }));
  });

  afterAll(async () => {
    await Promise.resolve(); // Flush any pending promises
    clear();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  afterEach(() => {
    // Reset any pending operations
    jest.clearAllTimers();
  });

  it('shows loading state while fetching', async () => {
    const neverResolvingPromise = new Promise(() => {}); // stays pending

    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn(() => neverResolvingPromise),
    }));

    render(
      <AppRouterContext.Provider value={mockRouter}>
        <Home />
      </AppRouterContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('carousel-loading')).toBeInTheDocument();
    });
  });


});

it('renders the home page', async () => {
  // Mock session data
  (supabase.auth.getSession as jest.Mock).mockResolvedValue({
    data: { session: { user: { email: 'test@example.com' } } },
    error: null,
  });

  // Mock trending foods data
  (supabase.from as jest.Mock).mockReturnValue({
    select: jest.fn().mockResolvedValue({
      data: [
        {
          trending_food_id: '1',
          image_key: 'test.jpg',
          description: 'Test food',
          cuisine_id: '1',
          cuisine_name: 'Test Cuisine'
        }
      ],
      error: null
    })
  });

  render(
    <AppRouterContext.Provider value={mockRouter}>
      <Home />
    </AppRouterContext.Provider>
  );

  // Wait for content to load
  await waitFor(() => {
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  }, { timeout: 5000 });
});

  it('calls router.push on clicking "Log out" button', async () => {
    render(
      <AppRouterContext.Provider value={mockRouter}>
        <Home />
      </AppRouterContext.Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const logoutButton = screen.getByRole('button', { name: /log out/i });
    await act(async () => {
      fireEvent.click(logoutButton);
    });

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  it('renders the Create Food Trail link with correct href', async () => {
    render(
      <AppRouterContext.Provider value={mockRouter}>
        <Home />
      </AppRouterContext.Provider>
    );


    await waitFor(() => {
      expect(screen.getByTestId('home-container')).toBeInTheDocument();
      const links = screen.getAllByRole('link');
      const foodTrailLink = links.find(link => 
      link.textContent?.includes('Create Food Trail')
      );
      expect(foodTrailLink).toHaveAttribute('href', '../food-trail');
    });
  });

it('successfully loads trending foods', async () => {
  const mockFoods = [{
    trending_food_id: '1',
    image_key: 'food1.jpg',
    description: 'Test Food',
    cuisine_id: '1',
    cuisine_name: 'Test Cuisine'
  }];

  // More explicit mock implementation
  (supabase.from as jest.Mock).mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockFoods,
        error: null
      })
    })
  });

  render(
    <AppRouterContext.Provider value={mockRouter}>
      <Home />
    </AppRouterContext.Provider>
  );

  // Debug what's actually rendered
  screen.debug();

  // Try different queries
    await waitFor(() => {
    const descriptions = screen.getAllByTestId('food-description');
    expect(descriptions.length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('food-cuisine')).toHaveLength(3);
    });
});

  it('navigates to about page when clicking about nav link', async () => {
      // Mock a successful session
  (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
    data: {
      session: {
        user: { id: '123', email: 'test@example.com' }
      }
    },
    error: null
  });

    render(
      <AppRouterContext.Provider value={mockRouter}>
        <Home />
      </AppRouterContext.Provider>
    );

  // Wait for the link to appear (up to 5 seconds)
  const aboutLink = await screen.findByTestId('about-link', {}, { timeout: 10000 });
    
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

    fireEvent.click(aboutLink);
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/about');
    });
  });

  it('navigates to popular page when clicking popular nav link', async () => {
  // Mock a successful session
  (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
    data: {
      session: {
        user: { id: '123', email: 'test@example.com' }
      }
    },
    error: null
  });

  render(
    <AppRouterContext.Provider value={mockRouter}>
      <Home />
    </AppRouterContext.Provider>
  );

  // Wait for the popular link to appear
  const popularLink = await screen.findByTestId('popular-link', {}, { timeout: 10000 });

  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  fireEvent.click(popularLink);

  await waitFor(() => {
    expect(mockRouter.push).toHaveBeenCalledWith('/popular');
  });
});

 it('navigates to cuisine page when clicking cuisinePage nav link', async () => {
  // Mock a successful session
  (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
    data: {
      session: {
        user: { id: '123', email: 'test@example.com' }
      }
    },
    error: null
  });

  render(
    <AppRouterContext.Provider value={mockRouter}>
      <Home />
    </AppRouterContext.Provider>
  );

  // Wait for the popular link to appear
  const cuisinePageLink = await screen.findByTestId('cuisinePage-link', {}, { timeout: 10000 });

  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  fireEvent.click(cuisinePageLink);

  await waitFor(() => {
    expect(mockRouter.push).toHaveBeenCalledWith('/cuisinePage');
  });
});


  it('navigates to food trail page when Create Food Trail link is clicked', async () => {
    render(
      <AppRouterContext.Provider value={mockRouter}>
        <Home />
      </AppRouterContext.Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading delicious food...')).not.toBeInTheDocument()
    });

    const link = await screen.findByTestId('create-food-trail-link');
    expect(link).toHaveTextContent('Create Food Trail');
    fireEvent.click(link);
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('../food-trail');
    });
  });
});