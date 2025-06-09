'use client';

import React, { useEffect, useState } from 'react';
import './Home.css';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';
import { supabase } from '../supabaseClient';

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

  if (!isMounted || Object.keys(imageUrls).length === 0) return null;

  const carouselImages = [
    { src: imageUrls.chickenrice, description: "Hainanese Chicken Rice - A Singaporean classic!" },
    { src: imageUrls.malayrice, description: "Nasi Lemak - Fragrant rice with spicy sambal and more." },
    { src: imageUrls.nasibriyani, description: "Nasi Briyani - Aromatic spiced rice with tender meat." },
  ];

  return (
    <div className="Home">
      <div className="background-img-1"></div>
      <div className="Grey-box-1">
        <Image id="Logo-1" src={imageUrls.logo} alt="Logo" width={240} height={80} />
        <Image id="Instagram" src={imageUrls.instagram} alt="Instagram icon" width={70} height={70} />
        <Image id="Twitter" src={imageUrls.twitter} alt="Twitter icon" width={70} height={70} />
        <Image id="Facebook" src={imageUrls.facebook} alt="Facebook icon" width={70} height={70} />
        <Image id="Tiktok" src={imageUrls.tiktok} alt="Tiktok icon" width={70} height={70} />
        <div className="Welcome-1">Welcome Benjamin,</div>
      </div>

      <div className="text-box-1">
        <div className="Grey-box-2">
          <Link href="/cuisinePage" className="Cuisines-text-1">Cuisines</Link>
          <div className="Popular-text-1">Popular</div>
          <div className="Home-text-1">Home</div>
          <div className="About-text-1">About</div>
          <div className="Create-food-trail-text-1">Create food trail today!</div>
        </div>

        <div className="Black-box-1">
          <div className="Trending">Trending today!</div>
        </div>

        <Swiper
          className="swiper-slide"
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          loop
          spaceBetween={20}
          slidesPerView={1}
        >
          {carouselImages.map((item, idx) => (
            <SwiperSlide key={idx}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Image src={item.src} alt={`carousel-${idx}`} width={600} height={400} style={{ borderRadius: "10px" }} />
                <p className="carousel-description">{item.description}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <br /><br /><br />

        <div className="Black-box-2">
          <div className="Fresh-from-community-text">Fresh from the community</div>
        </div>

        <div className="Newspaper-container">
          <Image id="Newspaper" src={imageUrls.newspaper} alt="Newspaper" width={1700} height={900} />
          <div className="Newspaper-overlay"></div>

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
