import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository } from 'typeorm';
import { PromoCodeResponseDto } from './dto/promo-code-response.dto';
import { PromoCode } from './entities/promo-code.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { GetPromoCodeDto } from './dto/get-promo-code.dto';
import { MembersService } from 'src/members/members.service';

@Injectable()
export class PromoCodeService {
  constructor(
    @InjectRepository(PromoCode)
    @Inject(REQUEST)
    private readonly request: Request,
    private readonly membersService: MembersService,
  ) {}

  /* Get all records */
  async findAll(): Promise<PromoCodeResponseDto[]> {
    const queryBuilder = getRepository(PromoCode)
      .createQueryBuilder('PromoCode')
      .select(
        'PromoCode.id as id, PromoCode.promoCode as promoCode,PromoCode.discountType as discountType, PromoCode.price as discountValue, PromoCode.currencyId as currencyId',
      );
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  /* Get a record */
  async findOne(getPromoCodeDto: GetPromoCodeDto) {
    let member;

    if (getPromoCodeDto.memberuuid) {
      member = await this.membersService.findByFilelds({
        memberuuid: getPromoCodeDto.memberuuid,
      });
    }

    const queryBuilder = getRepository(PromoCode)
      .createQueryBuilder('PromoCode')
      .select(
        'PromoCode.id as id, PromoCode.promoCode as promoCode, PromoCode.redemtions as redemtions,PromoCode.discountType as discountType,PromoCode.startDate as startDate ,PromoCode.endDate as endDate, PromoCode.price as discountValue, PromoCode.currencyId as currencyId, PromoCode.productids as productIds, PromoCode.userIds as restrictMemberIds',
      )
      .andWhere('PromoCode.PromoCode=:promoCode', {
        promoCode: getPromoCodeDto.promoCode,
      })
      .andWhere('PromoCode.isActive = 1');

    const entities = await queryBuilder.getRawOne();

    if (!entities) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Please enter a valid promo code`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (
      entities &&
      entities.discountType == 'Fixed' &&
      entities.discountValue >= getPromoCodeDto.totalAmount
    ) {
      throw new UnprocessableEntityException(
        'Minimum cart value shoulb be ' + entities.discountValue,
      );
    } else {
      let productIds = [];
      if (entities.productIds) {
        productIds = entities.productIds.split(',');
        productIds.map((ele, i) => {
          productIds[i] = +ele;
        });
        productIds = productIds.filter((element) => {
          return element > 0;
        });
      }

      let restrictMemberIds = entities.restrictMemberIds?.split(',');
      restrictMemberIds?.map((ele, i) => {
        restrictMemberIds[i] = +ele;
      });

      if (member && restrictMemberIds?.includes(member['id'])) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: `Please enter a valid promo code`,
          },
          HttpStatus.FORBIDDEN,
        );
      } else if (
        productIds.length &&
        ![...new Set(getPromoCodeDto.productIds)].some((ele) =>
          productIds.includes(ele),
        )
      ) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: `Please enter a valid promo code`,
          },
          HttpStatus.FORBIDDEN,
        );
      } else 
      if (
        entities &&
        entities.startDate  &&
        entities.endDate 
      ) {
        const today = new Date();
        const startDate = new Date(entities.startDate);
        const endDate = new Date(entities.endDate);
        if (!(today >= startDate && today <= endDate)) {
          throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: `Promo code has expired. Please enter a valid promo code.`,
          },
          HttpStatus.FORBIDDEN,
          )
        }
      }
      if (entities.redemtions < 1) {
  
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: `Sorry, the promo code has already been redeemed. Please enter a valid promo code.`,
          },
          HttpStatus.FORBIDDEN,
        );
      }
      {
        return entities;
      }
    }
  }

  /* verify a record */
  async verifyPromoCode(promoCode: any, products: any) {
    const member = this.request.user || { id: 1 };
    if (!member) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Member Not exists`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const queryBuilder = getRepository(PromoCode)
      .createQueryBuilder('PromoCode')
      .select(
        'PromoCode.id as id, PromoCode.promoCode as promoCode, PromoCode.discountType as discountType, PromoCode.price as discountValue, PromoCode.currencyId as currencyId, PromoCode.startDate, PromoCode.endDate',
      )
      .andWhere('promoCode = :promoCode', { promoCode })
      .andWhere('PromoCode.redemtions = :redemtions', { redemtions: 1 })
      .orWhere('PromoCode.userids like :userids', {
        userids: `%${member['id']}%`,
      });

    if (products) {
      queryBuilder.orWhere('PromoCode.Productids like :productids', {
        productids: `%${products}%`,
      });
    }
    const entities = await queryBuilder.getRawOne();
    if (
      entities.startDate &&
      !this.dateCheck(entities.startDate, entities.endtDate)
    ) {
      throw new UnprocessableEntityException('Coupan date is expired!');
    }
    if (!entities) {
      throw new UnprocessableEntityException('Coupan not exist!');
    }
    return 'coupon is applicable';
  }

  /* Check Given Date Range */
  dateCheck(from, to) {
    var fDate, lDate, cDate;
    fDate = Date.parse(from);
    lDate = Date.parse(to);
    cDate = new Date();

    if (cDate <= lDate && cDate >= fDate) {
      return true;
    }
    return false;
  }
}
