import { AreaRect, LandConfig } from '@/shared/const/scene.const';
import { useCurrentLevel, useGlobalStore } from '@/shared/hooks';
import { FC, RefObject, useEffect, useState } from 'react';
import Area from '../components/area.component';

interface MapElementInterface {
  ref: RefObject<HTMLDivElement | null>;
}

const MapElement: FC<MapElementInterface> = ({ ref }) => {
  const [opendLv, setOpendLv] = useState(-1);
  const { pageStatus } = useGlobalStore();
  const currentLevel = useCurrentLevel();

  useEffect(() => {
    if (pageStatus != 'complete') {
      setOpendLv(-1);
      return;
    }
    setOpendLv(currentLevel);
  }, [pageStatus, currentLevel]);

  return (
    <div
      ref={ref}
      className="w-full h-full absolute left-0 top-0 origin-center will-change-transform"
      onClick={() => {
        // setOpendLv(opendLv + 1);
      }}
    >
      <div
        className="absolute-center"
        style={{ background: 'rgba(0,0,0,0.0)', width: LandConfig.width, height: LandConfig.height }}
      >
        {/* <MapDebugView /> */}
        {AreaRect.map((item, index) => {
          return <Area key={index} lv={item.lv} opend={opendLv >= item.lv} />;
        })}
      </div>
    </div>
  );
};

export default MapElement;
