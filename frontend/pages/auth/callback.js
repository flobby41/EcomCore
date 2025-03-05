import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../../context/CartContext';
import { successToast } from '../../utils/toast-utils';

export default function AuthCallback() {
  const router = useRouter();
  const { loadCart, mergeLocalCart } = useCart();
  
  useEffect(() => {
    const handleCallback = async () => {
      const { token } = router.query;
      
      if (token) {
        // Stocker le token
        localStorage.setItem('token', token);
        
        // Charger le panier et fusionner si nécessaire
        await loadCart();
        await mergeLocalCart();
        
        successToast('Successfully signed in!');
        router.push('/products');
      }
    };
    
    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-center mt-4">Completing your sign in...</p>
      </div>
    </div>
  );
} 