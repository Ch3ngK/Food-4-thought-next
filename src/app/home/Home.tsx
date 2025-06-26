'use client';

import React, { useEffect, useState } from 'react';
import './Home.css';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

import { Card, CardContent } from '@/components/ui/card';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

import { Card, CardContent } from '@/components/ui/card';

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
      setImageUrls(urls);
    };

    fetchImageUrls();
    setIsMounted(true);
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

  if (!isMounted || Object.keys(imageUrls).length === 0) return null;

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
    <div className="Home">
      <div className="background-img-1"></div>
      <div className="Grey-box-1">
        <Image id="Logo-1" src={imageUrls.logo} alt="Logo" width={240} height={80} />
        <Image id="Instagram" src={imageUrls.instagram} alt="Instagram icon" width={70} height={70} />
        <Image id="Twitter" src={imageUrls.twitter} alt="Twitter icon" width={70} height={70} />
        <Image id="Facebook" src={imageUrls.facebook} alt="Facebook icon" width={70} height={70} />
        <Image id="Tiktok" src={imageUrls.tiktok} alt="Tiktok icon" width={70} height={70} />
        <button className = "logout-button" onClick={handleLogout}>Log out</button>
        <div className="Welcome-1">Welcome {username ? username : 'Guest'},</div>
      </div>

      <div className="text-box-1">
        <div className="Grey-box-2">
          <Link href="/cuisinePage" className="Cuisines-text-1">Cuisines</Link>
          <Link href="/popular" className="Popular-text-1">Popular</Link>
          <Link href="/home" className="Home-text-1">Home</Link>
          <Link href="/about" className="About-text-1">About</Link>
          <Link href='../food-trail' className="Create-food-trail-text-1">Create food trail today!</Link>
        </div>

        <div className="Black-box-1">
          <div className="Trending">Trending today!</div>
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
          <div className="text-muted-foreground py-2 text-center text-sm">
            Slide {currentSlide} of {totalSlides}
          </div>
        </div>

        <div className="Black-box-2">
          <div className="Fresh-from-community-text">Fresh from the community</div>
        </div>

        <div className="Newspaper-container">
          <Image id="Newspaper" src={imageUrls.newspaper} alt="Newspaper" width={1700} height={900} />

          {/* Comment Box 1 */}
          <div className="Comment-1-box">
            <div className="Comment-1-text">Cheap and affordable western at ang mo kio coffeeshop</div>
            <Image id="Western-demo" src={imageUrls.western} alt="Western food demo" width={300} height={150} />
            <Image id="rating-1" src={imageUrls.star} alt="star" width={60} height={50} />
            <Image id="rating-2" src={imageUrls.star} alt="star" width={60} height={50} />
            <Image id="rating-3" src={imageUrls.star} alt="star" width={60} height={50} />
            <Image id="rating-4" src={imageUrls.star} alt="star" width={60} height={50} />
            <Image id="rating-5" src={imageUrls.halfstar} alt="half star" width={60} height={50} />
            <div className="Username-1">By: Foodreviewer123</div>
          </div>

          {/* Comment Box 2 */}
          <div className="Comment-2-box">
            <div className="Comment-2-text">Best Yong Tau Fu in Singapore, must try!</div>
            <Image id="Yong-Tau-Fu-demo" src={imageUrls.yongtaufu} alt="Yong Tau Fu demo" width={300} height={200} />
            <Image id="rating-6" src={imageUrls.star} alt="star" width={60} height={50} />
            <Image id="rating-7" src={imageUrls.star} alt="star" width={60} height={50} />
            <Image id="rating-8" src={imageUrls.star} alt="star" width={60} height={50} />
            <Image id="rating-9" src={imageUrls.star} alt="star" width={60} height={50} />
            <Image id="rating-10" src={imageUrls.halfstar} alt="half star" width={60} height={50} />
            <div className="Username-2">By: ilovefood123</div>
          </div>

          {/* Comment Box 3 */}
          <div className="Comment-3-box">
            <div className="Comment-3-text">Best nasi lemak in Singapore, must try!</div>
            <Image id="Nasi-Lemak-demo" src={imageUrls.nasilemak} alt="Nasi Lemak demo" width={300} height={200} />
            <Image id="rating-11" src={imageUrls.star} alt="star" width={60} height={50} />
            <Image id="rating-12" src={imageUrls.star} alt="star" width={60} height={50} />
            <Image id="rating-13" src={imageUrls.star} alt="star" width={60} height={50} />
            <Image id="rating-14" src={imageUrls.star} alt="star" width={60} height={50} />
            <Image id="rating-15" src={imageUrls.star} alt="star" width={60} height={50} />
            <div className="Username-3">By: foodislife123</div>
          </div>
        </div>

        <button type="submit" className="See-all-button">See more</button>

        <div className="Image-container">
          <Image id="Food-trail-background" src={imageUrls.foodtrail} alt="Food trail background" width={1700} height={900} />
          <Link href="../food-trail" className="Hover-button-link">Create your food trail!</Link>
          <div className="Dark-overlay"></div>
        </div>

        <div className="Quote">~Redefining food discovery~</div>
      </div>
    </div>
  );
}

export default Home;
