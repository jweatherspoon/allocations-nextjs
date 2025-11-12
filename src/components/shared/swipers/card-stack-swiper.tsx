'use client';

import { EffectCards } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/effect-cards';

export function CardStackSwiper({
  cards,
  direction = 'horizontal',
}: {
  cards: React.ReactNode[];
  direction?: 'horizontal' | 'vertical';
}) {
  return (
    <div className='w-full overflow-hidden'>
      <Swiper
        slidesPerView={1.1}
        effect='cards'
        cardsEffect={{
          rotate: true,
          slideShadows: false,
        }}
        direction={direction}
        loop
        simulateTouch
        modules={[EffectCards]}
      >
        {cards.map((card, index) => (
          <SwiperSlide key={index}>{card}</SwiperSlide>
        ))}
        {cards.length < 3 &&
          cards.map((card, index) => (
            <SwiperSlide key={`dup-${index}`}>{card}</SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
}
