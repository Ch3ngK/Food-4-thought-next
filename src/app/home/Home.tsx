'use client';

import React from 'react';
import './Home.css';
import Link  from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';

const logo = '/pictures/Food4Thought.png';
const instagram = '/pictures/instagram-icon.png';
const twitter = '/pictures/twitter-icon.png';
const facebook = '/pictures/facebook-icon.png';
const tiktok = '/pictures/tiktok-icon.png';
const newspaper = '/pictures/newspaper.jpg';
const western = '/pictures/western-demo.png';
const yongtaufu = '/pictures/yong-tau-fu-demo.jpg';
const nasilemak = '/pictures/nasi-lemak-demo.jpg';
const star = '/pictures/star.png';
const halfstar = '/pictures/half-star.png';
const foodtrailbackground = '/pictures/food-trail-background.jpg';
const chickenrice = '/pictures/chicken-rice.png';
const malayrice = '/pictures/nasi-lemak.png';
const nasibriyani = '/pictures/nasi-briyani.png';

function Home() {
    const images: { src: string; description: string }[] = [
        { src: chickenrice, description: "Hainanese Chicken Rice - A Singaporean classic!" },
        { src: malayrice, description: "Nasi Lemak - Fragrant rice with spicy sambal and more." },
        { src: nasibriyani, description: "Nasi Briyani - Aromatic spiced rice with tender meat." }
    ];

    return (
        <div className="Home"> 
            <div className="background-img-1"></div>
            <div className="Grey-box-1">
                <Image id="Logo-1" src={logo} alt="Food 4 Thought Logo" width={240} height={80} />
                <Image id="Instagram" src={instagram} alt="Instagram icon" width={70} height={70} />
                <Image id="Twitter" src={twitter} alt="Twitter icon" width={70} height={70} />
                <Image id="Facebook" src={facebook} alt="Facebook icon" width={70} height={70} />
                <Image id="Tiktok" src={tiktok} alt="Tiktok icon" width={70} height={70} />
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
                <Swiper className="swiper-slide"
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000 }}
                    loop
                    spaceBetween={20}
                    slidesPerView={1}
                >
                    {images.map((item, idx) => (
                        <SwiperSlide key={idx}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Image 
                                    src={item.src}
                                    alt={`carousel ${idx}`} 
                                    width={600}
                                    height={400}
                                    style={{ borderRadius: "10px" }} 
                                />
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
                    <Image id="Newspaper" src={newspaper} alt="Newspaper" width={1700} height={900} />
                    <div className="Newspaper-overlay"></div>
                    <div className="Comment-1-box">
                        <div className="Comment-1-text">Cheap and affordable western at ang mo kio coffeeshop</div>
                        <Image id="Western-demo" src={western} alt="Western food demo" width={300} height={150} />
                        <Image id="rating-1" src={star} alt="4.5 stars rating-1" width={60} height={50} />
                        <Image id="rating-2" src={star} alt="4.5 stars rating-2" width={60} height={50} />
                        <Image id="rating-3" src={star} alt="4.5 stars rating-3" width={60} height={50} />
                        <Image id="rating-4" src={star} alt="4.5 stars rating-4" width={60} height={50} />
                        <Image id="rating-5" src={halfstar} alt="4.5 stars rating-5" width={60} height={50} />
                        <div className="Username-1">By: Foodreviewer123</div>
                    </div>
                    <div className="Comment-2-box">
                        <div className="Comment-2-text">Best Yong Tau Fu in Singapore, must try!</div>
                        <Image id="Yong-Tau-Fu-demo" src={yongtaufu} alt="Yong Tau Fu demo" width={300} height={200} />
                        <Image id="rating-6" src={star} alt="4.5 stars rating-6" width={60} height={50} />
                        <Image id="rating-7" src={star} alt="4.5 stars rating-7" width={60} height={50} />
                        <Image id="rating-8" src={star} alt="4.5 stars rating-8" width={60} height={50} />
                        <Image id="rating-9" src={star} alt="4.5 stars rating-9" width={60} height={50} />
                        <Image id="rating-10" src={halfstar} alt="4.5 stars rating-10" width={60} height={50} />
                        <div className="Username-2">By: ilovefood123</div>
                    </div>
                    <div className="Comment-3-box">
                        <div className="Comment-3-text">Best nasi lemak in Singapore, must try!</div>
                        <Image id="Nasi-Lemak-demo" src={nasilemak} alt="Nasi Lemak demo" width={300} height={200} />
                        <Image id="rating-11" src={star} alt="5 stars rating-11" width={60} height={50} />
                        <Image id="rating-12" src={star} alt="5 stars rating-12" width={60} height={50} />
                        <Image id="rating-13" src={star} alt="5 stars rating-13" width={60} height={50} />
                        <Image id="rating-14" src={star} alt="5 stars rating-14" width={60} height={50} />
                        <Image id="rating-15" src={star} alt="5 stars rating-15" width={60} height={50} />
                        <div className="Username-3">By: foodislife123</div>
                    </div>
                </div>
                <button type="submit" className="See-all-button">See more</button>
                <div className="Image-container">
                    <Image id="Food-trail-background" src={foodtrailbackground} alt="Food trail background" width={1700} height={900} />
                    <Link href="../food-trail" className="Hover-button-link">Create your food trail!</Link>
                    <div className="Dark-overlay"></div>
                </div>
                <div className="Quote">~Redefining food discovery~</div>
            </div>
        </div> 
    );
}

export default Home;