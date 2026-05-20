import React from 'react';
import RippleButton from './RippleButton';
export default function RippleButtonUsage(props) {
    return (<div className="flex items-center justify-center w-full h-full min-h-[400px] p-8">
      <RippleButton {...props}>
        <span>Click Me</span>
      </RippleButton>
    </div>);
}
