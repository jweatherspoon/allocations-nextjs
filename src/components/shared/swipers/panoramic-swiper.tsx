'use client';

import { EffectCoverflow, FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/free-mode';

export function PanoramicSwiper({ cards }: { cards: React.ReactNode[] }) {
  const slides = cards.map((card, index) => (
    <SwiperSlide key={index}>{card}</SwiperSlide>
  ));

  while (slides.length < 6) {
    slides.push(
      <SwiperSlide key={`dup-${slides.length}`}>
        {cards[slides.length % cards.length]}
      </SwiperSlide>
    );
  }

  return cards.length <= 1 ? (
    cards[0] || null
  ) : (
    <div className='w-full overflow-hidden'>
      <Swiper
        slidesPerView={1.1}
        spaceBetween={10}
        loop
        simulateTouch
        touchRatio={1.5}
        effect='coverflow'
        coverflowEffect={{
          rotate: 30,
          stretch: 10,
          depth: 150,
          modifier: 1,
          slideShadows: false,
        }}
        freeMode={{
          enabled: true,
          momentum: false,
          sticky: true,
        }}
        centeredSlides
        modules={[EffectCoverflow, FreeMode]}
      >
        {slides}
      </Swiper>
    </div>
  );
}
