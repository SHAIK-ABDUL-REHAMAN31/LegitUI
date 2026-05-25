import React from 'react';
import BlurCursorText from './BlurCursorText';
export default function BlurCursorTextUsage(props) {
    return (<div className="flex flex-col items-center justify-center w-full min-h-[450px] p-12 relative overflow-hidden select-none">
      <BlurCursorText {...props}/>
    </div>);
}
