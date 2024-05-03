export enum PRODUCTCODES {
  PROMOTION_STALLION = 'PROMOTION_STALLION',
  REPORT_SHORTLIST_STALLION = 'REPORT_SHORTLIST_STALLION',
  REPORT_STALLION_MATCH_PRO = 'REPORT_STALLION_MATCH_PRO',
  REPORT_BROODMARE_AFFINITY = 'REPORT_BROODMARE_AFFINITY',
  REPORT_STALLION_MATCH_SALES = 'REPORT_STALLION_MATCH_SALES',
  REPORT_STALLION_AFFINITY = 'REPORT_STALLION_AFFINITY',
  REPORT_BROODMARE_SIRE = 'REPORT_BROODMARE_SIRE',
  BOOST_LOCAL = 'BOOST_LOCAL',
  BOOST_EXTENDED = 'BOOST_EXTENDED',
  NOMINATION_STALLION = 'NOMINATION_STALLION',
  REPORT_STALLION_BREEDING_STOCK_SALE = 'REPORT_STALLION_BREEDING_STOCK_SALE',
}
export const PRODUCTLIST = [
  {
    productId: 1,
    productCode: PRODUCTCODES.REPORT_SHORTLIST_STALLION,
    productName: 'My Shortlist Report',
    description:
      'Create a Shortlist of preferred stallions from our directory and run a detailed analysis with your broodmare.',
  },
  {
    productId: 2,
    productCode: PRODUCTCODES.REPORT_STALLION_MATCH_PRO,
    productName: 'Stallion Match PRO Report',
    description:
      'Know which stallions are proven to work with your broodmares pedigree based on location and stud fee range.',
  },
  {
    productId: 3,
    productCode: PRODUCTCODES.REPORT_BROODMARE_AFFINITY,
    productName: 'Broodmare Affinity Report',
    description:
      'Identify favourable ancestors within the stallion population for your broodmare.',
  },
  {
    productId: 4,
    productCode: PRODUCTCODES.REPORT_STALLION_MATCH_SALES,
    productName: 'Stallion Match Sales Report',
    description: 'A detailed report analysing each horse sold at any sale.',
  },
  {
    productId: 5,
    productCode: PRODUCTCODES.REPORT_STALLION_AFFINITY,
    productName: 'Stallion Affinity Report',
    description:
      'Identify favourable ancestors within the mare population for your stallion.',
  },
  {
    productId: 6,
    productCode: PRODUCTCODES.REPORT_BROODMARE_SIRE,
    productName: 'Broodmare Sire Report',
    description:
      'Find the most compatible stallion based solely on your broodmare sire.',
  },
];

export const PRODUCTCODESLIST = [
  'REPORT_SHORTLIST_STALLION',
  'REPORT_STALLION_MATCH_PRO',
  'REPORT_BROODMARE_AFFINITY',
  'REPORT_STALLION_MATCH_SALES',
  'REPORT_STALLION_AFFINITY',
  'REPORT_BROODMARE_SIRE',
  'REPORT_STALLION_BREEDING_STOCK_SALE'
];

export enum PRODUCTCOVERIMAGE {
  PROMOTION_STALLION = 'StallionPageEx.png',
  REPORT_SHORTLIST_STALLION = 'SM-ShortlistReport.png',
  REPORT_STALLION_MATCH_PRO = 'SM-ProReport.png',
  REPORT_BROODMARE_AFFINITY = 'SM-BroodmareAffinity.png',
  REPORT_STALLION_MATCH_SALES = 'SM-SalesReport.png',
  REPORT_STALLION_AFFINITY = 'SM-StallionAffinity.png',
  REPORT_BROODMARE_SIRE = 'SM-BroodmareSire.png',
  BOOST_LOCAL  = 'localBoost.png',
  BOOST_EXTENDED = 'extendedBoost.png'


}
