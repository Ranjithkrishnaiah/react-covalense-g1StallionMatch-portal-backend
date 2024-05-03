import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { StallionTestimonial } from 'src/stallion-testimonials/entities/stallion-testimonial.entity';
import { Media } from 'src/media/entities/media.entity';

@Entity('tblStallionTestimonialMedia')
export class StallionTestimonialMedia extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  testimonialId: number;

  @Column({ nullable: true })
  mediaId: number;

  @ManyToOne(() => StallionTestimonial)
  @JoinColumn({ name: 'testimonialId', referencedColumnName: 'id' })
  stalliontestimonial: StallionTestimonial;

  @ManyToOne(() => Media)
  @JoinColumn({ name: 'mediaId', referencedColumnName: 'id' })
  media: Media;
}
