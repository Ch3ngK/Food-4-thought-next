'use client';

import React, { useEffect, useState } from 'react';
import './about.css';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../supabaseClient';

const imageKeys = {
  logo: 'Food4Thought.png',

};

function AboutPage() {
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
          setIsMounted(true);
        };
        fetchImageUrls();
      }, []);
    
      if (!isMounted || Object.keys(imageUrls).length === 0) {
          return <div className="loading">Loading...</div>;
      }

    return (
        <div className='AboutPage-container'>
            <div className='background-img-about'></div>
            <Image id="Logo-about" src={imageUrls.logo} alt="Logo" width={240} height={80} />
            <div className='text-box-about'>
                <div className='about-us'>About Food4Thought</div>
                <br></br><br></br>
                <div className='about-us-text-1'>Welcome to Food4Thought, where great food meets honest opinions </div>
                <br></br>
                <div className='our-story'>Our story</div>
                <br></br>
                <div className='our-story-text'>Food4Thought started out as a mini project between two university students who shared the same love for food and coding. 
                                                We decided to share our love for food with the public via Food4Thought!
                </div>
                <br></br>
                <div className='our-goal'>Our goal</div>
                <br></br>
                <div className='about-us-text-2'>We believe that the best food experiences come not from advertisements, but from real people sharing their genuine thoughts. 
                                                 That’s why we built Food4Thought — a platform designed for foodies to explore, review, and celebrate the diverse culinary scene of Singapore.
                                                 Our goal is simple: to make finding good food easier, more transparent, and more fun. 
                                                 From hawker stalls to hidden cafes, we spotlight local favourites through user-submitted reviews and photos.
                                                 Whether you're a local foodie, a visiting tourist, or just someone hungry for something new, Food4Thought helps you make smarter dining decisions.
                                                 Join us, contribute your reviews, and be part of a food-loving community that values taste and truth. 
                </div>
            </div>
        </div>
    
    );
}

export default AboutPage;