'use client';

import React, { useCallback, useMemo, useState, useRef } from 'react';
import './Home.css';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../auth/ProtectedRoute';
import LoadingScreen from '../../components/LoadingScreen';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

import { Card, CardContent } from '@/components/ui/card';

const imageKeys = {
  logo: 'Food4Thought.png',
  instagram: 'instagram-icon.png',
  twitter: 'twitter-icon.png',
  facebook: 'facebook-icon.png',
  tiktok: 'tiktok-icon.png',
  newspaper: 'newspaper.jpg',
  western: 'western-demo.png',
  yongtaufu: 'yong-tau-fu-demo.jpg',
  nasilemak: 'nasi-lemak-demo.jpg',
  star: 'star.png',
  halfstar: 'half-star.png',
  foodtrail: 'food-trail-background.jpg',
  chickenrice: 'chicken-rice.png',
  malayrice: 'nasi-lemak.png',
  nasibriyani: 'nasi-briyani.png',
};

interface TrendingFood {
  trending_food_id: string;
  image_key: string;
  description: string;
  cuisine_id: string;
  cuisine_name: string;
}

interface CarouselItems {
  src: string;
  description: string;
  cuisineId: string;
  cuisineName: string;
}

// custom hook for managing carousel
const useCarousel = (carouselApi: CarouselApi | undefined) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const initializeCarousel = useCallback(() => {
    if (!carouselApi) return;

    setTotalSlides(carouselApi.scrollSnapList().length);
    setCurrentSlide(carouselApi.selectedScrollSnap() + 1);

    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap() + 1);
    };

    carouselApi.on('select', onSelect);

    // clear the existing interval
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
    }

    // set up autoplay
    autoplayIntervalRef.current = setInterval(() => {
      const nextIndex = (carouselApi.selectedScrollSnap() + 1) % carouselApi.scrollSnapList().length;
      carouselApi.scrollTo(nextIndex);
    }, 7000);

    return () => {
      carouselApi.off('select', onSelect);
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, [carouselApi]);

  return { currentSlide, totalSlides, initializeCarousel };
};

// custom hook for user data
const useUser = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [userProvider, setUserProvider] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (isUserLoaded) return; // prevents refetching of datas

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }

      if (user) {
        const provider = user.app_metadata?.provider || 'email';
        setUserProvider(provider);

        let fetchedUsername: string;

        if (provider === 'google') {
          // for Google users
          fetchedUsername = 
            user.user_metadata?.full_name || 
            user.user_metadata?.name || 
            user.email?.split('@')[0] || 
            'User';
        } else {
          // for email/password users
          fetchedUsername = user.user_metadata?.username || user.email || 'User';
        }

        setUsername(fetchedUsername);
      }
    } catch (error) {
      console.error('Error in fetchUser:', error);
    } finally {
      setIsUserLoaded(true);
    }
  }, [isUserLoaded]);

  return { username, fetchUser, isUserLoaded, userProvider };
};

// custom hook for image URLs with caching
const useImageUrls = () => {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const cacheRef = useRef<Record<string, string>>({});

  const getImageUrl = useCallback((imageKey: string) => {
    if (cacheRef.current[imageKey]) {
      return cacheRef.current[imageKey];
    }
    const { data } = supabase.storage.from('pictures').getPublicUrl(imageKey);
    cacheRef.current[imageKey] = data.publicUrl;
    return data.publicUrl;
  }, []);

  const loadImageUrls = useCallback(async () => {
    if (isLoaded) return; // prevents reloading

    const urls: Record<string, string> = {};
    for (const [key, file] of Object.entries(imageKeys)) {
      urls[key] = getImageUrl(file);
    }

    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setImageUrls(urls);
    setIsLoaded(true);
  }, [getImageUrl, isLoaded]);

  return { imageUrls, isLoaded, loadImageUrls, getImageUrl };
};

