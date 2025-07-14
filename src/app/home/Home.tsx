'use client';

import React, { useEffect, useState } from 'react';
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

function Home() {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }

      if (user) {
        const fetchedUsername = user.user_metadata?.username || user.email;
        setUsername(fetchedUsername);
      }
    };

    fetchUser();
  }, []);

useEffect(() => {
  const fetchImageUrls = async () => {
    const urls: Record<string, string> = {};
    for (const [key, file] of Object.entries(imageKeys)) {
      const { data } = supabase.storage.from('pictures').getPublicUrl(file);
      urls[key] = data.publicUrl;
    }
    // simulate slow load
    await new Promise(resolve => setTimeout(resolve, 500));

    setImageUrls(urls);
    setIsMounted(true);
  };

  fetchImageUrls();
}, []);


  useEffect(() => {
    if (!carouselApi) return;

    setTotalSlides(carouselApi.scrollSnapList().length);
    setCurrentSlide(carouselApi.selectedScrollSnap() + 1);

    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap() + 1);
    };
    carouselApi.on('select', onSelect);

    const autoplayInterval = setInterval(() => {
      const nextIndex =
        (carouselApi.selectedScrollSnap() + 1) % carouselApi.scrollSnapList().length;
      carouselApi.scrollTo(nextIndex);
    }, 3000); // 3 seconds interval

    return () => {
      carouselApi.off('select', onSelect);
      clearInterval(autoplayInterval);
    };
  }, [carouselApi]);

    if (!isMounted || Object.keys(imageUrls).length === 0) {
    return <LoadingScreen />;
  }

  const carouselImages = [
    {
      src: imageUrls.chickenrice,
      description: 'Hainanese Chicken Rice - A Singaporean classic!',
    },
    {
      src: imageUrls.malayrice,
      description: 'Nasi Lemak - Fragrant rice with spicy sambal and more.',
    },
    {
      src: imageUrls.nasibriyani,
      description: 'Nasi Briyani - Aromatic spiced rice with tender meat.',
    },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    } else {
      // Optionally redirect to login/home page after logout
      router.push('/login');
    }
  };

  return (
    <ProtectedRoute>
    <div className="Home">
      <div className="background-img-1"></div>
      <div className="header-container">
        <div className="logo-section">
          <Image id="Logo-1" src={imageUrls.logo} alt="Logo" width={240} height={80} />
          <div className="Welcome-1">Welcome {username ? username : 'Guest'},</div>
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

      <div className="text-box-1">
        <nav className="navigation-bar">
          <div className="nav-container">
            {/* <Link href="/home" className="nav-link active">
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Home</span>
            </Link> */}
            <Link href="/cuisinePage" className="nav-link">
              <span className="nav-icon">🍽️</span>
              <span className="nav-text">Cuisines</span>
            </Link>
            <Link href="/popular" className="nav-link">
              <span className="nav-icon">🔥</span>
              <span className="nav-text">Popular</span>
            </Link>
            <Link href="/about" className="nav-link">
              <span className="nav-icon">ℹ️</span>
              <span className="nav-text">About</span>
            </Link>
            <Link href="../food-trail" className="nav-link special-link">
              <span className="nav-icon">🗺️</span>
              <span className="nav-text">Create Food Trail</span>
            </Link>
          </div>
        </nav>

        <div className="section-header">
          <h2 className="section-title">🌟 Trending Today!</h2>
        </div>

        {/* Carousel with autoplay */}
        <div className="carousel">
          <Carousel setApi={setCarouselApi} className="w-full">
            <CarouselContent>
              {carouselImages.map((item, index) => (
                <CarouselItem key={index}>
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-4">
                      <Image src={item.src} alt={`carousel-${index}`}  className="carousel-img" width={800} height={300} style={{ borderRadius: '10px' }} />
                      <p className="carousel-description mt-2 text-center">{item.description}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
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

          {/* Comment Box 1 */}
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

          {/* Comment Box 2 */}
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

          {/* Comment Box 3 */}
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
              <Link href="../food-trail" className="cta-button">
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