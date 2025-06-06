'use client';
import React from 'react';
//import { useNavigate, Link } from "react-router-dom";
import Image from 'next/image';
import './dragon-palace.css';
import Link from 'next/link';

function DragonPalace() {
    return (
        <div className="DragonPalace">
            {/* Background image as a separate layer */}
            <div className="background-layer" />
            <div className="content-layer">
                <Image 
                    id="Logo-6" 
                    src='/pictures/Food4Thought.png' 
                    alt="Food 4 Thought Logo" 
                    height={80}
                    width={240}
                />
                <div className="text-box-6">
                    <div className="dragon-palace-header">Swee Choon Tim Sum</div>
                    <Image 
                        id="dp-img-1" 
                        src='/pictures/dragon-palace-pic-1.jpg' 
                        alt="Dragon palace image 1"
                        width={600}
                        height={400}>
                    </Image>
                    <Image 
                        id="dp-img-2" 
                        src='/pictures/dragon-palace-pic-2.jpg' 
                        alt="Dragon palace image 2"
                        width={600}
                        height={400}
                    >
                    </Image>
                    <Image 
                        id="dp-google-map" 
                        src='/pictures/dp-google-map.png' 
                        alt="Dragon palace google map"
                        width={300}
                        height={200}
                    >
                    </Image>
                    <Link 
                        href="/cuisinePage/indiv-cuisines/reviews/swee-choon-gmaps"
                        className="dp-google-maps-text"
                        >View on google maps
                    </Link>
                    </div>
                    <div className="Dragon-Palace-Comment-1">
                        <div className="Dragon-Palace-Comment-1-text">
                            Swee Choon serves flavors that bring comfort and nostalgia! The Liu Sha Bao was rich, molten, and perfectly sweet-salty, while the Char Siew Sou was crisp and packed with savory BBQ goodness.
                            Loved the Har Gow—fresh, bouncy prawns wrapped in silky skin.
                            The Yangzhou Fried Rice was fragrant and satisfying, and the Siew Mai were juicy and flavorful with a nice bite.
                            Generous portions, friendly service, and a wide variety of classic dim sum dishes. A must-visit for anyone craving authentic, old-school Hong Kong-style dim sum in Singapore! Will definitely be back!
                        </div>
                        <div className="comment-1-user">
                            By: Pokemon123
                        </div>
                        <Image 
                            id="Thumbs-up-1"
                            src='/pictures/thumbs-up.jpg'
                            alt='thumbs up'
                            width={40}
                            height={20}
                            title= 'upvote'
                        ></Image>
                        <Image 
                            id="Thumbs-down-1"
                            src='/pictures/thumbs-down.jpg'
                            alt='thumbs down'
                            width={40}
                            height={20}
                            title= 'downvote'
                        ></Image>
                        <Image 
                            id="Red-flag-1"
                            src='/pictures/red-flag.png'
                            alt='red flag'
                            width={40}
                            height={20}
                            title= 'Flag for inappropriate content'
                        ></Image>
                    </div>   
                    <div className="Dragon-Palace-Comment-2">
                        <div className="Dragon-Palace-Comment-2-text">
                            Totally agree with you! Swee Choon really nails that comforting, nostalgic vibe—everything tastes just how you'd want good dim sum to be.
                            The Liu Sha Bao is incredible, and the Char Siew Bao is always on point.
                            Those Chive & Pork Dumplings? So good too—juicy and full of flavor.
                            Love the generous portions, and the staff are always super friendly. Can’t wait to go back for more!
                        </div>
                        <div className="comment-2-user">
                            By: Naruto123
                        </div>
                        <Image 
                            id="Thumbs-up-2"
                            src='/pictures/thumbs-up.jpg'
                            alt='thumbs up'
                            width={40}
                            height={20}
                            title= 'upvote'
                        ></Image>
                        <Image 
                            id="Thumbs-down-2"
                            src='/pictures/thumbs-down.jpg'
                            alt='thumbs down'
                            width={40}
                            height={20}
                            title='downvote'
                        ></Image>
                        <Image 
                            id="Red-flag-2"
                            src='/pictures/red-flag.png'
                            alt='red flag'
                            width={40}
                            height={20}
                            title= 'Flag for inappropriate content'
                        ></Image>
                    </div>
                    <div className="Dragon-Palace-Comment-3"> 
                        <div className="Dragon-Palace-Comment-3-text">
                            Glad you enjoyed the flavors! I thought the food was pretty tasty too, especially the Liu Sha Bao and dumplings.
                            But honestly, the portions felt a bit small for me, and the service wasn’t quite what I hoped for.
                            Still, the taste was solid—just wish the overall experience matched the quality of the food.
                        </div>
                        <div className="comment-3-user">
                            By: JJK123
                        </div>
                        <Image 
                            id="Thumbs-up-3"
                            src='/pictures/thumbs-up.jpg'
                            alt='thumbs up'
                            width={40}
                            height={20}
                            title= 'upvote'
                        ></Image>
                        <Image 
                            id="Thumbs-down-3"
                            src='/pictures/thumbs-down.jpg'
                            alt='thumbs down'
                            width={40}
                            height={20}
                            title= 'downvote'
                        ></Image>
                        <Image 
                            id="Red-flag-3"
                            src='/pictures/red-flag.png'
                            alt='red flag'
                            width={40}
                            height={20}
                            title= 'Flag for inappropriate content'
                        ></Image>
                    </div>
                </div>
            </div>  
    );
}

export default DragonPalace;