📥 Requête reçue pour ajouter au panier: { productId: '67bf1eb4578d6b50301bc472', quantity: 1, price: 423.05 }
🔑 Utilisateur authentifié: {
  id: '67bf1eb4578d6b50301bc487',
  email: 'Alexandrea_Trantow@yahoo.com'
}
🆕 Ajout du produit au panier...
❌ Erreur lors de l'ajout au panier : Error: Cart validation failed: items.0.productName: Path `productName` is required., items.1.productName: Path `productName` is required., items.2.productName: Path `productName` is required.
    at ValidationError.inspect (/Users/chehebvassoutflorian/Documents/DEV/ecommerce-template/backend/node_modules/mongoose/lib/error/validation.js:52:26)
    at formatValue (node:internal/util/inspect:850:19)
    at inspect (node:internal/util/inspect:387:10)
    at formatWithOptionsInternal (node:internal/util/inspect:2366:40)
    at formatWithOptions (node:internal/util/inspect:2228:10)
    at console.value (node:internal/console/constructor:345:14)
    at console.error (node:internal/console/constructor:412:61)
    at exports.addToCart (/Users/chehebvassoutflorian/Documents/DEV/ecommerce-template/backend/controllers/CartController.js:103:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5) {
  errors: {
    'items.0.productName': ValidatorError: Path `productName` is required.
        at validate (/Users/chehebvassoutflorian/Documents/DEV/ecommerce-template/backend/node_modules/mongoose/lib/schemaType.js:1404:13)
        at SchemaType.doValidate (/Users/chehebvassoutflorian/Documents/DEV/ecommerce-template/backend/node_modules/mongoose/lib/schemaType.js:1388:7)
        at /Users/chehebvassoutflorian/Documents/DEV/ecommerce-template/backend/node_modules/mongoose/lib/document.js:3082:18
        at process.processTicksAndRejections (node:internal/process/task_queues:85:11) {
      properties: [Object],
      kind: 'required',
      path: 'productName',
      value: undefined,
      reason: undefined,
      [Symbol(mongoose#validatorError)]: true
    },
    'items.1.productName': ValidatorError: Path `productName` is required.
        at validate (/Users/chehebvassoutflorian/Documents/DEV/ecommerce-template/backend/node_modules/mongoose/lib/schemaType.js:1404:13)
        at SchemaType.doValidate (/Users/chehebvassoutflorian/Documents/DEV/ecommerce-template/backend/node_modules/mongoose/lib/schemaType.js:1388:7)
        at /Users/chehebvassoutflorian/Documents/DEV/ecommerce-template/backend/node_modules/mongoose/lib/document.js:3082:18
        at process.processTicksAndRejections (node:internal/process/task_queues:85:11) {
      properties: [Object],
      kind: 'required',
      path: 'productName',
      value: undefined,
      reason: undefined,
      [Symbol(mongoose#validatorError)]: true
    },
    'items.2.productName': ValidatorError: Path `productName` is required.
        at validate (/Users/chehebvassoutflorian/Documents/DEV/ecommerce-template/backend/node_modules/mongoose/lib/schemaType.js:1404:13)
        at SchemaType.doValidate (/Users/chehebvassoutflorian/Documents/DEV/ecommerce-template/backend/node_modules/mongoose/lib/schemaType.js:1388:7)
        at /Users/chehebvassoutflorian/Documents/DEV/ecommerce-template/backend/node_modules/mongoose/lib/document.js:3082:18
        at process.processTicksAndRejections (node:internal/process/task_queues:85:11) {
      properties: [Object],
      kind: 'required',
      path: 'productName',
      value: undefined,
      reason: undefined,
      [Symbol(mongoose#validatorError)]: true
    }
  },
  _message: 'Cart validation failed'
}
