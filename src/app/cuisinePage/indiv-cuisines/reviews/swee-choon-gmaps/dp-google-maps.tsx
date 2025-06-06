'use client';
import React from 'react';
import Image from 'next/image';
import './dp-google-maps.css';

function SweeChoonGmaps() {
    return (
        <div className='Swee-Choon-Gmaps'>
            <div className='background-layer'></div>
            <div className='foreground-content'>
                <Image 
                    id="Logo-scg"
                    src='/pictures/Food4Thought.png'
                    alt="Food 4 Thought Logo" 
                    height={80}
                    width={240}
                />
                <div className='text-box-scg'>
                    <div className='scg-text'>View Swee Choon on Google Maps</div>
                    <iframe
                        className='google-maps-iframe'
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.808567883592!2d103.8453745!3d1.3690543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da1770a9d38737%3A0xae1e8e8bfe90f1ce!2sSwee%20Choon%20Tim%20Sum%20Restaurant%20(Express)%20-%20AMK%20Hub%20%7C%20OPEN%2024HRS%20DAILY!5e0!3m2!1sen!2ssg!4v1717481467070!5m2!1sen!2ssg"
                        width="1000"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}

export default SweeChoonGmaps;