// custom hook for trending foods
const useTrendingFoods = (imageUrls: Record<string, string>, getImageUrl: (key: string) => string) => {
  const [carouselImages, setCarouselImages] = useState<CarouselItems[]>([]);
  const [isLoadingCarousel, setIsLoadingCarousel] = useState(true);

  // memorise the fallback data to prevent reloading
  const fallbackCarouselImages = useMemo(() => [
    {
      src: imageUrls.chickenrice || getImageUrl('chicken-rice.png'),
      description: 'Hainanese Chicken Rice - A Singaporean classic!',
      cuisineId: '1',
      cuisineName: 'Chinese',
    },
    {
      src: imageUrls.malayrice || getImageUrl('nasi-lemak.png'),
      description: 'Nasi Lemak - Fragrant rice with spicy sambal and more.',
      cuisineId: '6',
      cuisineName: 'Malaysian',
    },
    {
      src: imageUrls.nasibriyani || getImageUrl('nasi-briyani.png'),
      description: 'Nasi Briyani - Aromatic spiced rice with tender meat.',
      cuisineId: '6',
      cuisineName: 'Malaysian',
    },
  ], [imageUrls, getImageUrl]);

  // memorise the daily selection function so that it only changes daily
  const getDailyRandomSelection = useCallback((items: TrendingFood[], count: number = 3): TrendingFood[] => {
    if (items.length <= count) return items;
    
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + i) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
  }, []);

  const fetchTrendingFoods = useCallback(async () => {
    if (Object.keys(imageUrls).length === 0) return;

    setIsLoadingCarousel(true);

    try {
      const { data: trendingFoods, error } = await supabase
        .from('trending_foods')
        .select(`
          trending_food_id,
          image_key,
          description,
          cuisine_id,
          cuisine_name
        `);

      if (error || !trendingFoods?.length) {
        console.error('Error fetching trending foods:', error);
        setCarouselImages(fallbackCarouselImages);
        return;
      }

      const dailySelection = getDailyRandomSelection(trendingFoods);
      const transformedImages: CarouselItems[] = dailySelection.map(item => ({
        src: getImageUrl(item.image_key),
        description: item.description,
        cuisineId: item.cuisine_id,
        cuisineName: item.cuisine_name,
      }));
      
      setCarouselImages(transformedImages);
    } catch (error) {
      console.error('Error in fetchTrendingFoods:', error);
      setCarouselImages(fallbackCarouselImages);
    } finally {
      setIsLoadingCarousel(false);
    }
  }, [imageUrls, fallbackCarouselImages, getDailyRandomSelection, getImageUrl]);

  return { carouselImages, isLoadingCarousel, fetchTrendingFoods };
};

