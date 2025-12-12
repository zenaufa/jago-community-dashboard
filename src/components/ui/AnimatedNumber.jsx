import { useEffect, useState, useRef } from 'react';

export function AnimatedNumber({ 
  value, 
  formatter = (v) => v.toLocaleString('id-ID'),
  duration = 800,
  className = '',
  isHidden = false,
  hiddenText = '•••••••'
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const animationRef = useRef(null);

  useEffect(() => {
    if (isHidden) return;
    
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutExpo)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const currentValue = startValue + (endValue - startValue) * eased;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, isHidden]);

  if (isHidden) {
    return <span className={`${className} blur-sm select-none`}>{hiddenText}</span>;
  }

  return (
    <span className={className}>
      {formatter(displayValue)}
    </span>
  );
}

export function AnimatedCurrency({ 
  value, 
  duration = 800, 
  className = '',
  isHidden = false 
}) {
  const formatter = (v) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(v));
  };

  return (
    <AnimatedNumber
      value={value}
      formatter={formatter}
      duration={duration}
      className={className}
      isHidden={isHidden}
      hiddenText="Rp •••••••••"
    />
  );
}

export function AnimatedPercentage({ 
  value, 
  duration = 800, 
  className = '',
  showSign = true 
}) {
  const formatter = (v) => {
    const sign = showSign && v > 0 ? '+' : '';
    return `${sign}${v.toFixed(1)}%`;
  };

  return (
    <AnimatedNumber
      value={value}
      formatter={formatter}
      duration={duration}
      className={className}
    />
  );
}

