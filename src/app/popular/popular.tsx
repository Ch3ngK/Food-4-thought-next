'use client';
import './popular.css';
import Image from 'next/image';

const LogoUrl = 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures/Food4Thought.png'; 
const Items = [
  {
    name: 'Chilli Crab',
    description: 'A spicy and flavorful crab dish, perfect for seafood lovers.',
    imageUrl: 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures//popular-pic-1.avif'
  },
  {
    name: 'Salted Egg Chicken',
    description: 'Crispy chicken coated in a rich salted egg sauce, a must-try for egg lovers.',
    imageUrl: 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures//popular-pic-2.jpg'
  },
  {
    name: 'Thai Egg Rice',
    description: 'A simple yet delicious dish of rice topped with a perfectly cooked egg and Thai seasonings.',
    imageUrl: 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures//popular-pic-3.webp'
  }
];

export default function Popular() {
  return (
    <div className="App">
      <Image id="Logo-popular" src={LogoUrl} alt="Food4Thought Logo" width={240} height={80} />
      <header className="App-header">
        <div className="background-img-popular"></div>
        <div className="text-box-popular">
          <div className='popular-food-items'>Popular food items</div>
          <div className='pft-quote'>Discover the most loved recipes by our community.</div>
              <div className="food-items-container">
                {Items.map((item, index) => (
                  <div key={index} className="food-item">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={300}
                      height={200}
                      style={{ width: '100%', height: 'auto' }}
                    />
      <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{item.name}</p>
      <p>{item.description}</p>
    </div>
  ))}
</div>

          <div className='popular-food-trails'>Popular food trails</div>
        </div>
      </header>
    </div>
  );
}
