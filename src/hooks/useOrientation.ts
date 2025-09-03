import { useEffect, useState } from 'react';

function getOrientation() {
  return window.innerHeight > window.innerWidth;
}

function useOrientation() {
  // 添加错误处理，确保React上下文可用
  try {
    const [isPortrait, setIsPortrait] = useState(getOrientation());

    useEffect(() => {
      function handleResize() {
        setIsPortrait(getOrientation());
      }

      window.addEventListener('resize', handleResize);

      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isPortrait;
  } catch (error) {
    // 如果React上下文不可用，返回默认值
    console.warn('React context not available in useOrientation, returning default value');
    return window.innerHeight > window.innerWidth;
  }
}

export default useOrientation;