function Home() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const router = useRouter();
  
  // custom hooks
  const { username, fetchUser, isUserLoaded } = useUser();
  const { imageUrls, isLoaded: imagesLoaded, loadImageUrls, getImageUrl } = useImageUrls();
  const { carouselImages, isLoadingCarousel, fetchTrendingFoods } = useTrendingFoods(imageUrls, getImageUrl);
  const { currentSlide, totalSlides, initializeCarousel } = useCarousel(carouselApi);

  // initialise data
  const initializeApp = useCallback(async () => {
    await Promise.all([
      loadImageUrls(),
      fetchUser()
    ]);
  }, [loadImageUrls, fetchUser]);

  // initialise app
  React.useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // fetch the trending foods when images are loaded
  React.useEffect(() => {
    if (imagesLoaded) {
      fetchTrendingFoods();
    }
  }, [imagesLoaded, fetchTrendingFoods]);

  // initialise the carousel when API is available
  React.useEffect(() => {
    if (carouselApi) {
      return initializeCarousel();
    }
  }, [carouselApi, initializeCarousel]);

  const handleLogout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleCarouselItemClick = useCallback((cuisineName: string) => {
    router.push(`/cuisinePage/indiv-cuisines/${encodeURIComponent(cuisineName)}`);
  }, [router]);

  // show loading screen until everything is ready
  if (!imagesLoaded || !isUserLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ProtectedRoute>
      <div className="Home">
        <div className="background-img-1"></div>
        <div className="header-container">
          <div className="logo-section">
            <Image id="Logo-1" src={imageUrls.logo} alt="Logo" width={240} height={80} />
            <div className="Welcome-1">Welcome {username || 'Guest'},</div>
          </div>
          
          <div className="social-media-section">
            <div className="social-icons">
              <Image id="Instagram" src={imageUrls.instagram} alt="Instagram icon" width={50} height={50} />
              <Image id="Twitter" src={imageUrls.twitter} alt="Twitter icon" width={50} height={50} />
              <Image id="Facebook" src={imageUrls.facebook} alt="Facebook icon" width={50} height={50} />
              <Image id="Tiktok" src={imageUrls.tiktok} alt="Tiktok icon" width={50} height={50} />
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <span>🚪</span> Log out
            </button>
          </div>
        </div>

        <div className="text-box-1" data-testid="home-container">
          <nav className="navigation-bar">
            <div className="nav-container">
              <Link href="/cuisinePage" className="nav-link" data-testid='cuisinePage-link'>
                <span className="nav-icon">🍽️</span>
                <span className="nav-text">Cuisines</span>
              </Link>
              <Link href="/popular" className="nav-link" data-testid='popular-link'>
                <span className="nav-icon">🔥</span>
                <span className="nav-text">Popular</span>
              </Link>
              <Link href="/about" className="nav-link" data-testid="about-link">
                <span className="nav-icon">ℹ️</span>
                <span className="nav-text">About</span>
              </Link>
              <Link href="../food-trail" className="nav-link special-link" data-testid="create-food-trail-link" id="food-trail-link">
                <span className="nav-icon">🗺️</span>
                <span className="nav-text">Create Food Trail</span>
              </Link>
            </div>
          </nav>

          <div className="section-header">
            <h2 className="section-title">🌟 Trending Today!</h2>
          </div>

          <div className="carousel">
            {isLoadingCarousel ? (
              <div className="carousel-loading" data-testid="carousel-loading">
                <p>Loading trending foods...</p>
              </div>
            ) : (
              <Carousel setApi={setCarouselApi} className="w-full">
                <CarouselContent>
                  {carouselImages.map((item, index) => (
                    <CarouselItem key={index}>
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center p-4">
                          <div 
                            className="carousel-item-clickable"
                            onClick={() => handleCarouselItemClick(item.cuisineName || 'Unknown')}
                            style={{ cursor: 'pointer' }}
                          >
                            <Image 
                              data-testid="food-cuisine"
                              src={item.src} 
                              alt={`trending-food-${index}`}  
                              className="carousel-img" 
                              width={2000} 
                              height={200} 
                              style={{ borderRadius: '20px' }} 
                            />
                            <p className="carousel-description mt-2 text-center" data-testid="food-description">
                              {item.description}
                              {item.cuisineName && (
                                <span className="cuisine-badge" style={{ 
                                  display: 'block', 
                                  fontSize: '0.9em', 
                                  color: '#666', 
                                  marginTop: '4px' 
                                }}>
                                </span>
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            )}
            <div className="carousel-indicator">
              Slide {currentSlide} of {totalSlides}
            </div>
          </div>

          <div className="section-header">
            <h2 className="section-title">📰 Fresh from the Community</h2>
          </div>

          <div className="community-posts">
            <div className="newspaper-background">
              <Image id="Newspaper" src={imageUrls.newspaper} alt="Newspaper" width={1700} height={900} />
            </div>

            <div className="post-card">
              <div className="post-content">
                <h3 className="post-title">Cheap and affordable western at ang mo kio coffeeshop</h3>
                <div className="post-details">
                  <div className="post-info">
                    <div className="rating-container">
                      <Image src={imageUrls.star} alt="star" width={25} height={25} />
                      <Image src={imageUrls.star} alt="star" width={25} height={25} />
                      <Image src={imageUrls.star} alt="star" width={25} height={25} />
                      <Image src={imageUrls.star} alt="star" width={25} height={25} />
                      <Image src={imageUrls.halfstar} alt="half star" width={25} height={25} />
                    </div>
                    <div className="post-author">By: Foodreviewer123</div>
                  </div>
                  <div className="post-image">
                    <Image src={imageUrls.western} alt="Western food demo" width={200} height={120} />
                  </div>
                </div>
              </div>
            </div>

            <div className="post-card">
              <div className="post-content">
                <h3 className="post-title">Best Yong Tau Fu in Singapore, must try!</h3>
                <div className="post-details">
                  <div className="post-info">
                    <div className="rating-container">
                      <Image src={imageUrls.star} alt="star" width={25} height={25} />
                      <Image src={imageUrls.star} alt="star" width={25} height={25} />
                      <Image src={imageUrls.star} alt="star" width={25} height={25} />
                      <Image src={imageUrls.star} alt="star" width={25} height={25} />
                      <Image src={imageUrls.halfstar} alt="half star" width={25} height={25} />
                    </div>
                    <div className="post-author">By: ilovefood123</div>
                  </div>
                  <div className="post-image">
                    <Image src={imageUrls.yongtaufu} alt="Yong Tau Fu demo" width={200} height={120} />
                  </div>
                </div>
              </div>
            </div>

            <div className="post-card">
              <div className="post-content">
                <h3 className="post-title">Best nasi lemak in Singapore, must try!</h3>
                <div className="post-details">
                  <div className="post-info">
                    <div className="rating-container">
                      <Image src={imageUrls.star} alt="star" width={25} height={25} />
                      <Image src={imageUrls.star} alt="star" width={25} height={25} />
                      <Image src={imageUrls.star} alt="star" width={25} height={25} />
                      <Image src={imageUrls.star} alt="star" width={25} height={25} />
                      <Image src={imageUrls.star} alt="star" width={25} height={25} />
                    </div>
                    <div className="post-author">By: foodislife123</div>
                  </div>
                  <div className="post-image">
                    <Image src={imageUrls.nasilemak} alt="Nasi Lemak demo" width={200} height={120} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="see-more-container">
            <Link href="/cuisinePage" className="see-more-button">
              See More →
            </Link>
          </div>

          <div className="cta-section">
            <div className="cta-background">
              <Image src={imageUrls.foodtrail} alt="Food trail background" width={1700} height={600} />
              <div className="cta-overlay"></div>
              <div className="cta-content">
                <h2 className="cta-title">Ready to explore?</h2>
                <p className="cta-subtitle">Create your personalized food trail and discover hidden gems</p>
                <Link href="../food-trail" className="cta-button" data-testid="cta-food-trail-link">
                  Create Your Food Trail
                </Link>
              </div>
            </div>
          </div>

          <div className="footer-quote">
            <p>~Redefining food discovery~</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default Home;