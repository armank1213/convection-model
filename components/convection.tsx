"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Particle {
  x: string;
  y: string;
  color: string;
  size: number;
}

interface FlowIndicator {
  x: string;
  y: string;
  rotation: string;
  color: string;
}

const ConvectionModel = () => {
  const [time, setTime] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [flowIndicators, setFlowIndicators] = useState<FlowIndicator[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(t => (t + 1) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setParticles(generateAllParticles());
    setFlowIndicators(generateAllFlowIndicators());
  }, [time]);

  // Generate flow indicator arrows that rotate with the convection
  const generateFlowIndicators = (side: 'left' | 'right'): FlowIndicator[] => {
    const baseX = side === 'left' ? 25 : 75;
    const arrows = [];
    const numArrows = 12; // Number of arrows in each cell
   
    for (let i = 0; i < numArrows; i++) {
      const angle = ((time + (i * (360 / numArrows))) % 360) * (Math.PI / 180);
      const radius = 20; // Radius of the rotation path
     
      // Calculate position along the circular path
      let x, y;
      if (side === 'left') {
        // Clockwise rotation for left cell
        x = baseX + Math.cos(-angle) * radius;
        y = 50 + Math.sin(-angle) * radius;
      } else {
        // Counter-clockwise rotation for right cell
        x = baseX + Math.cos(angle) * radius;
        y = 50 + Math.sin(angle) * radius;
      }

      // Calculate arrow rotation based on position in the cycle
      let arrowRotation;
      if (side === 'left') {
        arrowRotation = (-angle * 180 / Math.PI) + 90; // Adjust for clockwise flow
      } else {
        arrowRotation = (angle * 180 / Math.PI) - 90; // Adjust for counter-clockwise flow
      }

      // Determine color based on position (hotter at bottom, cooler at top)
      const normalizedY = (y - 30) / 40;
      const temp = 1 - normalizedY;
      const color = `rgba(${255 * temp}, ${100 * temp}, ${255 * (1-temp)}, 0.6)`;

      arrows.push({
        x: `${x}%`,
        y: `${y}%`,
        rotation: `rotate(${arrowRotation}deg)`,
        color
      });
    }
    return arrows.map(arrow => ({
      ...arrow,
      x: parseFloat(arrow.x).toFixed(2) + '%',
      y: parseFloat(arrow.y).toFixed(2) + '%',
      rotation: `rotate(${Math.round(parseFloat(arrow.rotation))}deg)`,
      color: arrow.color.replace(/[\d.]+/g, m => parseFloat(m).toFixed(2))
    }));
  };

  // Generate particles with temperature gradient
  const generateParticles = (count: number, side: 'left' | 'right', densityFactor = 1, yPosition: 'top' | 'middle' | 'bottom' = 'middle'): Particle[] => {
    const actualCount = Math.floor(count * densityFactor);
   
    return Array.from({ length: actualCount }).map((_, i) => {
      const angle = ((time + (i * (360 / actualCount))) % 360) * (Math.PI / 180);
      const baseX = side === 'left' ? 25 : 75;
     
      // Adjust path based on position and ensure correct rotation for divergent boundaries
      const pathRadius = yPosition === 'top' ? 15 :
                        yPosition === 'bottom' ? 15 : 20;
     
      let x = baseX;
      let y = yPosition === 'top' ? 35 :
              yPosition === 'bottom' ? 65 : 50;
     
      // Modified movement pattern for divergent boundaries
      if (side === 'left') {
        // Left cell rotates clockwise
        x += Math.cos(-angle) * pathRadius;
        y += Math.sin(-angle) * pathRadius;
      } else {
        // Right cell rotates counterclockwise
        x += Math.cos(angle) * pathRadius;
        y += Math.sin(angle) * pathRadius;
      }

      const normalizedY = (y - 30) / 40;
      const temp = 1 - normalizedY;
     
      // Particle sizes based on density
      const size = y > 60 ? 8 : // Bottom (dense)
                  y > 45 ? 6 : // Middle
                  4;           // Top (less dense)
     
      // Modified color logic for clearer convection visualization
      const isRising = (side === 'left' && x > baseX) || (side === 'right' && x < baseX);
      const tempColor = isRising ?
        { r: 255, g: Math.floor(temp * 100), b: 0, a: 0.8 } :
        { r: Math.floor((1 - temp) * 100), g: 0, b: 255, a: 0.8 };

      return {
        x: `${x}%`,
        y: `${y}%`,
        color: `rgba(${tempColor.r}, ${tempColor.g}, ${tempColor.b}, ${tempColor.a})`,
        size
      };
    });
  };

  const generateAllParticles = (): Particle[] => {
    return [
      ...generateParticles(20, 'left', 2, 'bottom'),
      ...generateParticles(25, 'left', 1.5, 'middle'),
      ...generateParticles(20, 'left', 1, 'top'),
      ...generateParticles(20, 'right', 2, 'bottom'),
      ...generateParticles(25, 'right', 1.5, 'middle'),
      ...generateParticles(20, 'right', 1, 'top')
    ];
  };

  const generateAllFlowIndicators = (): FlowIndicator[] => {
    return [...generateFlowIndicators('left'), ...generateFlowIndicators('right')];
  };

  // Calculate plate movement based on time
  const plateOffset = Math.round(Math.sin(time * Math.PI / 180) * 8);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Earth's Interior Structure and Divergent Plate Boundary Model</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-96 bg-gray-900 rounded-lg overflow-hidden">
          <div className="absolute inset-0 rounded-b-[50%] overflow-hidden">
            {/* Inner Core - solid iron-nickel alloy (5400°C) */}
            <div className="absolute bottom-0 w-full h-1/4">
              <div className="w-full h-full bg-gradient-to-t from-red-900 via-red-800 to-red-700" />
            </div>
           
            {/* Outer Core - liquid iron-nickel alloy (4000-5000°C) */}
            <div className="absolute bottom-1/4 w-full h-1/2 bg-gradient-to-t from-orange-800 via-orange-700 to-orange-600">
              {/* Flow Indicators */}
              {flowIndicators.map((arrow, i) => (
                <div
                  key={`arrow-${i}`}
                  className="absolute w-6 h-2"
                  style={{
                    left: arrow.x,
                    top: arrow.y,
                    transform: `translate(-50%, -50%) ${arrow.rotation}`,
                    backgroundColor: arrow.color,
                    clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
                    transition: 'transform 0.05s linear'
                  }}
                />
              ))}
             
              {/* Particles */}
              {particles.map((particle, i) => (
                <div
                  key={`particle-${i}`}
                  className="absolute rounded-full"
                  style={{
                    left: particle.x,
                    top: particle.y,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    backgroundColor: particle.color,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
            </div>
           
            {/* Rest of the component remains the same */}
            {/* Mantle and Crust Layers */}
            <div className="absolute top-0 w-full h-1/4">
              {/* Lower Mantle - silicate rocks (1000-3700°C) */}
              <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-orange-600 to-orange-500" />
             
              {/* Upper Mantle - peridotite (900-1000°C) */}
              <div className="absolute bottom-1/3 w-full h-1/3 bg-gradient-to-t from-orange-500 to-stone-700" />
             
              {/* Crust with Plate Tectonics - granite/basalt (0-900°C) */}
              <div className="absolute top-0 w-full h-1/3">
                {/* Seafloor Spreading Center (Mid-Ocean Ridge) */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-full">
                  <div className="absolute top-0 left-0 w-1/2 h-full bg-stone-600"
                       style={{ transform: `translateX(${-plateOffset}px)` }}>
                    <div className="absolute right-0 top-0 w-1 h-full bg-red-500 opacity-50" />
                  </div>
                  <div className="absolute top-0 right-0 w-1/2 h-full bg-stone-600"
                       style={{ transform: `translateX(${plateOffset}px)` }}>
                    <div className="absolute left-0 top-0 w-1 h-full bg-red-500 opacity-50" />
                  </div>
                </div>

                {/* Subduction Zones */}
                <div className="absolute top-0 left-1/6 w-4 h-full bg-stone-700 transform -skew-x-45 opacity-80">
                  <div
                    className="absolute w-full h-1/2 bg-stone-600"
                    style={{
                      transform: `translateY(${time % 2}px)`,
                      transition: 'transform 0.5s ease-in-out'
                    }}
                  />
                </div>
                <div className="absolute top-0 right-1/6 w-4 h-full bg-stone-700 transform skew-x-45 opacity-80">
                  <div
                    className="absolute w-full h-1/2 bg-stone-600"
                    style={{
                      transform: `translateY(${time % 2}px)`,
                      transition: 'transform 0.5s ease-in-out'
                    }}
                  />
                </div>

                {/* Continental Plates */}
                <div className="absolute top-0 left-0 w-1/3 h-full bg-stone-500" />
                <div className="absolute top-0 right-0 w-1/3 h-full bg-stone-500" />
              </div>
            </div>
          </div>
         
          {/* Temperature Scale */}
          <div className="absolute right-4 top-4 bottom-4 w-4 bg-gradient-to-b from-stone-600 to-red-900 rounded">
            <div className="absolute -left-16 top-0 text-white text-sm">Surface (200°C)</div>
            <div className="absolute -left-16 bottom-0 text-white text-sm">Core (5400°C)</div>
          </div>
        </div>
       
        {/* Legend */}
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-stone-500"></div>
            <span>Continental Crust - Granite (200-400°C)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-stone-600"></div>
            <span>Oceanic Crust - Basalt (0-900°C)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500"></div>
            <span>Mantle - Silicate rocks, Peridotite (900-3700°C)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-700"></div>
            <span>Core (Heat Source) - Liquid Iron-Nickel alloy (4000-5000°C)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConvectionModel;