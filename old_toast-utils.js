import toast from 'react-hot-toast';
import Link from 'next/link';

// Toast de succès personnalisé avec style correspondant à l'image
export const successToast = (message, linkText = " View Cart", linkUrl = "/cart") => {
  return toast.custom(
    (t) => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-3xl bg-gray-900 text-white p-4 px-4 rounded-lg shadow-md flex items-center justify-between mr-20`}
      style={{ marginRight: '80px' }} // Décalage vers la gauche

          >
        <div className="flex items-center">
          <div className="bg-green-500 rounded-full p-1 mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <span className="text-base">{message}&nbsp;&nbsp;</span>
        </div>
        
        <div className="flex items-center ml-4">
          {linkText && (
            <>
              <Link href={linkUrl} className="text-blue-500 hover:text-blue-400 font-bold text-base">
                {linkText}
              </Link>
            </>
          )}
        <button 
  onClick={() => toast.remove(t.id)} 
  className="text-white hover:text-gray-300 transition-colors cursor-pointer"
  aria-label="Close"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
</button>
        </div>
      </div>
    ),
    { 
      duration: 5000,
      id: 'product-toast',
    }
  );
};

// Toast d'erreur personnalisé
export const errorToast = (message) => {
  return toast.custom(
    (t) => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-3xl bg-gray-900 text-white p-4 px-4 rounded-lg shadow-md flex items-center justify-between`}>
        <div className="flex items-center">
          <div className="bg-red-500 rounded-full p-1 mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <span className="text-base">{message}</span>
        </div>
        
        <button 
  onClick={() => toast.remove(t.id)} 
  className="text-white hover:text-gray-300 transition-colors cursor-pointer"
  aria-label="Close"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
</button>
      </div>
    ),
    { 
      duration: 5000,
      position: 'bottom-right'
    }
  );
};

// Toast d'information personnalisé
export const infoToast = (message) => {
  return toast.custom(
    (t) => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-3xl bg-gray-900 text-white p-4 px-4 rounded-lg shadow-md flex items-center justify-between`}>
        <div className="flex items-center">
          <div className="bg-blue-500 rounded-full p-1 mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <span className="text-base">{message}</span>
        </div>
        
        <button 
  onClick={() => toast.remove(t.id)} 
  className="text-white hover:text-gray-300 transition-colors cursor-pointer"
  aria-label="Close"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
</button>
      </div>
    ),
    { 
      duration: 5000,
      position: 'bottom-right'
    }
  );
};

// Utilisez cette fonction au lieu de toast.success
// Exemple: import { successToast } from '../utils/toast-utils';
//          successToast('Product added to cart!');
