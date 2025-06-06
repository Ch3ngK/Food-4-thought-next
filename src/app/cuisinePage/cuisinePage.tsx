// CuisinePage.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './cuisinePage.css';
//import chineseCuisine from './indiv-cuisines/chineseCuisine';
import Image from 'next/image';

const logo = '/pictures/Food4Thought.png';
const instagram = '/pictures/instagram-icon.png';
const twitter = '/pictures/twitter-icon.png';
const facebook = '/pictures/facebook-icon.png';
const tiktok = '/pictures/tiktok-icon.png';

// consting cuisine images
const westernImg = '/pictures/western-demo.png';
const chineseImg = '/pictures/chinese.png';
const indianImg = '/pictures/indian.png';
const japaneseImg = '/pictures/japanese.png';
const koreanImg = '/pictures/korean.png';
const thaiImg = '/pictures/thai.png';
const vietImg = '/pictures/viet.png';
const malayImg = '/pictures/malay.png';

function CuisinePage() {
  const route = useRouter();

  const cuisines = [
    { name: 'Western', img: westernImg },
    { name: 'Chinese', img: chineseImg },
    { name: 'Indian', img: indianImg },
    { name: 'Japanese', img: japaneseImg },
    { name: 'Korean', img: koreanImg },
    { name: 'Thai', img: thaiImg },
    { name: 'Vietnamese', img: vietImg },
    { name: 'Malaysian', img:malayImg }
    // Add more as needed
  ];

  return (
    <div className="CuisinePage">
      <div className="background-img"></div>
      <div className="header-box">
        <Image id="Logo" src={logo} alt="Food 4 Thought Logo" width={240} height={80} />
        <Image id="Instagram" src={instagram} alt="Instagram icon" width={50} height={50} />
        <Image id="Twitter" src={twitter} alt="Twitter icon" width={50} height={50} />
        <Image id="Facebook" src={facebook} alt="Facebook icon" width={50} height={50} />
        <Image id="Tiktok" src={tiktok} alt="Tiktok icon" width={50} height={50} />
      </div>
      <div className="main-box">
        <h1 className="page-title">Choose Your Cuisine !</h1>
        <div className="cuisine-grid">
          {cuisines.map((cuisine, index) => (
            <Link
              key={index}
              className="cuisine-item"
              href={cuisine.name === 'Chinese' ? '/cuisinePage/indiv-cuisines/chinese' : '#'}
              style={{ textDecoration: 'none', color: 'inherit' }}
              onClick={(e) => {
              if (cuisine.name !== 'Chinese') {
                e.preventDefault(); // Stop navigation
                alert(`${cuisine.name} page not implemented yet!`);
              }
          }}
            >
              <Image
                src={cuisine.img}
                alt={`${cuisine.name} icon`}
                width={550}
                height={220}
                className="cuisine-img"
              />
              <div className="cuisine-name">{cuisine.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CuisinePage;

