import { AreaRect } from '@/shared/const/scene.const';
import { areaToStyle } from '@/shared/utils';
import { FC } from 'react';

interface MapDebugViewInterface {}

const MapDebugView: FC<MapDebugViewInterface> = (props) => {
  return (
    <>
      <div className="w-20 h-20 rounded-circle bg-red-500 absolute left-0 top-0"></div>
      <div className="w-20 h-20 rounded-circle bg-red-500 absolute right-0 top-0"></div>
      <div className="w-20 h-20 rounded-circle bg-red-500 absolute left-0 bottom-0"></div>
      <div className="w-20 h-20 rounded-circle bg-red-500 absolute right-0 bottom-0"></div>

      {AreaRect.map((item, index) => {
        return <div key={index} className="bg-[rgba(0,0,0,0.28)] absolute" style={areaToStyle(item)}></div>;
      })}
    </>
  );
};

export default MapDebugView;
