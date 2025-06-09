'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import './dragon-palace.css';
import Link from 'next/link';
import { supabase } from '@/app/supabaseClient'; // Adjust path if needed

const imageKeys = {
  logo: 'Food4Thought.png',
  dpImg1: 'dragon-palace-pic-1.jpg',
  dpImg2: 'dragon-palace-pic-2.jpg',
  dpMap: 'dp-google-map.png',
  thumbsUp: 'thumbs-up.jpg',
  thumbsDown: 'thumbs-down.jpg',
  redFlag: 'red-flag.png',
};

function DragonPalace() {
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

  if (!isMounted || Object.keys(imageUrls).length === 0) return null;

  return (
    <div className="DragonPalace">
      <div className="background-layer" />
      <div className="content-layer">
        <Image id="Logo-6" src={imageUrls.logo} alt="Food 4 Thought Logo" height={80} width={240} />

        <div className="text-box-6">
          <div className="dragon-palace-header">Swee Choon Tim Sum</div>
          <Image id="dp-img-1" src={imageUrls.dpImg1} alt="Dragon palace image 1" width={600} height={400} />
          <Image id="dp-img-2" src={imageUrls.dpImg2} alt="Dragon palace image 2" width={600} height={400} />
          <Image id="dp-google-map" src={imageUrls.dpMap} alt="Dragon palace google map" width={300} height={200} />
          <Link href="/cuisinePage/indiv-cuisines/reviews/swee-choon-gmaps" className="dp-google-maps-text">
            View on google maps
          </Link>
        </div>

        {/* Comment 1 */}
        <div className="Dragon-Palace-Comment-1">
          <div className="Dragon-Palace-Comment-1-text">
            Swee Choon serves flavors that bring comfort and nostalgia! The Liu Sha Bao was rich, molten, and perfectly sweet-salty, while the Char Siew Sou was crisp and packed with savory BBQ goodness.
            Loved the Har Gow—fresh, bouncy prawns wrapped in silky skin.
            The Yangzhou Fried Rice was fragrant and satisfying, and the Siew Mai were juicy and flavorful with a nice bite.
            Generous portions, friendly service, and a wide variety of classic dim sum dishes. A must-visit for anyone craving authentic, old-school Hong Kong-style dim sum in Singapore! Will definitely be back!
          </div>
          <div className="comment-1-user">By: Pokemon123</div>
          <Image id="Thumbs-up-1" src={imageUrls.thumbsUp} alt="thumbs up" width={40} height={20} title="upvote" />
          <Image id="Thumbs-down-1" src={imageUrls.thumbsDown} alt="thumbs down" width={40} height={20} title="downvote" />
          <Image id="Red-flag-1" src={imageUrls.redFlag} alt="red flag" width={40} height={20} title="Flag for inappropriate content" />
        </div>

        {/* Comment 2 */}
        <div className="Dragon-Palace-Comment-2">
          <div className="Dragon-Palace-Comment-2-text">
            Totally agree with you! Swee Choon really nails that comforting, nostalgic vibe—everything tastes just how you'd want good dim sum to be.
            The Liu Sha Bao is incredible, and the Char Siew Bao is always on point.
            Those Chive & Pork Dumplings? So good too—juicy and full of flavor.
            Love the generous portions, and the staff are always super friendly. Can’t wait to go back for more!
          </div>
          <div className="comment-2-user">By: Naruto123</div>
          <Image id="Thumbs-up-2" src={imageUrls.thumbsUp} alt="thumbs up" width={40} height={20} title="upvote" />
          <Image id="Thumbs-down-2" src={imageUrls.thumbsDown} alt="thumbs down" width={40} height={20} title="downvote" />
          <Image id="Red-flag-2" src={imageUrls.redFlag} alt="red flag" width={40} height={20} title="Flag for inappropriate content" />
        </div>

        {/* Comment 3 */}
        <div className="Dragon-Palace-Comment-3">
          <div className="Dragon-Palace-Comment-3-text">
            Glad you enjoyed the flavors! I thought the food was pretty tasty too, especially the Liu Sha Bao and dumplings.
            But honestly, the portions felt a bit small for me, and the service wasn’t quite what I hoped for.
            Still, the taste was solid—just wish the overall experience matched the quality of the food.
          </div>
          <div className="comment-3-user">By: JJK123</div>
          <Image id="Thumbs-up-3" src={imageUrls.thumbsUp} alt="thumbs up" width={40} height={20} title="upvote" />
          <Image id="Thumbs-down-3" src={imageUrls.thumbsDown} alt="thumbs down" width={40} height={20} title="downvote" />
          <Image id="Red-flag-3" src={imageUrls.redFlag} alt="red flag" width={40} height={20} title="Flag for inappropriate content" />
        </div>
      </div>
    </div>
  );
}

export default DragonPalace;