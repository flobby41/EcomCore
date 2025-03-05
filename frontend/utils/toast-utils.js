import toast from 'react-hot-toast';
import Link from 'next/link';

// Toast de succès personnalisé
export const successToast = (message, linkText = "View Cart", linkUrl = "/cart") => {
  return toast.custom(
    (t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-3xl bg-gray-900 text-white p-4 rounded-lg shadow-md flex items-center justify-between mr-20`}
        style={{ marginRight: '80px' }}>
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
            <Link href={linkUrl} className="text-blue-500 hover:text-blue-400 font-bold text-base">
              {linkText}
            </Link>
          )}
          <button onClick={() => toast.remove(t.id)} className="text-white hover:text-gray-300 cursor-pointer" aria-label="Close">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    ),
    { position: "top-right", duration: 5000, id: 'success-toast' }
  );
};

// Toast pour l'ajout d'un produit
export const productAddedToast = (productName) => {
  return successToast(`${productName} was added to cart`);
};

// Toast pour la suppression d'un produit avec annulation
export const productRemovedToast = (productName, undoFunction = () => {}) => {
  return toast.custom(
    (t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-3xl bg-gray-900 text-white p-4 rounded-lg shadow-md flex items-center justify-between mr-20`} style={{ marginRight: '80px' }}>
        <div className="flex items-center">
          <div className="bg-red-500 rounded-full p-1 mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <span className="text-base">
            <span className="font-medium">{productName}</span> removed from cart&nbsp;&nbsp;
          </span>
        </div>
        <div className="flex items-center ml-4">
          <button onClick={() => { undoFunction(); toast.remove(t.id); }} className="text-blue-500 hover:text-blue-400 font-bold text-base mr-3">
            Undo
          </button>
          <button onClick={() => toast.remove(t.id)} className="text-white hover:text-gray-300 cursor-pointer" aria-label="Close">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    ),
    { position: "top-right", duration: 5000, id: 'product-removed-toast' }
  );
};


// Toast d'erreur personnalisé
export const errorToast = (message) => {
  return toast.custom(
    (t) => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-3xl bg-gray-900 text-white p-4 rounded-lg shadow-md flex items-center justify-between mr-20`}
      style={{ marginRight: '80px' }}
      >
        <div className="flex items-center">
          <div className="bg-red-500 rounded-full p-1 mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <span className="text-base">{message}</span>
        </div>
        <div className="flex items-center ml-4">
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
      position: "top-right",
      duration: 5000,
      id: 'error-toast'
    }
  );
};

// Toast d'information personnalisé
export const infoToast = (message) => {
  return toast.custom(
    (t) => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-3xl bg-gray-900 text-white p-4 rounded-lg shadow-md flex items-center justify-between`}>
        <div className="flex items-center">
          <div className="bg-blue-500 rounded-full p-1 mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <span className="text-base">{message}</span>
        </div>
        <div className="flex items-center ml-4">
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
     position: "top-right",
    duration: 5000, 
    id: 'info-toast'
    }
  );
};

// Toast pour l'ajout à la wishlist
export const wishlistAddedToast = (productName) => {
  return toast.custom(
    (t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-3xl bg-gray-900 text-white p-4 rounded-lg shadow-md flex items-center justify-between mr-20`}
        style={{ marginRight: '80px' }}>
        <div className="flex items-center">
          <div className="bg-green-500 rounded-full p-1 mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <span className="text-base">
            <span className="font-medium">{productName}</span> added to wishlist&nbsp;&nbsp;
          </span>
        </div>
        <div className="flex items-center ml-4">
          <Link href="/wishlist" className="text-blue-500 hover:text-blue-400 font-bold text-base mr-3">
            View Wishlist
          </Link>
          <button onClick={() => toast.remove(t.id)} className="text-white hover:text-gray-300 cursor-pointer" aria-label="Close">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    ),
    { position: "top-right", duration: 5000, id: 'wishlist-added-toast' }
  );
};

// Toast pour la suppression de la wishlist avec annulation
export const wishlistRemovedToast = (productName, undoFunction = () => {}) => {
  return toast.custom(
    (t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-3xl bg-gray-900 text-white p-4 rounded-lg shadow-md flex items-center justify-between mr-20`} 
        style={{ marginRight: '80px' }}>
        <div className="flex items-center">
          <div className="bg-red-500 rounded-full p-1 mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <span className="text-base">
            <span className="font-medium">{productName}</span> removed from wishlist&nbsp;&nbsp;
          </span>
        </div>
        <div className="flex items-center ml-4">
          <button onClick={() => { undoFunction(); toast.remove(t.id); }} className="text-blue-500 hover:text-blue-400 font-bold text-base mr-3">
            Undo
          </button>
          <Link href="/wishlist" className="text-blue-500 hover:text-blue-400 font-bold text-base mr-3">
            View Wishlist
          </Link>
          <button onClick={() => toast.remove(t.id)} className="text-white hover:text-gray-300 cursor-pointer" aria-label="Close">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    ),
    { position: "top-right", duration: 5000, id: 'wishlist-removed-toast' }
  );
};