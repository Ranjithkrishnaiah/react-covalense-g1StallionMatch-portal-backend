export enum ACTIVITY_TYPE {
  READ = 1,
  CREATE = 2,
  UPDATE = 3,
  DELETE = 4,
  MERGE = 5,
}

export enum PAYMENT_METHOD {
  CARD = 1,
  PAYPAL = 2,
  APAY = 3,
  GPAY = 4,
}

export enum SALES_STATUS {
  READY_TO_DEPLOY = 1,
  VERIFY_REQUIRED = 2,
  PDF_REQUIRED = 3,
  IMPORT_REQUIRED = 4,
  DEPLOYED = 5,
}

export enum PAYMENT_STATUS {
  UNPAID = 1,
  PAID = 2,
}

export enum PAYMENT_METHOD_TEXT {
  CARD = 'card',
  PAYPAL = 'Paypal',
}

export enum PRODUCT {
  SHORTLIST_STALLION_REPORT = 1,
  STALLION_MATCH_PRO_REPORT = 2,
  BROODMARE_AFFINITY_REPORT = 3,
  STALLION_MATCH_SALES_REPORT = 4,
  STALLION_AFFINITY_REPORT = 5,
  BROODMARE_SIRE_REPORT = 6,
  LOCAL_BOOST = 7,
  EXTENDED_BOOST = 8,
  PROMOTED_STALLION = 9,
  NOMINATION_ACCEPTANCE = 10,
}

export enum BOOST_TYPE {
  LOCAL = 1,
  EXTENDED = 2,
}

export enum DEFAULT_VALUES {
  COUNTRY = 11,
  CURRENCY = 1,
}