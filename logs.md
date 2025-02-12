📦 Requête reçue - Body: {
  items: [
    {
      _id: '67a3314c2a11bf6605b49a7a',
      name: 'Chaise Scandinave',
      price: 129.99,
      quantity: 1,
      image: 'https://via.placeholder.com/150'
    },
    {
      _id: '67a43b23f06b3f61ddbdfbf3',
      name: 'Chaise super Scandinave',
      price: 129.99,
      quantity: 9,
      image: 'https://via.placeholder.com/150'
    }
  ],
  success_url: 'http://localhost:3001/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'http://localhost:3001/cart'
}
👤 Utilisateur: { id: '67a48e3133c69fa01fde1b0a' }
🛒 Items reçus: [
  {
    _id: '67a3314c2a11bf6605b49a7a',
    name: 'Chaise Scandinave',
    price: 129.99,
    quantity: 1,
    image: 'https://via.placeholder.com/150'
  },
  {
    _id: '67a43b23f06b3f61ddbdfbf3',
    name: 'Chaise super Scandinave',
    price: 129.99,
    quantity: 9,
    image: 'https://via.placeholder.com/150'
  }
]
📝 Commande créée: {
  userId: new ObjectId('67a48e3133c69fa01fde1b0a'),
  items: [
    {
      productId: new ObjectId('67a3314c2a11bf6605b49a7a'),
      quantity: 1,
      price: 129.99,
      _id: new ObjectId('67ac9d131516bc231d1c6503')
    },
    {
      productId: new ObjectId('67a43b23f06b3f61ddbdfbf3'),
      quantity: 9,
      price: 129.99,
      _id: new ObjectId('67ac9d131516bc231d1c6504')
    }
  ],
  status: 'pending',
  isGuestOrder: false,
  _id: new ObjectId('67ac9d131516bc231d1c6502')
}
💳 Line items pour Stripe: [
  {
    price_data: { currency: 'eur', product_data: [Object], unit_amount: 12999 },
    quantity: 1
  },
  {
    price_data: { currency: 'eur', product_data: [Object], unit_amount: 12999 },
    quantity: 9
  }
]
❌ Erreur détaillée: Error: Order validation failed: email: Path `email` is required.
    at ValidationError.inspect (/Users/chehebvassoutflorian/Documents/DEV/ecommerce-template/backend/node_modules/mongoose/lib/error/validation.js:52:26)
    at formatValue (node:internal/util/inspect:850:19)
    at inspect (node:internal/util/inspect:387:10)
    at formatWithOptionsInternal (node:internal/util/inspect:2366:40)
    at formatWithOptions (node:internal/util/inspect:2228:10)
    at console.value (node:internal/console/constructor:345:14)
    at console.error (node:internal/console/constructor:412:61)
    at /Users/chehebvassoutflorian/Documents/DEV/ecommerce-template/backend/routes/checkoutRoutes.js:194:17
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5) {
  errors: {
    email: ValidatorError: Path `email` is required.
        at validate (/Users/chehebvassoutflorian/Documents/DEV/ecommerce-template/backend/node_modules/mongoose/lib/schemaType.js:1404:13)
        at SchemaType.doValidate (/Users/chehebvassoutflorian/Documents/DEV/ecommerce-template/backend/node_modules/mongoose/lib/schemaType.js:1388:7)
        at /Users/chehebvassoutflorian/Documents/DEV/ecommerce-template/backend/node_modules/mongoose/lib/document.js:3087:18
        at process.processTicksAndRejections (node:internal/process/task_queues:85:11) {
      properties: [Object],
      kind: 'required',
      path: 'email',
      value: undefined,
      reason: undefined,
      [Symbol(mongoose#validatorError)]: true
    }
  },
  _message: 'Order validation failed'
}