import { SoundSvg } from '@/shared/svg';
import classNames from 'classnames';
import { motion } from 'motion/react';
import { FC, useEffect, useRef, useState } from 'react';
import { useMintForestStore } from '../store/use-mint-forest-store';

interface BackGroundMusicInterface {}

const BackGroundMusic: FC<BackGroundMusicInterface> = (props) => {
  const [soundOpen, setSoundOpen] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { audioMuted, setAudioMuted } = useMintForestStore();

  useEffect(() => {
    const soundClosed = audioMuted;
    setSoundOpen(!soundClosed);

    const audio = new Audio('/projects/mint-forest/music/bg.mp3');
    audio.loop = true;
    audioRef.current = audio;

    if (!soundClosed) {
      audio.play().catch((error) => {
        console.error('自动播放被阻止，请点击按钮触发', error);
      });
    } else {
      audio.pause();
    }

    return () => {
      audio.pause();
    };
  }, [audioMuted]);

  const onSoundClick = () => {
    if (!audioRef.current) return;
    const next = !soundOpen;

    setSoundOpen(next);
    setAudioMuted(!next);

    if (!next) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  return (
    <div className="flex items-center h-15 pl-2 pr-5 gap-4 lg:gap-7 lg:px-6 lg:h-24 rounded-3xl bg-[rgba(0,0,0,0.5)]">
      <div
        className={classNames(
          'w-22 h-12 lg:w-25 lg:h-15 rounded-[18px] bg-black relative overflow-hidden p-1 flex transition-all',
          {
            'justify-end !bg-primary': soundOpen,
          }
        )}
        onClick={onSoundClick}
      >
        <motion.div
          className="w-10 h-10 lg:w-13 lg:h-13 rounded-circle bg-white"
          layout
          transition={{
            type: 'spring',
            visualDuration: 0.2,
            bounce: 0.2,
          }}
        />
      </div>
      <SoundSvg className={'w-8 h-10 lg:w-10 lg:h-12'} />
    </div>
  );
};

export default BackGroundMusic;
