import { Injectable, Scope } from '@nestjs/common';
import { getRepository, Repository } from 'typeorm';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { SearchMostMatchedDamSireOptionDto } from './dto/search-most-matched-dam-sire-option.dto';

@Injectable({ scope: Scope.REQUEST })
export class StallionReportService {
  constructor(private stallionRepository: Repository<Stallion>) {}

  /* Get all Stallion Matched Mares */
  async findMatchedMares(searchOptionsDto: SearchMostMatchedDamSireOptionDto) {
    const queryBuilder = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.stallionUuid as stallionId')
      .addSelect('horse.id as horseId')
      .innerJoin('stallion.horse', 'horse', 'horse.isVerified=1')
      .andWhere('stallion.stallionUuid =: stallionUuid', {
        stallionUuid: searchOptionsDto.stallionId,
      });

    const entities = await queryBuilder.getRawOne();
    const finalData = await this.stallionRepository.manager.query(
      `EXEC proc_SMPColorMatchPedigreeHypoSW 
                     @phyposire=@0,
                     @phypodam=@1,
                     @StakeWinnerHorseID=@2,
                     @pgen=@3`,
      [entities.horseId, entities.sireId, entities.horseId, 3],
    );

    return finalData;
  }
}
