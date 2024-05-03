import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BreederEntity {
  @PrimaryGeneratedColumn()
  id: 1;

  @Column()
  searches: number;

  @Column()
  views: number;

  @Column()
  breederName: string;

  @Column()
  countryCode: string;

  @BeforeInsert()
  load() {}
}
