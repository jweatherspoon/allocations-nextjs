'use client';

import { EffectFade } from 'swiper/modules';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';

import StatusChip from '@/components/shared/chip/status-chip';
import {
  ChipStatus,
  RenderedChipStatus,
} from '@/models/status/chip-status.enum';

import 'swiper/css';
import 'swiper/css/effect-fade';

function ChipSwiperSlide({
  id,
  status,
  label,
}: {
  id: string;
  status: ChipStatus;
  label: string;
}) {
  const swiper = useSwiper();

  return (
    <div
      onClick={() => {
        swiper.slideNext();
      }}
    >
      <StatusChip status={status} className='w-full flex justify-center'>
        {label}
      </StatusChip>
    </div>
  );
}

export default function EditableChip({
  currentStatus,
  statuses,
  onCommitChangeAction,
}: {
  currentStatus: RenderedChipStatus;
  statuses: RenderedChipStatus[];
  onCommitChangeAction?: (newStatus: RenderedChipStatus) => void;
}) {
  return (
    <div className='w-24'>
      <Swiper
        slidesPerView={1}
        rewind
        onSlideChange={(swiper) => {
          console.log('Slide changed to index:', swiper.activeIndex);
          onCommitChangeAction?.(statuses[swiper.activeIndex]);
        }}
        effect='fade'
        fadeEffect={{
          crossFade: true,
        }}
        modules={[EffectFade]}
        initialSlide={statuses.findIndex(
          (status) =>
            status.id === currentStatus.id &&
            status.status === currentStatus.status &&
            status.label === currentStatus.label
        )}
      >
        {statuses.map((slide) => (
          <SwiperSlide key={slide.id}>
            <ChipSwiperSlide
              id={slide.id}
              status={slide.status}
              label={slide.label}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
