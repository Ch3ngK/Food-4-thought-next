'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import './cuisinePage.css';
import { supabase } from '../supabaseClient'; // Adjust the path if needed

function CuisinePage() {
  const route = useRouter();

  const [logoUrl, setLogoUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');

  const [cuisineUrls, setCuisineUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadImages = async () => {
      const fetchUrl = async (fileName: string) => {
        const { data } = supabase.storage.from('pictures').getPublicUrl(fileName);
        return data.publicUrl;
      };

      const urls = await Promise.all([
        fetchUrl('Food4Thought.png'),
        fetchUrl('instagram-icon.png'),
        fetchUrl('twitter-icon.png'),
        fetchUrl('facebook-icon.png'),
        fetchUrl('tiktok-icon.png'),

        fetchUrl('western-demo.png'),
        fetchUrl('chinese.png'),
        fetchUrl('indian.png'),
        fetchUrl('japanese.png'),
        fetchUrl('korean.png'),
        fetchUrl('thai.png'),
        fetchUrl('viet.png'),
        fetchUrl('malay.png')
      ]);

      setLogoUrl(urls[0]);
      setInstagramUrl(urls[1]);
      setTwitterUrl(urls[2]);
      setFacebookUrl(urls[3]);
      setTiktokUrl(urls[4]);

      setCuisineUrls({
        Western: urls[5],
        Chinese: urls[6],
        Indian: urls[7],
        Japanese: urls[8],
        Korean: urls[9],
        Thai: urls[10],
        Vietnamese: urls[11],
        Malaysian: urls[12]
      });
    };

    loadImages();
  }, []);

  const cuisines = [
    'Western',
    'Chinese',
    'Indian',
    'Japanese',
    'Korean',
    'Thai',
    'Vietnamese',
    'Malaysian'
  ];

  return (
    <div className="CuisinePage">
      <div className="background-img"></div>
      <div className="header-box">
        {logoUrl && <Image id="Logo" src={logoUrl} alt="Food 4 Thought Logo" width={240} height={80} />}
        {instagramUrl && <Image id="Instagram" src={instagramUrl} alt="Instagram icon" width={50} height={50} />}
        {twitterUrl && <Image id="Twitter" src={twitterUrl} alt="Twitter icon" width={50} height={50} />}
        {facebookUrl && <Image id="Facebook" src={facebookUrl} alt="Facebook icon" width={50} height={50} />}
        {tiktokUrl && <Image id="Tiktok" src={tiktokUrl} alt="Tiktok icon" width={50} height={50} />}
      </div>
      <div className="main-box">
        <h1 className="page-title">Choose Your Cuisine !</h1>
        <div className="cuisine-grid">
          {cuisines.map((cuisine, index) => (
            <Link
              key={index}
              className="cuisine-item"
              href={cuisine === 'Chinese' ? '/cuisinePage/indiv-cuisines/chinese' : '#'}
              style={{ textDecoration: 'none', color: 'inherit' }}
              onClick={(e) => {
                if (cuisine !== 'Chinese') {
                  e.preventDefault();
                  alert(`${cuisine} page not implemented yet!`);
                }
              }}
            >
              {cuisineUrls[cuisine] && (
                <Image
                  src={cuisineUrls[cuisine]}
                  alt={`${cuisine} icon`}
                  width={550}
                  height={220}
                  className="cuisine-img"
                />
              )}
              <div className="cuisine-name">{cuisine}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CuisinePage;