import {
  HttpStatus,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { BoostProfileService } from 'src/boost-profile/boost-profile.service';
import { BoostSearchedDamsireService } from 'src/boost-profile/boost-searched-damsire.service';
import { BoostStallionService } from 'src/boost-profile/boost-stallion.service';
import { BoostUserLocationService } from 'src/boost-profile/boost-user-location.service';
import { CreateBoostSearchedDamsireDto } from 'src/boost-profile/dto/create-boost-searched-damsire.dto';
import { CreateBoostStallionDto } from 'src/boost-profile/dto/create-boost-stallion.dto';
import { CreateBoostUserLocationDto } from 'src/boost-profile/dto/create-boost-user-location.dto';
import { CreateExtendedBoostProfileDto } from 'src/boost-profile/dto/create-extended-boost-profile.dto';
import { CreateLocalBoostProfileDto } from 'src/boost-profile/dto/create-local-boost-profile.dto';
import { CartProductItemsService } from 'src/cart-product-items/cart-product-items.service';
import { CartProductItemDto } from 'src/cart-product-items/dto/create-cart-product-item.dto';
import { CartProductService } from 'src/cart-product/cart-product.service';
import { CartProductDto } from 'src/cart-product/dto/cart-product.dto';
import { CreateCartProductDto } from 'src/cart-product/dto/create-cart-product.dto';
import { CartProduct } from 'src/cart-product/entities/cart-product.entity';
import { CartDto } from 'src/carts/dto/cart.dto';
import { CurrenciesService } from 'src/currencies/currencies.service';
import { FarmsService } from 'src/farms/farms.service';
import { HorsesService } from 'src/horses/horses.service';
import { NominationRequestService } from 'src/nomination-request/nomination-request.service';
import { PricingService } from 'src/pricing/pricing.service';
import { ProductsService } from 'src/products/products.service';
import { Sale } from 'src/sales/entities/sale.entity';
import { StallionPromotionService } from 'src/stallion-promotions/stallion-promotions.service';
import { StallionsService } from 'src/stallions/stallions.service';
import { PRODUCTCODES } from 'src/utils/constants/products';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { Repository, UpdateResult, getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { BroodmareAfinityCartDto } from './dto/broodmareAfinityCart.dto';
import { BroodmareSireCartDto } from './dto/broodmareSireCart.dto';
import { CurrencyConversionCartDto } from './dto/currency-conversion.dto';
import { DeleteCartDto } from './dto/delete-cart.dto';
import { ExtendedBoostCartDto } from './dto/extended-boost-request.dto';
import { LocalBoostCartDto } from './dto/local-boost-request.dto';
import { PotentialAudienceDto } from './dto/potential-audience.dto';
import { SalesCatelogueCartDto } from './dto/salesCatelogueCart.dto';
import { ShortlistStallionCartDto } from './dto/shortlistStallionCart.dto';
import { StallionBreedingStockSaleCartDto } from './dto/stallion-breeding-stock-sale.dto';
import { StallionAfinityCartDto } from './dto/stallionAfinityCart.dto';
import { StallionMatchProCartDto } from './dto/stallionMatchPro.dto';
import { Cart } from './entities/cart.entity';
import { BOOST_TYPE } from 'src/utils/constants/common';
import { SalesLot } from 'src/sales-lots/entities/sales-lot.entity';

@Injectable()
export class CartsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    private cartProductService: CartProductService,
    private cartProductItemsService: CartProductItemsService,
    private stallionsService: StallionsService,
    private horsesService: HorsesService,
    private farmsService: FarmsService,
    private productsService: ProductsService,
    private pricingService: PricingService,
    private nominationRequestService: NominationRequestService,
    private stallionPromotionService: StallionPromotionService,
    private boostProfileService: BoostProfileService,
    private boostStallionService: BoostStallionService,
    private boostSearchedDamsireService: BoostSearchedDamsireService,
    private boostUserLocationService: BoostUserLocationService,
    private currenciesService: CurrenciesService,
  ) {}

  // creating cart,cart-product and cart-product-items when click on add-to-cart
  async create(createCartProductDto: CreateCartProductDto) {
    try {
      const member = this.request.user;
      const { productId, price, quantity, items, cartId, isIncludePrivateFee,currencyId,fullName } =
        createCartProductDto;

      var nrResponse, promotionResponse,stallionNom;
      const product = await this.productsService.findOne({ id: productId });
      if (product?.productCode == PRODUCTCODES.PROMOTION_STALLION) {
        promotionResponse = await this.stallionPromotionService.findOne({
          promotionUuid: items[0],
        });
        if (!promotionResponse) {
          throw new UnprocessableEntityException('not exist!');
        }
      }

      if (product?.productCode == PRODUCTCODES.NOMINATION_STALLION) {
        nrResponse = await this.nominationRequestService.findByEntity({
          nrUuid: items[0],
        });
        // console.log("====stallionNom",nrResponse)
        //   stallionNom = await getRepository(StallionNomination).findOne({
        //   stallionId: nrResponse[0].stallionId,
        
        // });
      //  console.log("====stallionNom===",stallionNom)
        if (!nrResponse) {
          throw new UnprocessableEntityException('not exist!');
        }
      }

      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.currencyId = currencyId;
      cartData.memberId = member['id'];
      cartData.createdBy = member['id'];
      cartData.fullName = fullName;
      cartData.email = member['email'];

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );

      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = productId;
      cartProductData.price = price;
      cartProductData.quantity = quantity;
      cartProductData.createdBy = member['id'];
      cartProductData.isIncludePrivateFee = isIncludePrivateFee ? isIncludePrivateFee : false;

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];
      cartProductItemData.createdBy = member['id'];

      items.forEach(async (element) => {
        // 7=local boost report, 8=extended boost report
        if (
          product?.productCode == PRODUCTCODES.BOOST_LOCAL ||
          product?.productCode == PRODUCTCODES.BOOST_EXTENDED
        ) {
          const stallion = await this.stallionsService.findOne(element);
          cartProductItemData.stallionId = stallion.id;
          await this.cartProductItemsService.create(cartProductItemData);
        }

        //9=Promoted stallion report
        if (product?.productCode == PRODUCTCODES.PROMOTION_STALLION) {
          cartProductItemData.stallionPromotionId = promotionResponse[0].id;
          cartProductItemData.stallionId = promotionResponse[0].stallionId;
          await this.cartProductItemsService.create(cartProductItemData);
        }
        //10=Nomination Acceptance
        if (product?.productCode == PRODUCTCODES.NOMINATION_STALLION) {
          cartProductItemData.stallionNominationId = nrResponse[0].id;
          cartProductItemData.stallionId = nrResponse[0].stallionId;
          cartProductItemData.mareId = nrResponse[0].mareId;
          await this.cartProductItemsService.create(cartProductItemData);
        }
      });

      if (cartId) {
        await this.remove({ cartId });
      }

     // return 'The record has been successfully created.';
     return  createCartResponse
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  // creating cart,cart-product and cart-product-items for broodmareAfinityReport and for registered
  async broodmareAfinityReport(
    broodmareAfinityCartDto: BroodmareAfinityCartDto,
  ) {
    try {
      const member = this.request.user;
      const { mareId, locations, currencyId,fullName,cartId } = broodmareAfinityCartDto;

      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.currencyId = currencyId;
      cartData.memberId = member['id'];
      cartData.fullName = fullName;
      cartData.createdBy = member['id'];
      cartData.email = member['email'];

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );

      const product = await this.productsService.findOne({
        productCode: PRODUCTCODES.REPORT_BROODMARE_AFFINITY,
      });
      const pricingRes = await this.pricingService.findOne({
        productId: product?.id,
        currencyId,
      });
      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = product?.id;
      cartProductData.price = pricingRes ? pricingRes.price : 0;
      cartProductData.quantity = 1;
      cartProductData.createdBy = member['id'];
      cartProductData.isIncludePrivateFee = false;

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];
      cartProductItemData.createdBy = member['id'];

      const mare = await this.horsesService.findOne(mareId);
      cartProductItemData.mareId = mare.id;
      cartProductItemData.commonList = locations.toString();

      await this.cartProductItemsService.create(cartProductItemData);

      if (cartId) {
        await this.remove({ cartId });
      }

    //  return 'The record has been successfully created.';
    return createCartResponse
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  // creating cart,cart-product and cart-product-items for broodmareAfinityReport of guest
  async broodmareAfinityReportGuest(
    broodmareAfinityCartDto: BroodmareAfinityCartDto,
  ) {
    try {
      const { mareId, locations, currencyId, fullName, email, cartId } =
        broodmareAfinityCartDto;

      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.currencyId = currencyId;
      cartData.fullName = fullName;
      cartData.email = email;

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );
      const product = await this.productsService.findOne({
        productCode: PRODUCTCODES.REPORT_BROODMARE_AFFINITY,
      });
      const pricingRes = await this.pricingService.findOne({
        productId: product?.id,
        currencyId,
      });
      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = product?.id;
      cartProductData.price = pricingRes ? pricingRes.price : 0;
      cartProductData.quantity = 1;
      cartProductData.isIncludePrivateFee = false;

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];

      const mare = await this.horsesService.findOne(mareId);
      cartProductItemData.mareId = mare.id;
      cartProductItemData.commonList = locations.toString();

      await this.cartProductItemsService.create(cartProductItemData);

      if (cartId) {
        await this.remove({ cartId });
      }

      return createCartResponse;
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  // creating cart,cart-product and cart-product-items for stallionAfinityReport of registered
  async stallionAfinityReport(stallionAfinityCartDto: StallionAfinityCartDto) {
    try {
      const member = this.request.user;
      const { stallionId, farms, currencyId,fullName, cartId } = stallionAfinityCartDto;

      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.currencyId = currencyId;
      cartData.memberId = member['id'];
      cartData.email = member['email'];
      cartData.fullName = fullName;
      cartData.createdBy = member['id'];

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );

      const product = await this.productsService.findOne({
        productCode: PRODUCTCODES.REPORT_STALLION_AFFINITY,
      });
      const pricingRes = await this.pricingService.findOne({
        productId: product?.id,
        currencyId,
      });
      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = product?.id;
      cartProductData.price = pricingRes ? pricingRes.price : 0;
      cartProductData.quantity = 1;
      cartProductData.createdBy = member['id'];
      cartProductData.isIncludePrivateFee = false;

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];
      cartProductItemData.createdBy = member['id'];
      if (farms.length > 0) {
        let result = await Promise.all(
          farms.map(async (element) => {
            const farmObj = await this.farmsService.findOne({
              farmUuid: element,
            });
            return farmObj.id;
          }),
        );

        cartProductItemData.commonList = result.toString();
      }

      const stallion = await this.stallionsService.findOne(stallionId);
      cartProductItemData.stallionId = stallion.id;
      await this.cartProductItemsService.create(cartProductItemData);

      if (cartId) {
        await this.remove({ cartId });
      }

    //  return 'The record has been successfully created.';
    return createCartResponse
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  // creating cart,cart-product and cart-product-items for stallionAfinityReport of guest
  async stallionAfinityReportGuest(
    stallionAfinityCartDto: StallionAfinityCartDto,
  ) {
    try {
      const { stallionId, farms, currencyId, fullName, email, cartId } =
        stallionAfinityCartDto;

      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.currencyId = currencyId;
      cartData.fullName = fullName;
      cartData.email = email;

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );
      const product = await this.productsService.findOne({
        productCode: PRODUCTCODES.REPORT_STALLION_AFFINITY,
      });
      const pricingRes = await this.pricingService.findOne({
        productId: product?.id,
        currencyId,
      });
      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = product?.id;
      cartProductData.price = pricingRes ? pricingRes.price : 0;
      cartProductData.quantity = 1;
      cartProductData.isIncludePrivateFee = false;

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];
      if (farms.length > 0) {
        let result = await Promise.all(
          farms.map(async (element) => {
            const farmObj = await this.farmsService.findOne({
              farmUuid: element,
            });
            return farmObj.id;
          }),
        );

        cartProductItemData.commonList = result.toString();
      }

      const stallion = await this.stallionsService.findOne(stallionId);
      cartProductItemData.stallionId = stallion.id;
      await this.cartProductItemsService.create(cartProductItemData);

      if (cartId) {
        await this.remove({ cartId });
      }

      return createCartResponse;
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  // creating cart,cart-product and cart-product-items for broodmareSireReport of registered
  async broodmareSireReport(broodmareSireCartDto: BroodmareSireCartDto) {
    try {
      const member = this.request.user;
      const { mareId, locations, currencyId, cartId ,fullName} = broodmareSireCartDto;

      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.currencyId = currencyId;
      cartData.email = member['email'];
      cartData.memberId = member['id'];
      cartData.fullName = fullName;
      cartData.createdBy = member['id'];

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );

      const product = await this.productsService.findOne({
        productCode: PRODUCTCODES.REPORT_BROODMARE_SIRE,
      });
      let pricingRes;

        pricingRes = await this.pricingService.findOne({
          productId: product?.id,
          currencyId,
        });
    
      
      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = product?.id;
      cartProductData.price = pricingRes ? pricingRes.price : 0;
      cartProductData.quantity = 1;
      cartProductData.createdBy = member['id'];
      cartProductData.isIncludePrivateFee = false;

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];
      cartProductItemData.createdBy = member['id'];

      const mare = await this.horsesService.findOne(mareId);
      cartProductItemData.mareId = mare.id;
      cartProductItemData.commonList = locations.toString();

      await this.cartProductItemsService.create(cartProductItemData);

      if (cartId) {
        await this.remove({ cartId });
      }

     // return 'The record has been successfully created.';
     return createCartResponse
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  // creating cart,cart-product and cart-product-items for broodmareSireReport of guest
  async broodmareSireReportGuest(broodmareSireCartDto: BroodmareSireCartDto) {
    try {
      const { mareId, locations, currencyId, fullName, email, cartId } =
        broodmareSireCartDto;

      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.currencyId = currencyId;
      cartData.fullName = fullName;
      cartData.email = email;

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );

      const product = await this.productsService.findOne({
        productCode: PRODUCTCODES.REPORT_BROODMARE_SIRE,
      });
      const pricingRes = await this.pricingService.findOne({
        productId: product?.id,
        currencyId,
      });
      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = product?.id;
      cartProductData.price = pricingRes ? pricingRes.price : 0;
      cartProductData.quantity = 1;
      cartProductData.isIncludePrivateFee = false;

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];

      const mare = await this.horsesService.findOne(mareId);
      cartProductItemData.mareId = mare.id;
      cartProductItemData.commonList = locations.toString();

      await this.cartProductItemsService.create(cartProductItemData);
      if (cartId) {
        await this.remove({ cartId });
      }

      return createCartResponse;
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  // creating cart,cart-product and cart-product-items for shortlistStallionReport of registered
  async shortlistStallionReport(
    shortlistStallionCartDto: ShortlistStallionCartDto,
  ) {
    try {
      const member = this.request.user;
      const { mareId, stallions, currencyId,fullName,cartId } =
        shortlistStallionCartDto;

      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.currencyId = currencyId;
      cartData.email = member['email'];
      cartData.fullName = fullName;
      cartData.memberId = member['id'];
      cartData.createdBy = member['id'];

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );

      const product = await this.productsService.findOne({
        productCode: PRODUCTCODES.REPORT_SHORTLIST_STALLION,
      });
      const pricingRes = await this.pricingService.findOne({
        productId: product?.id,
        currencyId,
      });
      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = product?.id;
      cartProductData.price = pricingRes
        ? pricingRes.price * stallions.length
        : 0;
      cartProductData.quantity = stallions.length;
      cartProductData.createdBy = member['id'];
      cartProductData.isIncludePrivateFee = false;

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];
      cartProductItemData.createdBy = member['id'];
      if (mareId) {
        const mare = await this.horsesService.findOne(mareId);
        cartProductItemData.mareId = mare.id;
      }
      if (stallions.length > 0) {
        let result = await Promise.all(
          stallions.map(async (element) => {
            const stallion = await this.stallionsService.findOne(element);
            cartProductItemData.stallionId = stallion.id;
            return await this.cartProductItemsService.create(
              cartProductItemData,
            );
          }),
        );
      }
      if (cartId) {
        await this.remove({ cartId });
      }

   //   return 'The record has been successfully created.';
    return createCartResponse
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  // creating cart,cart-product and cart-product-items for shortlistStallionReport of guest
  async shortlistStallionReportGuest(
    shortlistStallionCartDto: ShortlistStallionCartDto,
  ) {
    try {
      const { mareId, stallions, currencyId, fullName, email, cartId } =
        shortlistStallionCartDto;

      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.currencyId = currencyId;
      cartData.fullName = fullName;
      cartData.email = email;

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );

      const product = await this.productsService.findOne({
        productCode: PRODUCTCODES.REPORT_SHORTLIST_STALLION,
      });
      const pricingRes = await this.pricingService.findOne({
        productId: product?.id,
        currencyId,
      });
      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = product?.id;
      cartProductData.price = pricingRes
        ? pricingRes.price * stallions.length
        : 0;
      cartProductData.quantity = stallions.length;
      cartProductData.isIncludePrivateFee = false;

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];

      if (mareId) {
        const mare = await this.horsesService.findOne(mareId);
        cartProductItemData.mareId = mare.id;
      }
      if (stallions.length > 0) {
        let result = await Promise.all(
          stallions.map(async (element) => {
            const stallion = await this.stallionsService.findOne(element);
            cartProductItemData.stallionId = stallion.id;
            return await this.cartProductItemsService.create(
              cartProductItemData,
            );
          }),
        );
      }
      if (cartId) {
        await this.remove({ cartId });
      }

      return createCartResponse;
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  // creating cart,cart-product and cart-product-items for stallionMatchProReport of registered
  async stallionMatchProReport(
    stallionMatchProCartDto: StallionMatchProCartDto,
  ) {
      try {
      const member = this.request.user;
      const {
        mareId,
        stallions,
        currencyId,
        locations,
        cartId,
        selectedpriceRange,
        isIncludePrivateFee,
        cartCurrencyId,
        fullName
      } = stallionMatchProCartDto;

      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.currencyId = currencyId;
      cartData.email = member['email'];
      cartData.memberId = member['id'];
      cartData.fullName = fullName;
      cartData.createdBy = member['id'];

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );

      const product = await this.productsService.findOne({
        productCode: PRODUCTCODES.REPORT_STALLION_MATCH_PRO,
      });
      const pricingRes = await this.pricingService.findOne({
        productId: product?.id,
        currencyId,
      });
      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = product?.id;
      cartProductData.price = pricingRes ? pricingRes.price : 0;
      cartProductData.quantity = stallions.length;
      cartProductData.createdBy = member['id'];
      cartProductData.selectedpriceRange = selectedpriceRange;
      cartProductData.isIncludePrivateFee = isIncludePrivateFee ? isIncludePrivateFee : false;
      cartProductData.CurrencyId = cartCurrencyId

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];
      cartProductItemData.createdBy = member['id'];
      if (mareId) {
        const mare = await this.horsesService.findOne(mareId);
        cartProductItemData.mareId = mare.id;
      }
      cartProductItemData.commonList = locations.toString();

      if (stallions.length > 0) {
        let result = await Promise.all(
          stallions.map(async (element) => {
            const stallion = await this.stallionsService.findStallion({
              stallionUuid: element,
            });
            if (stallion) {
              cartProductItemData.stallionId = stallion.id;
              await this.cartProductItemsService.create(cartProductItemData);
            }
          }),
        );
      }

      if (cartId) {
        await this.remove({ cartId });
      }

   //   return 'The record has been successfully created.';
   return createCartResponse
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  // creating cart,cart-product and cart-product-items for stallionMatchProReport of guest
  async stallionMatchProReportGuest(
    stallionMatchProCartDto: StallionMatchProCartDto,
  ) {
    try {
      const {
        mareId,
        stallions,
        currencyId,
        locations,
        fullName,
        email,
        cartId,
        selectedpriceRange,
        isIncludePrivateFee,
        cartCurrencyId
      } = stallionMatchProCartDto;

      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.currencyId = currencyId;
      cartData.fullName = fullName;
      cartData.email = email;

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );

      const product = await this.productsService.findOne({
        productCode: PRODUCTCODES.REPORT_STALLION_MATCH_PRO,
      });
      const pricingRes = await this.pricingService.findOne({
        productId: product?.id,
        currencyId,
      });
      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = product?.id;
      cartProductData.price = pricingRes ? pricingRes.price : 0;
      cartProductData.quantity = stallions.length;
      cartProductData.selectedpriceRange = selectedpriceRange;
      cartProductData.isIncludePrivateFee = isIncludePrivateFee ? isIncludePrivateFee : false;
      cartProductData.CurrencyId = cartCurrencyId

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];
      if (mareId) {
        const mare = await this.horsesService.findOne(mareId);
        cartProductItemData.mareId = mare.id;
      }
      cartProductItemData.commonList = locations.toString();

      if (stallions.length > 0) {
        let result = await Promise.all(
          stallions.map(async (element) => {
            const stallion = await this.stallionsService.findOne(element);
            cartProductItemData.stallionId = stallion.id;
            return await this.cartProductItemsService.create(
              cartProductItemData,
            );
          }),
        );
      }

      if (cartId) {
        await this.remove({ cartId });
      }

      return createCartResponse;
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  // creating cart,cart-product and cart-product-items for salesCatelogueReport of registered
  async salesCatelogueReport(salesCatelogueCartDto: SalesCatelogueCartDto) {
    try {
      const member = this.request.user;
      const { sales, location, currencyId, lots,fullName, cartId ,price} =
        salesCatelogueCartDto;
      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.currencyId = currencyId;
      cartData.email = member['email'];
      cartData.memberId = member['id'];
      cartData.fullName = fullName;
      cartData.createdBy = member['id'];

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );

      const product = await this.productsService.findOne({
        productCode: PRODUCTCODES.REPORT_STALLION_MATCH_SALES,
      });
      let priceP;
      if(!cartId){
       const  pricedata = await this.pricingService.findOne({
          productId: product?.id,
          currencyId,
        });
        priceP = pricedata?.price
      }
      else{
        priceP = price
      }
      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = product?.id;
      cartProductData.price = priceP ? priceP * lots.length : 0;
      cartProductData.quantity = lots.length;
      cartProductData.createdBy = member['id'];
      cartProductData.isIncludePrivateFee = false;

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];
      cartProductItemData.createdBy = member['id'];
      cartProductItemData.commonList = location.toString();
      cartProductItemData.sales = sales.toString();

      if (lots.length > 0) {
        let result = await Promise.all(
          lots.map(async (element) => {
            cartProductItemData.lotId = element;
            return await this.cartProductItemsService.create(
              cartProductItemData,
            );
          }),
        );
      }
      if (cartId) {
        await this.remove({ cartId });
      }

   //   return 'The record has been successfully created.';
   return createCartResponse
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  // creating cart,cart-product and cart-product-items for salesCatelogueReport of guest
  async salesCatelogueReportGuest(
    salesCatelogueCartDto: SalesCatelogueCartDto,
  ) {
    try {
      const { sales, location, currencyId, lots, fullName, email, cartId, price } =
        salesCatelogueCartDto;

      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.currencyId = currencyId;
      cartData.fullName = fullName;
      cartData.email = email;

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );

      const product = await this.productsService.findOne({
        productCode: PRODUCTCODES.REPORT_STALLION_MATCH_SALES,
      });
      let priceP;
      if(!cartId){
       const  pricedata = await this.pricingService.findOne({
          productId: product?.id,
          currencyId,
        });
        priceP = pricedata?.price
      }
      else{
        priceP = price
      }
      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = product?.id;
      cartProductData.price = priceP ? priceP * lots.length : 0;
      cartProductData.quantity = lots.length;
      cartProductData.isIncludePrivateFee = false;

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];
      cartProductItemData.commonList = location.toString();
      cartProductItemData.sales = sales.toString();

      if (lots.length > 0) {
        let result = await Promise.all(
          lots.map(async (element) => {
            cartProductItemData.lotId = element;
            return await this.cartProductItemsService.create(
              cartProductItemData,
            );
          }),
        );
      }
      if (cartId) {
        await this.remove({ cartId });
      }

      return createCartResponse;
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  // creating cart,cart-product and cart-product-items for stallionBreedingStockSaleReport of registered
  async stallionBreedingStockSaleReport(stallionBreedingStockSaleCartDto: StallionBreedingStockSaleCartDto) {
    try {
      const member = this.request.user;
      const { sales, location, currencyId, lots, cartId, stallionId,fullName,price } =
      stallionBreedingStockSaleCartDto;
      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.currencyId = currencyId;
      cartData.email = member['email'];
      cartData.memberId = member['id'];
      cartData.fullName = fullName;
      cartData.createdBy = member['id'];

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );

      const product = await this.productsService.findOne({
        productCode: PRODUCTCODES.REPORT_STALLION_BREEDING_STOCK_SALE,
      });
      let priceP;
      if(!cartId){
       const  pricedata = await this.pricingService.findOne({
          productId: product?.id,
          currencyId,
        });
        priceP = pricedata?.price
      }
      else{
        priceP = price
      }
      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = product?.id;
      cartProductData.price = priceP ? priceP * lots.length : 0;
      cartProductData.quantity = lots.length;
      cartProductData.createdBy = member['id'];
      cartProductData.isIncludePrivateFee = false;

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];
      cartProductItemData.createdBy = member['id'];
      cartProductItemData.commonList = location.toString();
      cartProductItemData.sales = sales.toString();
      const stallion = await this.stallionsService.findOne(stallionId);
      cartProductItemData.stallionId = stallion.id;
      if (lots.length > 0) {
        let result = await Promise.all(
          lots.map(async (element) => {
            cartProductItemData.lotId = element;
            return await this.cartProductItemsService.create(
              cartProductItemData,
            );
          }),
        );
      }
      if (cartId) {
        await this.remove({ cartId });
      }

   //   return 'The record has been successfully created.';
   return createCartResponse
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

 // creating cart,cart-product and cart-product-items for stallionBreedingStockSaleReport of guest
 async stallionBreedingStockSaleReportGuest(
  stallionBreedingStockSaleCartDto: StallionBreedingStockSaleCartDto,
) {
  try {
    const { sales, location, currencyId, lots, fullName, email, cartId, stallionId,price } =
    stallionBreedingStockSaleCartDto;

    let cartData = new CartDto();
    cartData.cartSessionId = uuidv4();
    cartData.currencyId = currencyId;
    cartData.fullName = fullName;
    cartData.email = email;

    const createCartResponse = await this.cartRepository.save(
      this.cartRepository.create(cartData),
    );

    const product = await this.productsService.findOne({
      productCode: PRODUCTCODES.REPORT_STALLION_BREEDING_STOCK_SALE,
    });
    let priceP;
      if(!cartId){
       const  pricedata = await this.pricingService.findOne({
          productId: product?.id,
          currencyId,
        });
        priceP = pricedata?.price
      }
      else{
        priceP = price
      }
    const cartProductData = new CartProductDto();
    cartProductData.cartId = createCartResponse['id'];
    cartProductData.productId = product?.id;
    cartProductData.price = priceP ? priceP * lots.length : 0;
    cartProductData.quantity = lots.length;
    cartProductData.isIncludePrivateFee = false;

    const cartProductResponse = await this.cartProductService.create(
      cartProductData,
    );
    const cartProductItemData = new CartProductItemDto();
    cartProductItemData.cartProductId = cartProductResponse['id'];
    cartProductItemData.commonList = location.toString();
    cartProductItemData.sales = sales.toString();
    cartProductItemData.sales = sales.toString();
    const stallion = await this.stallionsService.findOne(stallionId);
    cartProductItemData.stallionId = stallion.id;
    if (lots.length > 0) {
      let result = await Promise.all(
        lots.map(async (element) => {
          cartProductItemData.lotId = element;
          return await this.cartProductItemsService.create(
            cartProductItemData,
          );
        }),
      );
    }
    if (cartId) {
      await this.remove({ cartId });
    }

    return createCartResponse;
  } catch (err) {
    throw new UnprocessableEntityException(err);
  }
}


  // creating cart,cart-product and cart-product-items for local-boost of registered
  async addLocalBoost(localBoostCartDto: LocalBoostCartDto) {
    try {
      const member = this.request.user;
      const { message, currencyId, stallions, cartId,fullName } = localBoostCartDto;
      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.currencyId = currencyId;
      cartData.email = member['email'];
      cartData.memberId = member['id'];
      cartData.fullName = fullName;
      cartData.createdBy = member['id'];

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );

      const product = await this.productsService.findOne({
        productCode: PRODUCTCODES.BOOST_LOCAL,
      });
      const pricingRes = await this.pricingService.findOne({
        productId: product?.id,
        currencyId,
      });
      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = product?.id;
      cartProductData.price = pricingRes
        ? pricingRes.price * stallions.length
        : 0;
      cartProductData.quantity = stallions.length;
      cartProductData.createdBy = member['id'];
      cartProductData.isIncludePrivateFee = false;

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];
      cartProductItemData.createdBy = member['id'];

      const createBoostProfileDto = new CreateLocalBoostProfileDto();
      createBoostProfileDto.createdBy = member['id'];
      createBoostProfileDto.message = message;
      createBoostProfileDto.boostTypeId = BOOST_TYPE.LOCAL;

      let localBoostProfileRes = await this.boostProfileService.create(
        createBoostProfileDto,
      );
      if (localBoostProfileRes)
        cartProductItemData.boostProfileId = localBoostProfileRes['id'];

      if (stallions.length > 0) {
        const createBoostStallionDto = new CreateBoostStallionDto();
        createBoostStallionDto.createdBy = member['id'];
        createBoostStallionDto.boostProfileId = localBoostProfileRes['id'];

        let result = await Promise.all(
          stallions.map(async (element) => {
            const stallion = await this.stallionsService.findOne(element);
            const cartProductItemData = new CartProductItemDto();
            cartProductItemData.cartProductId = cartProductResponse['id'];
            cartProductItemData.createdBy = member['id'];
            cartProductItemData.stallionId = stallion.id;
            cartProductItemData.boostProfileId = localBoostProfileRes['id'];
            
            createBoostStallionDto.stallionId = stallion.id;
             await this.boostStallionService.create(
              createBoostStallionDto,
            );
            await this.cartProductItemsService.create(cartProductItemData);
            
          }),
        );
      }

     // await this.cartProductItemsService.create(cartProductItemData);
      if (cartId) {
        await this.remove({ cartId });
      }
      return createCartResponse
     // return 'The record has been successfully created.';
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  // creating cart,cart-product and cart-product-items for extended-boost of registered
  async addExtendedBoost(extendedBoostCartDto: ExtendedBoostCartDto) {
    try {
      const member = this.request.user;
      const {
        message,
        currencyId,
        stallions,
        cartId,
        isSearched,
        isTracked,
        locations,
        fullName,
        damSireSearchedUsers,
      } = extendedBoostCartDto;
      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.currencyId = currencyId;
      cartData.email = member['email'];
      cartData.memberId = member['id'];
      cartData.fullName = fullName;
      cartData.createdBy = member['id'];

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );

      const product = await this.productsService.findOne({
        productCode: PRODUCTCODES.BOOST_EXTENDED,
      });
      const pricingRes = await this.pricingService.findOne({
        productId: product?.id,
        currencyId,
      });
      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = product?.id;
      cartProductData.price = pricingRes
        ? pricingRes.price * stallions.length
        : 0;
      cartProductData.quantity = stallions.length;
      cartProductData.createdBy = member['id'];
      cartProductData.isIncludePrivateFee = false;

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];
      cartProductItemData.createdBy = member['id'];

      const createBoostProfileDto = new CreateExtendedBoostProfileDto();
      createBoostProfileDto.createdBy = member['id'];
      createBoostProfileDto.message = message;
      createBoostProfileDto.boostTypeId = BOOST_TYPE.EXTENDED;
      createBoostProfileDto.isSearchedFarmStallion = isSearched;
      createBoostProfileDto.isTrackedFarmStallion = isTracked;

      let boostProfileRes = await this.boostProfileService.create(
        createBoostProfileDto,
      );
      if (boostProfileRes)
        cartProductItemData.boostProfileId = boostProfileRes['id'];

      if (stallions.length > 0) {
        const createBoostStallionDto = new CreateBoostStallionDto();
        createBoostStallionDto.createdBy = member['id'];
        createBoostStallionDto.boostProfileId = boostProfileRes['id'];

        let result = await Promise.all(
          stallions.map(async (element) => {
            const stallion = await this.stallionsService.findOne(element);
            createBoostStallionDto.stallionId = stallion.id;
            const cartProductItemData = new CartProductItemDto();
            cartProductItemData.cartProductId = cartProductResponse['id'];
            cartProductItemData.createdBy = member['id'];
            cartProductItemData.stallionId = stallion.id;
            cartProductItemData.boostProfileId = boostProfileRes['id'];
            await this.cartProductItemsService.create(cartProductItemData);
            return await this.boostStallionService.create(
              createBoostStallionDto,
            );
          }),
        );
      }

      if (locations.length > 0) {
        const createBoostUserLocationDto = new CreateBoostUserLocationDto();
        createBoostUserLocationDto.createdBy = member['id'];
        createBoostUserLocationDto.boostProfileId = boostProfileRes['id'];

        let result = await Promise.all(
          locations.map(async (element) => {
            createBoostUserLocationDto.countryId = element;
            return await this.boostUserLocationService.create(
              createBoostUserLocationDto,
            );
          }),
        );
      }

      if (damSireSearchedUsers.length > 0) {
        const createBoostSearchedDamsireDto =
          new CreateBoostSearchedDamsireDto();
        createBoostSearchedDamsireDto.createdBy = member['id'];
        createBoostSearchedDamsireDto.boostProfileId = boostProfileRes['id'];

        let result = await Promise.all(
          damSireSearchedUsers.map(async (element) => {
            const horse = await this.horsesService.findOne(element);
            createBoostSearchedDamsireDto.horseId = horse.id;
            return await this.boostSearchedDamsireService.create(
              createBoostSearchedDamsireDto,
            );
          }),
        );
      }

    
      if (cartId) {
        await this.remove({ cartId });
      }
      return createCartResponse
   //   return 'The record has been successfully created.';
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  // getting total shortlisted users count for boost-profiles based on selcted options
  async getPotentialAudience(extendedBoostCartDto: PotentialAudienceDto) {
    const member = this.request.user;
    extendedBoostCartDto.createdBy = member['id'];
    let result = await this.boostProfileService.getBoostProfileRecipients(
      extendedBoostCartDto,
    );
    return { totalUsersCount: result.length };
  }

  //getting all added cart details list based on loggedin member
  async findAll(searchOptionsDto: PageOptionsDto) {
    const member = this.request.user;

    const queryBuilder = this.cartRepository
      .createQueryBuilder('cart')
      .select(
        'cart.id as cartId, cart.cartSessionId as cartSessionId, cart.currencyId as currencyId,cart.countryId as countryId',
      )
      .addSelect(
        'cartProduct.id as cartProductId,cartProduct.productId as productId, cartProduct.price as price, cartProduct.quantity as quantity, cartProduct.selectedpriceRange as selectedpriceRange',
      )
      .addSelect('cartProductItem.sales, cartProductItem.lotId,cartProductItem.stallionNominationId')
      .addSelect(
        'product.productName as productName, product.productCode as productCode',
      )
      .addSelect('farm.farmUuid as farmId, farm.farmName as farmName')
      .addSelect('stallion.stallionUuid as stallionId')
      .addSelect('stallionhorse.horseName as stallionName')
      .addSelect('mare.horseUuid as mareId, mare.horseName as mareName')
      .addSelect(
        'currency.currencyName as currencyName, currency.currencyCode as currencyCode,currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'stallionPromotion.promotionUuid as stallionPromotionId,stallionPromotion.endDate as expiryDate',
      )
      .addSelect(
        'nominationrequest.nrUuid as nominationId, CASE WHEN nominationrequest.mareId IS NULL THEN nominationrequest.mareName END as nominationMareName',
      )
      .addSelect('saleslot.horseGender as horseGender')
      .leftJoin('cart.cartProduct', 'cartProduct')
      .leftJoin('cart.currency', 'currency')
      .leftJoin('cartProduct.product', 'product')
      .innerJoin('cartProduct.cartProductItem', 'cartProductItem')
      .leftJoin('cartProductItem.farm', 'farm')
      .leftJoin('cartProductItem.horse', 'mare')
      .leftJoin('cartProductItem.stallion', 'stallion')
      .leftJoin('stallion.horse', 'stallionhorse')
      .leftJoin('cartProductItem.stallionPromotion', 'stallionPromotion')
      .leftJoin('cartProductItem.nominationrequest', 'nominationrequest')
      .leftJoin('cartProductItem.saleslot', 'saleslot')
      .leftJoin('nominationrequest.mare', 'nominationmare')
      .andWhere('cart.email=:emailId', { emailId: member['email'] });

    queryBuilder.orderBy('cart.id', searchOptionsDto.order);

    const entities = await queryBuilder.getRawMany();
    const keys = ['cartId'];
    const filtered = entities.filter(
      (
        (s) => (o) =>
          ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join('|'))
      )(new Set()),
    );
    return filtered;
  }

  // getting stallion-promotion product related cart items list
  async findPromotedStallionProduct(emailId) {
    const queryBuilder = this.cartRepository
      .createQueryBuilder('cart')
      .select(
        'cart.id as cartId, cart.cartSessionId as cartSessionId, cart.currencyId as currencyId,cart.countryId as countryId',
      )
      .addSelect(
        'cartProduct.id as cartProductId,cartProduct.productId as productId, cartProduct.price as price, cartProduct.quantity as quantity',
      )
      .addSelect('product.productName as productName')
      .addSelect('stallion.stallionUuid as stallionId')
      .addSelect('stallionhorse.horseName as stallionName')
      .addSelect(
        'currency.currencyName as currencyName, currency.currencyCode as currencyCode',
      )
      .addSelect(
        'stallionPromotion.promotionUuid as stallionPromotionId,stallionPromotion.endDate as expiryDate',
      )
      .leftJoin('cart.cartProduct', 'cartProduct')
      .leftJoin('cart.currency', 'currency')
      .leftJoin('cartProduct.product', 'product')
      .innerJoin('cartProduct.cartProductItem', 'cartProductItem')
      .leftJoin('cartProductItem.stallion', 'stallion')
      .leftJoin('stallion.horse', 'stallionhorse')
      .leftJoin('cartProductItem.stallionPromotion', 'stallionPromotion')
      .andWhere('cart.email=:emailId', { emailId: emailId })
      .andWhere('product.productCode=:productCode', {
        productCode: PRODUCTCODES.PROMOTION_STALLION,
      })
      .getRawMany();

    return queryBuilder;
  }

  //getting single cart details
  async getItemInfo(cartId) {
    const record = await this.cartRepository.findOne({ cartSessionId: cartId });
    if (!record) {
      throw new UnprocessableEntityException('Cart Product not exist!');
    }

    const queryBuilder = this.cartRepository
      .createQueryBuilder('cart')
      .select(
        'cart.cartSessionId as cartSessionId, cart.currencyId as currencyId,cart.countryId as countryId',
      )
      .addSelect(
        'cartProduct.id as cartProductId,cartProduct.productId as productId, cartProduct.price as price, cartProduct.quantity as quantity, cartProduct.selectedpriceRange as selectedpriceRange, cartProduct.isIncludePrivateFee as isIncludePrivateFee,cartProduct.currencyId as cartCurrencyId',
      )
      .addSelect(
        'cartProductItem.commonList, cartProductItem.sales, cartProductItem.lotId',
      )
      .addSelect('product.productName as productName')
      .addSelect('pricing.price as individualPrice ')
      .addSelect('farm.farmUuid as farmId, farm.farmName as farmName')
      .addSelect('stallion.stallionUuid as stallionId')
      .addSelect(
        'mare.horseUuid as mareId, mare.horseName as mareName, mare.yob as mareYob',
      )
      .addSelect(
        'marelocation.id as mareLocationId, marelocation.countryName as mareLocation',
      )
      .addSelect(
        'currency.currencyName as currencyName, currency.currencyCode as currencyCode,currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'reportCurrency.currencyName as reportCurrencyName, reportCurrency.currencyCode as  reportCurrencyCode ,reportCurrency.currencySymbol as reportCurrencySymbol',
      )
      .addSelect(
        'stallionPromotion.promotionUuid as stallionPromotionId, stallionPromotion.endDate as expiryDate',
      )
      .addSelect('stallionhorse.horseName as stallionName')
      .addSelect('saleslot.horseGender as horseGender')
      .addSelect(
        'nominationrequest.nrUuid as nominationId, CASE WHEN nominationrequest.mareId IS NULL THEN nominationrequest.mareName END as nominationMareName',
      )
      .leftJoin('cart.cartProduct', 'cartProduct')
      .leftJoin('cartProduct.reportCurrency','reportCurrency')
      .leftJoin('cart.currency', 'currency')
      .leftJoin('cartProduct.product', 'product')
      .leftJoin('product.pricing', 'pricing')
      .innerJoin('cartProduct.cartProductItem', 'cartProductItem')
      .leftJoin('cartProductItem.farm', 'farm')
      .leftJoin('cartProductItem.stallion', 'stallion')
      .leftJoin('stallion.horse', 'stallionhorse')
      .leftJoin(
        'cartProductItem.horse',
        'mare',
        'mare.isVerified=1 AND mare.isActive=1',
      )
      .leftJoin('cartProductItem.stallionPromotion', 'stallionPromotion')
      .leftJoin('mare.nationality', 'marelocation')
      .leftJoin('cartProductItem.nominationrequest', 'nominationrequest')
      .leftJoin('cartProductItem.saleslot', 'saleslot')
      .leftJoin('nominationrequest.mare', 'nominationmare')
      .andWhere('cart.id=:id', { id: record.id });

    const entities = await queryBuilder.getRawMany();
    const keys = ['stallionId'];
    const key =['lotId']
    const filteredlots = entities.filter(
      (
        (s) => (o) =>
          ((k) => !s.has(k) && s.add(k))(key.map((k) => o[k]).join('|'))
      )(new Set()),
    ); 
    const filtered = entities.filter(
      (
        (s) => (o) =>
          ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join('|'))
      )(new Set()),
    );
    const productRSA = await this.productsService.findOne({
      productCode: PRODUCTCODES.REPORT_STALLION_AFFINITY,
    });
    if (
      filtered.length > 0 &&
      filtered[0].productId == productRSA?.id &&
      filtered[0].commonList
    ) {
      const arr = filtered[0].commonList.split(',');
      const result = await Promise.all(
        arr.map(async (elment) => {
          const farmObj = await this.farmsService.findOne({ id: elment });
          return { farmId: farmObj.farmUuid, farmName: farmObj.farmName };
        }),
      ).then((res) => {
        return res;
      });
      filtered[0].commonList = result;
    }

    const productRSMS = await this.productsService.findOne({
      productCode: PRODUCTCODES.REPORT_STALLION_MATCH_SALES,
    });
    const productRSBSS = await this.productsService.findOne({
      productCode: PRODUCTCODES.REPORT_STALLION_BREEDING_STOCK_SALE,
    });
    if (filtered.length > 0 && (filtered[0].productId == productRSMS?.id || filtered[0].productId == productRSBSS?.id)) {
      let subEntity = await queryBuilder.getRawOne();
      // const countryQueryBuilder = await getRepository(Country)
      //   .createQueryBuilder('country')
      //   .select('country.countryName')
      //   .andWhere('country.id =:countryId', { countryId: subEntity.commonList })
      //   .getOne();
      // subEntity.commonList = {
      //   id: subEntity.commonList,
      //   locationName: countryQueryBuilder.countryName,
      // };
      let commonList = [];
      filtered.forEach(async (element) => {
        commonList.push(element.commonList);
      });
      subEntity.commonList = commonList;
      if (subEntity.sales) {
        const salesArr = subEntity.sales.split(',');
        subEntity.sales = await Promise.all(
          salesArr.map(async (element) => {
            const saleQueryBuilder = await getRepository(Sale)
              .createQueryBuilder('sale')
              .select('sale.salesName')
              .andWhere('sale.id =:id', { id: element })
              .getOne();

            return { id: element, salesName: saleQueryBuilder.salesName };
          }),
        );
      }
      const lotNumbers = await Promise.all(
        filteredlots.map(async (element) => {
          const lotObj = await getRepository(SalesLot).findOne({ Id: element.lotId });
          return lotObj ? lotObj.lotNumber : null;
        })
      );
      subEntity.lotNumber = lotNumbers;
      let salesLot = [];
      filteredlots.forEach(async (element) => {
        salesLot.push(element.lotId);
      });
      subEntity.lotId = salesLot;

      return [subEntity];

      
    }

    return filtered;
  }

  async findOne(feilds) {
    const cartRes = await this.cartRepository.find({
      where: feilds,
    });
    return cartRes;
  }

  //updating cart item details based on cart id
  async update(createCartProductDto: CreateCartProductDto) {
    try {
      const member = this.request.user;

      const { productId, price, quantity, items, isIncludePrivateFee } = createCartProductDto;
      const cartUuid = uuidv4();
      let cartData = new CartDto();
      cartData.cartSessionId = uuidv4();
      cartData.memberId = member['id'];
      cartData.createdBy = member['id'];

      const createCartResponse = await this.cartRepository.save(
        this.cartRepository.create(cartData),
      );
      const cartProductData = new CartProductDto();
      cartProductData.cartId = createCartResponse['id'];
      cartProductData.productId = productId;
      cartProductData.price = price;
      cartProductData.quantity = quantity;
      cartProductData.createdBy = member['id'];
      cartProductData.isIncludePrivateFee = isIncludePrivateFee ? isIncludePrivateFee : false;

      const cartProductResponse = await this.cartProductService.create(
        cartProductData,
      );
      const cartProductItemData = new CartProductItemDto();
      cartProductItemData.cartProductId = cartProductResponse['id'];
      cartProductItemData.createdBy = member['id'];

      items.forEach(async (element) => {
        const product = await this.productsService.findOne({ id: productId });

        //1=My Shortlist Report, 2=stallionMatchPro Report  5=stallion affinity report, 6=broodMare Sire Report, 7=local boost report, 8=extended boost report
        if (
          product?.productCode == PRODUCTCODES.REPORT_SHORTLIST_STALLION ||
          product?.productCode == PRODUCTCODES.REPORT_STALLION_MATCH_PRO ||
          product?.productCode == PRODUCTCODES.REPORT_STALLION_AFFINITY ||
          product?.productCode == PRODUCTCODES.REPORT_BROODMARE_SIRE ||
          product?.productCode == PRODUCTCODES.BOOST_LOCAL ||
          product?.productCode == PRODUCTCODES.BOOST_EXTENDED
        ) {
          const stallion = await this.stallionsService.findOne(element);
          cartProductItemData.stallionId = stallion.id;
          await this.cartProductItemsService.create(cartProductItemData);
        }
        //9=Promoted stallion report
        if (product?.productCode == PRODUCTCODES.PROMOTION_STALLION) {
          cartProductItemData.stallionPromotionId = parseInt(element);
          await this.cartProductItemsService.create(cartProductItemData);
        }
        if (product?.productCode == PRODUCTCODES.NOMINATION_STALLION) {
          cartProductItemData.stallionNominationId = parseInt(element);
          await this.cartProductItemsService.create(cartProductItemData);
        }
        //3=broodmare affinity report
        if (product?.productCode == PRODUCTCODES.REPORT_BROODMARE_AFFINITY) {
          const mare = await this.horsesService.findOne(element);
          cartProductItemData.mareId = mare.id;
          await this.cartProductItemsService.create(cartProductItemData);
        }
      });

      return createCartResponse;
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  //removing cart item details based on cart id
  async remove(deleteCartDto: DeleteCartDto) {
    const record = await this.cartRepository.findOne({
      cartSessionId: deleteCartDto.cartId,
    });
    const subrecord = await this.cartProductService.findByCartId(record.id);
    const productItems =
      await this.cartProductItemsService.findByCartProductItems({
        cartProductId: subrecord[0].id,
      });
    const selectedIds = productItems.map(({ id }) => id);
    if (!record) {
      throw new UnprocessableEntityException('Cart Product not exist!');
    }
    let product = await this.productsService.findOne({
      id: subrecord[0].productId,
    });

    if (product && product.productCode == 'PROMOTION_STALLION') {
      this.stallionPromotionService.delete({
        id: productItems[0]?.stallionPromotionId,
      });
    }

    await this.cartProductItemsService.deleteMany(selectedIds);
    await this.cartProductService.delete(subrecord[0].id);
    const response = await this.cartRepository.delete({ id: record.id });
    return response;
  }

  //removing cart details only based on cart id
  async deleteById(deleteCartDto) {
    const record = await this.cartProductService.findByCartId(
      deleteCartDto.cartId,
    );
    if (!record) {
      throw new UnprocessableEntityException('Cart Product not exist!');
    }
    const member = this.request.user;
    const response = await this.cartRepository.delete({
      id: deleteCartDto.cartId,
    });
    return response;
  }
  async convertCurrency(currencyConversionCartDto:CurrencyConversionCartDto){
    const { cartList, currencyId } = currencyConversionCartDto;
    let cart = JSON.parse(JSON.stringify(cartList));
//    const list = []
      for(let item of cart ){  
      const record = await this.cartRepository.findOne({ cartSessionId: item.cartId });
      if (!record) {
        throw new UnprocessableEntityException('Cart not exist!');
      }
      let toCurrency = await this.currenciesService.findCurrencyRateByCurrencyId(currencyId)
      let fromCurrency = await this.currenciesService.findCurrencyRateByCurrencyId(record.currencyId)
      let priceData =  await this.cartProductService.findByCartId(
        record.id,
      );
      if(priceData[0]?.price){
      let finalPrice =Math.round((priceData[0].price) * (toCurrency.rate/fromCurrency.rate)).toFixed(2)
      let updatedCartProduct:UpdateResult = await getRepository(CartProduct).update({cartId: record.id},{price:parseInt(finalPrice)})
      let updatedCart :UpdateResult= await getRepository(Cart).update({cartSessionId: item.cartId},{currencyId:currencyId})
      if (updatedCartProduct.affected && updatedCart.affected> 0) {
        var priceObj = {
          cartId :item.cartId ,
          price : parseInt(finalPrice),
          toCurrency : toCurrency.currencyCode,
          currencySymbol : toCurrency.currencySymbol,
          currencyId : toCurrency.currencyId
        }
        return priceObj
      }
     
    //   list.push(priceObj)
      }
      else{
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Something Went Wrong ',
        };
      }
      
    }
    
 }
}
